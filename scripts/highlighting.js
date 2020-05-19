function mark(tokens) {
	let template = [];

	for (let t of tokens) {
		switch (t.type) {
			case TokenType.LINEBREAK: template.push('<br>'); break;
			case TokenType.KEYWORD: template.push(`<span class="md-keyword">${t.data}</span>`); break;
			case TokenType.TYPE: template.push(`<span class="md-type">${t.data}</span>`); break;
			case TokenType.NUMBER: template.push(`<span class="md-number">${t.data}</span>`); break;
			case TokenType.STRING: template.push(`<span class="md-string">${t.data}</span>`); break;
			case TokenType.OPERATOR:
			case TokenType.ASSIGNMENT:
			case TokenType.COMPARISON: template.push(`<span class="md-symbol">${t.data}</span>`); break;
			case TokenType.COMMENT:
			case TokenType.SUBOPERATOR: template.push(`<span class="md-comment">${t.data}</span>`); break;
			case TokenType.CONSTANT:
			case TokenType.META: template.push(`<span class="md-meta">${t.data}</span>`); break;
			case TokenType.INVALID: template.push(`<span class="md-error">${t.data}</span>`); break;
			default: template.push(t.data);
		}

		keep = t.type;
	}

	return template.join('');
}