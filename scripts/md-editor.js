(function () {

	let hidden = new WeakMap();

	const ENTER = 'Enter';
	const TAB_KEY = 'Tab';
	const BACKSPACE = 'Backspace';

	class MdEditor extends HTMLElement {

		constructor() {
			super();

			let panel = document.createElement('div');
			panel.classList.add('md-editor');
			panel.contentEditable = true;

			panel.appendChild(createLine('Void main() => println("Hello world!")'));

			panel.addEventListener('keydown', (event) => {
				switch (event.key) {
					case ENTER:
						event.preventDefault();
						hidden[this].lineBreak();
						break;
					case TAB_KEY:
						event.preventDefault();
						document.execCommand('insertText', false, '    ');
						break;
					case BACKSPACE: break;
				}
			});

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);

			let isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
			let root = isFirefox ? window : shadowRoot

			hidden[this] = {
				getPosition: () => getPosition(root),
				setPosition: (line, index) => setPosition(root, line, index),
				lineBreak: () => lineBreak(root, panel)
			};
		}
	}

	customElements.define('md-editor', MdEditor);

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
		while (index >= tokens[t].innerText.length) {
			index -= tokens[t].innerText.length;
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
				selected.innerHTML = `<span>${text.substring(0, breakPoint)}</span>`;
				line.innerHTML = `<span>${text.substring(breakPoint, text.length)}</span>`;
		}

		let nextLine = selected.nextSibling;
		if (nextLine) {
			panel.insertBefore(line, nextLine);
		} else {
			panel.appendChild(line);
		}

		setPosition(root, line, 0);

	}

	function createLine(text) {
		let line = document.createElement('LINE');
		let span = document.createElement('SPAN');
		let node = document.createTextNode(text);

		span.appendChild(node);
		line.appendChild(span);
		return line;
	}

})();