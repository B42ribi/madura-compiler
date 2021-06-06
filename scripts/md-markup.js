let MarkUp = (function () {

	const NBSP = '\xA0'; 

	function markUpLine(line, text) {
		let tokens = Scanner.parse(text ? text : line.innerText);
		line.innerHTML = '';

		for (let t of tokens) {
			let item = document.createElement('span');
			item.appendChild(document.createTextNode((t.type === LINEBREAK) ? NBSP : t.data));
			line.appendChild(item);

			switch (t.type) {
				case KEYWORD: item.classList.add('md-keyword'); break;
				case NAME: if (startsWithUppercase(t.data)) item.classList.add('md-type'); break;
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

	function startsWithUppercase(text) {
		let c = text.charCodeAt(0);
		return (c >= UPPER_A && c <= UPPER_Z);
	}

	function markUpCode(text) {
		if (text) {
			let lines = [];
			let tabCounter = 0;
			for (let t of text.split('\n')) {
				let segment = t.trim();
				if (segment.startsWith('}') && tabCounter > 0) --tabCounter;
				if (tabCounter > 0) segment = spaces(4 * tabCounter) + segment;
				if (segment.endsWith('{')) ++tabCounter;
				lines.push(createLine(segment));
			}

			return lines;
		} else {
			return [createLine()];
		}
	}

	function createLine(segment) {
		return markUpLine(document.createElement('line'), segment ? segment : NBSP);
	}

	function spaces(count) {
		let data = [];
		for (let i = 0; i < count; ++i) { data.push(NBSP); }
		return data.join('');
	}

	return {
		markUpLine: (line, text) => markUpLine(line, text),
		markUpCode: (text) => markUpCode(text)
	};

})();