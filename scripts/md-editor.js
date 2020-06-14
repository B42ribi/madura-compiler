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

			panel.addEventListener('keydown', (event) => {
				switch (event.key) {
					case ENTER:
						event.preventDefault();
						hidden[this].createLine('\xA0');
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
				createLine: (text) => createLine(root, panel, text)
			};
		}

		connectedCallback() {
			hidden[this].createLine('Void main() => println("Hello world!")');
		}

	}

	customElements.define('md-editor', MdEditor);

	function getPosition(root) {
		let sel = root.getSelection();
		let anchor = sel.anchorNode;
		while (anchor && anchor.tagName != 'SPAN') { anchor = anchor.parentNode; }
		if (anchor == null) return null;
		let line = anchor.parentNode;

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

	function createLine(root, panel, text) {
		let line = document.createElement('LINE');
		let span = document.createElement('SPAN');
		let node = document.createTextNode(text);

		span.appendChild(node);
		line.appendChild(span);

		let position = getPosition(root);

		if (position && position.line && position.line.nextSibling) {
			panel.insertBefore(line, position.line.nextSibling);
		} else {
			panel.appendChild(line);
		}

		setPosition(root, line, 0);
	}

})();