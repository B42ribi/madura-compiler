(function () {

	let hidden = new WeakMap();

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

			let panel = document.createElement('div');
			panel.classList.add('md-editor');
			panel.contentEditable = true;

			panel.addEventListener('keydown', (event) => {
				let position;
				switch (event.key) {
					case ENTER:
						event.preventDefault();
						hidden[this].lineBreak();
						break;
					case TAB_KEY:
						event.preventDefault();
						position = hidden[this].getPosition();
						document.execCommand('insertText', false, tabs(4 - (position.index % 4)));
						break;
					case BACKSPACE:
						position = hidden[this].getPosition();
						if (position.index === 0) {
							event.preventDefault();
							hidden[this].glueLines(position.line);
						}
						break;
				}
			});

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

				if (hidden[this].timer) { window.clearTimeout(hidden[this].timer); }
				hidden[this].timer = window.setTimeout(() => {
					let position = hidden[this].getPosition();
					hidden[this].markUp(position.line);
					hidden[this].setPosition(position.line, position.index);
				}, 10);
			});

			let style = document.createElement('LINK');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);

			let isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
			let root = isFirefox ? window : shadowRoot

			let scanner = new MdScanner();

			hidden[this] = {
				getPosition: () => getPosition(root),
				setPosition: (line, index) => setPosition(root, line, index),
				lineBreak: () => lineBreak(root, panel, scanner),
				glueLines: (line) => glueLines(root, panel, scanner, line),
				markUp: (line, text) => markUp(scanner, line, text)
			};

			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), 'fun main() => greet(100)'));
			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), '\xA0'));
			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), 'fun greet(count: I32) {'));
			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), '\xA0 \xA0 let message: String = "Hey x ${count}"'));
			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), '\xA0 \xA0 println(message)'));
			panel.appendChild(hidden[this].markUp(document.createElement('LINE'), '}'));
		}
	}

	customElements.define('md-editor', MdEditor);

	function tabs(count) {
		let data = [];
		for (let i = 0; i < count; ++i) { data.push(' '); }
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

	function lineBreak(root, panel, scanner) {
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
				markUp(scanner, selected, text.substring(0, breakPoint));
				markUp(scanner, line, text.substring(breakPoint, text.length));
		}

		let nextLine = selected.nextSibling;
		if (nextLine) {
			panel.insertBefore(line, nextLine);
		} else {
			panel.appendChild(line);
		}

		setPosition(root, line, 0);
	}

	function glueLines(root, panel, scanner, line) {
		let previousLine = line.previousSibling;
		if (previousLine) {
			let previousText = previousLine.innerText;
			markUp(scanner, previousLine, `${previousText}${line.innerText}`);
			panel.removeChild(line);
			setPosition(root, previousLine, previousText.length);
		}
	}

	function markUp(scanner, line, text) {
		let tokens = scanner.parse(text ? text : line.innerText);
		line.innerHTML = '';

		for (let t of tokens) {
			let item = document.createElement('span');
			item.appendChild(document.createTextNode(t.data));
			line.appendChild(item);

			switch (t.type) {
				case KEYWORD: item.classList.add('md-keyword'); break;
				case NAME: if (t.upper) item.classList.add('md-type'); break;
				case NUMBER: item.classList.add('md-number'); break;
				case STRING: item.classList.add('md-string'); break;
				case SYMBOL: item.classList.add('md-symbol'); break;
				case COMMENT: item.classList.add('md-comment'); break;
				case META: item.classList.add('md-meta'); break;
				case INVALID: item.classList.add('md-error'); break;
			}
		}

		return line;
	}

})();