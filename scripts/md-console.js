(function() {

	class MdConsole extends HTMLElement {

		constructor() {
			super();

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-editor.css";

			let panel = document.createElement('div');
			panel.classList.add('md-canvas');
			this._panel = panel

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);

			this.info('Welcome to Madura');
		}

		print(text) {
			this._panel.appendChild(createLine(text));
		}

		info(text) {
			this._panel.appendChild(createLine(`<< ${text} >>`, 'md-keyword'));
		}

		error(text) {
			this._panel.appendChild(createLine(`error: ${text}`, 'md-error'));
		}
	}

	customElements.define('md-console', MdConsole);

	function createLine(text, style) {
		let segment = document.createElement('span');
		segment.appendChild(document.createTextNode(text));
		if (style) segment.classList.add(style);

		let line = document.createElement('line');
		line.appendChild(segment);
		return line;
	}

})();