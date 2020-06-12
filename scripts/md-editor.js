(function () {

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

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);
			shadowRoot.appendChild(button);
		}

	}

	customElements.define('md-editor', MdEditor);

})();