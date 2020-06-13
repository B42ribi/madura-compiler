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
				getSelection: () => getSelection(root),
				setSelection: (anchor, offset) => setSelection(root, anchor, offset),
				createLine: (text) => createLine(root, panel, text)
			};
		}

		connectedCallback() {
			hidden[this].createLine('Void main() => println("Hello world!")');
		}

	}

	customElements.define('md-editor', MdEditor);

	function getSelectedLine(root) {
		let sel = root.getSelection();
		let node = sel.anchorNode;
		while (node != null && node.tagName != 'LINE') { node = node.parentNode; }
		return node;
	}

	function setSelection(root, anchor, offset) {
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

		let selected = getSelectedLine(root);

		if (selected != null && selected.nextSibling != null) {
			panel.insertBefore(line, selected.nextSibling);
		} else {
			panel.appendChild(line);
		}

		setSelection(root, span.firstChild, 0);
	}

})();