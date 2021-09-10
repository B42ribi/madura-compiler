(function() {

	class MdNavigation extends HTMLElement {

		constructor() {
			super();

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-navigation.css";
			
			let button = document.createElement('button');
			button.classList.add('run');
			button.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M22.0013,12.0016,6.002,21.0029V3Z"></path></svg>';
			this._run = button;

			let panel = document.createElement('div');
			panel.classList.add('md-navigation');
			panel.appendChild(button);

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);

			document.addEventListener("DOMContentLoaded", () => init(button));
		}
	}

	customElements.define('md-navigation', MdNavigation); 

	function init(button) {
		let editor = document.getElementById('editor');
		let console = document.getElementById('console');

		if (editor && console) {
			button.addEventListener('click', () => run(editor, console));
		}
	}

	function run(editor, console) {
		let tokens = Lexer.scan(editor.getValue(), true);
		
		try {
			let program = Parser.parse(tokens);
			let main = program.functions['main'];
			if (main) main();
		} catch (e) {
			console.error(e);
		}
	}

})();