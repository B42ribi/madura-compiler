(function () {

	const ENTER = 'Enter';
	const TAB_KEY = 'Tab';
	const BACKSPACE = 'Backspace';

	class MdEditor extends HTMLElement {

		constructor() {
			super();
		}

		connectedCallback() {
			let panel = document.createElement('div');
			panel.classList.add('md-editor');
			panel.contentEditable = true;

			let button = document.createElement('button');
			button.innerHTML = "Parse";

			this.addEventListener('keydown', (event) => {
				switch (event.key) {
					case ENTER:
						event.preventDefault();
						console.log(window.getSelection());
						createLine(panel, '\xA0');
						break;
					case TAB_KEY:
						event.preventDefault();
						document.execCommand('insertText', false, '    ');
						break;
					case BACKSPACE: break;
				}
			});

			button.addEventListener('click', (event) => {
				let start = new Date();
				let scanner = new MdScanner();
				let tokens = scanner.parse(panel.innerText);
				panel.innerHTML = mark(tokens);
				let end = new Date();
				console.log(`${end.getTime() - start.getTime()} ms`);
				console.log(tokens);
			});

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			// let shadowRoot = this.attachShadow({ mode: 'closed' });
			this.appendChild(style);
			this.appendChild(panel);
			// this.appendChild(button);

			createLine(panel, 'Void main() => println("Hello world!")');
		}

	}

	customElements.define('md-editor', MdEditor);

	function createLine(panel, text) {
		let line = document.createElement('line');
		let span = document.createElement('span');
		let node = document.createTextNode(text);

		span.appendChild(node);
		line.appendChild(span);

		let selected = getSelectedLine();

		if (selected != null && selected.nextSibling != null) {
			panel.insertBefore(line, selected.nextSibling);
		} else {
			panel.appendChild(line);
		}

		setSelection(span.firstChild, 0);
	}

	function getSelectedLine() {
		let sel = window.getSelection();
		let node = sel.anchorNode;
		while (node != null && node.tagName != 'LINE') { node = node.parentNode; }
		return node;
	}

	function setSelection(anchor, offset) {
		let range = document.createRange();
		let sel = window.getSelection();
		range.setStart(anchor, offset);
		range.setEnd(anchor, offset);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
	}


})();