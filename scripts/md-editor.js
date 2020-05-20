(function () {

const STYLE =
`.md-editor {
	background-color: #293134;
	color: #E0E2E4;
	padding: 10px;
	font-family: "Consolas", monospace;
	font-size: 16pt;
	tab-size: 4;
}

.md-keyword { color: #93C763; }
.md-type { color: #678CB1; }
.md-meta { color: #A082BD; }
.md-comment { color: #7D8C93; }
.md-symbol { color: #E8E2B7; }
.md-number { color: #FFCD22; }
.md-string { color: #EC7600; }
.md-error { color: #BC3F3C; }
`;

const TAB_KEY = 9;
const BACKSPACE = 8;

class MdEditor extends HTMLElement {

	constructor() {
		super();

		let panel = document.createElement('div');
		panel.classList.add('md-editor');
		panel.contentEditable = true;

		let button = document.createElement('button');
		button.innerHTML = "Parse";

		panel.addEventListener('keydown', (event) => {
			switch (event.which) {
				case BACKSPACE: break;
				case TAB_KEY:
					event.preventDefault();
					document.execCommand('insertText', false, '    ');
					break;
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

		let style = document.createElement('style');
		style.innerHTML = STYLE;

		let shadowRoot = this.attachShadow({ mode: 'closed' });
		shadowRoot.appendChild(style);
		shadowRoot.appendChild(panel);
		shadowRoot.appendChild(button);
	}

}

customElements.define('md-editor', MdEditor);

})();