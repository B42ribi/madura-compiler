(function () {

	const ENTER = 'Enter';
	const TAB_KEY = 'Tab';
	const BACKSPACE = 'Backspace';

	const SHIFT = 'Shift'
	const CONTROL = 'Control'
	const ALT = 'Alt'

	const LEFT = 'ArrowLeft';
	const RIGHT = 'ArrowRight';
	const UP = 'ArrowUp';
	const DOWN = 'ArrowDown';
	const START = 'Home';
	const END = 'End';

	class MdEditor extends HTMLElement {

		constructor() {
			super();

			let style = document.createElement('LINK');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			let panel = document.createElement('div');
			panel.classList.add('md-editor');
			panel.contentEditable = true;

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);

			let isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
			let root = isFirefox ? window : shadowRoot

			initKeyDown(root, panel);
			initKeyUp(root, panel);

			this.setValue = (text) => {
				panel.innerHTML = '';
				let lines = MarkUp.markUpCode(text);
				lines.forEach(l => panel.appendChild(l));
			}
		}

		attributeChangedCallback(key, old, value) {
			if (key === 'src' && value) {
				fetch(value)
					.then(response => response.text())
					.then(data => this.setValue(data));
			}
		}

		static get observedAttributes() { return ['src']; }
	}

	customElements.define('md-editor', MdEditor);

	function tabs(count) {
		let data = [];
		for (let i = 0; i < count; ++i) { data.push('\xA0'); }
		return data.join('');
	}

	function getPosition(root) {
		// determine selected line
		let sel = root.getSelection();
		let anchor = sel.anchorNode;
		while (anchor && anchor.tagName != 'SPAN') { anchor = anchor.parentNode; }
		if (!anchor) { return null; }
		let line = anchor.parentNode;

		// determine selected index
		let tokens = line.getElementsByTagName('SPAN');
		let index = 0;
		let t = 0;
		while (tokens[t] !== anchor) {
			index += tokens[t].innerText.length;
			++t;
		}
		index += sel.anchorOffset;

		return { line: line, index: index };
	}

	function setPosition(root, line, index) {
		let tokens = line.getElementsByTagName('SPAN');
		let offset = index;
		let t = 0;
		while (offset > tokens[t].innerText.length) {
			offset -= tokens[t].innerText.length;
			++t;
		}

		let anchor = tokens[t].firstChild;
		let range = document.createRange();
		let sel = root.getSelection();
		range.setStart(anchor, offset);
		range.setEnd(anchor, offset);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	}

	function lineBreak(root, panel) {
		let position = getPosition(root);
		if (!position) { throw 'no line selected to apply linebreak to'; }

		let selected = position.line;
		let line = document.createElement('LINE');
		let breakPoint = position.index;

		switch (breakPoint) {
			case 0:
				line.innerHTML = selected.innerHTML;
				selected.innerHTML = '<span>\xA0</span>';
				break;
			case selected.innerText.length:
				line.innerHTML = '<span>\xA0</span>';
				break;
			default:
				let text = selected.innerText;
				MarkUp.markUpLine(selected, text.substring(0, breakPoint));
				MarkUp.markUpLine(line, text.substring(breakPoint, text.length));
		}

		let nextLine = selected.nextSibling;
		if (nextLine) {
			panel.insertBefore(line, nextLine);
		} else {
			panel.appendChild(line);
		}

		setPosition(root, line, 0);
	}

	function glueLines(root, panel, line) {
		let previousLine = line.previousSibling;
		if (previousLine) {
			let previousText = previousLine.innerText;
			MarkUp.markUpLine(previousLine, `${previousText}${line.innerText}`);
			panel.removeChild(line);
			setPosition(root, previousLine, previousText.length);
		}
	}

	function initKeyDown(root, panel) {
		panel.addEventListener('keydown', (event) => {
			let position;
			switch (event.key) {
				case ENTER:
					event.preventDefault();
					lineBreak(root, panel);
					break;
				case TAB_KEY:
					event.preventDefault();
					position = getPosition(root);
					document.execCommand('insertText', false, tabs(4 - (position.index % 4)));
					break;
				case BACKSPACE:
					position = getPosition(root);
					if (position.index === 0) {
						event.preventDefault();
						glueLines(root, panel, position.line);
					}
					break;
			}
		});
	}

	function initKeyUp(root, panel) {
		let clock = {};

		panel.addEventListener('keyup', (event) => {
			switch (event.key) {
				case SHIFT:
				case CONTROL:
				case ALT:
				case ENTER:
				case LEFT:
				case RIGHT:
				case UP:
				case DOWN:
				case START:
				case END: return;
			}

			if (clock.timer) { window.clearTimeout(clock.timer); }
			clock.timer = window.setTimeout(() => {
				let position = getPosition(root);
				MarkUp.markUpLine(position.line);
				setPosition(root, position.line, position.index);
			}, 10);
		});
	}

})();