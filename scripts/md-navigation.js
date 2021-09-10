(function() {

	class MdNavigation extends HTMLElement {

		constructor() {
			super();

			let style = document.createElement('link');
			style.rel = 'stylesheet';
			style.href = "styles/md-navigation.css";
			
			let run = document.createElement('button');
			run.classList.add('run');
			run.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M22.0013,12.0016,6.002,21.0029V3Z"></path></svg>';
			this._run = run;

			let panel = document.createElement('div');
			panel.classList.add('md-navigation');
			panel.appendChild(run);

			let shadowRoot = this.attachShadow({ mode: 'closed' });
			shadowRoot.appendChild(style);
			shadowRoot.appendChild(panel);
		}
	}

	customElements.define('md-navigation', MdNavigation);

})();