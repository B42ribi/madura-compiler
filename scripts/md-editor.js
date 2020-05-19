(function() {

const STYLE =
`.md-editor {
	background-color: #293134;
	color: #E0E2E4;
	padding: 10px;
	font-family: "Consolas", monospace;
	font-size: 16pt;
	tab-size: 4;
}`;

const TAB_KEY = 9;

class MdEditor extends HTMLElement {

	constructor() {
		super();
		this.time = new Date();

		let panel = document.createElement('div');
		panel.classList.add('md-editor');
		panel.contentEditable = true;
		
		let button = document.createElement('button');
		button.innerHTML = "Parse";

		panel.addEventListener('keydown', (event) => {
			if (event.which === TAB_KEY) {
				event.preventDefault();
				document.execCommand('insertText', false, '\t');
			}
		});

		button.addEventListener('click', (event) => {
			let scanner = new MdScanner();
			console.log(scanner.parse(panel.innerText));
		});

		let style = document.createElement('style');
		style.innerHTML = STYLE;

		let shadowRoot = this.attachShadow({mode: 'closed'});
		shadowRoot.appendChild(style);
		shadowRoot.appendChild(panel);
		shadowRoot.appendChild(button);
	}

}

customElements.define('md-editor', MdEditor);

})();