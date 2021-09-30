let Parser = (function () {

	function parse(tokenList) {
		return readModule(new Tokens(tokenList));
	}

	function readModule(tokens) {
		let defs = [];

		while (tokens.hasNext()) {
			let t = tokens.next();
			switch (t.type) {
				case KEYWORD: defs.push(readDefinition(t, tokens));
				case LINEBREAK:
				case COMMENT:
				case META: break;
				default: throw new Error('syntax error', t);
			}
		}

		return new Module(defs);
	}

	function readDefinition(t, tokens) {
		switch(t.data) {
			case 'fun': return readFunction(t, tokens);
			case 'let':
			case 'class':
			case 'public':
			case 'private':
			case 'protected': throw new Error('not yet implemented', t);
			default: throw new Error('syntax arror', t);
		}
	}

	function readFunction(t, tokens) {
		let name = matchType(tokens.next(), NAME);
		match(tokens.next(), '(');
		let params = collect(tokens, readParameter, ')', ',');
		t = tokens.next();
		let type;
		
		if (t.data === ':') {
			type = readType(tokens);
			t = tokens.next();
		}

		let body;
		switch (t.data) {
			case '{': body = collect(tokens, readStatement, '}', '\n'); break;
			case '=>': body = [readStatement(tokens.next(), tokens)]; break;
		}

		return new Function(name, params, type, body);
	}

	function readParameter(t, tokens) {
		let name = matchType(t, NAME);
		match(tokens.next(), ':');
		let type = readType(tokens);
		return new Parameter(name, type);
	}

	function readType(tokens) {
		return matchType(tokens.next(), NAME);
	}

	function readStatement(t, tokens) {
		if (t.type === NAME) {
			return readCall(t, tokens);
		}
		throw new Error('syntax error', t);
	}

	function readExpression(t, tokens) {
		switch (t.type) {
			case NUMBER:
			case STRING: return t;
			case NAME: return readCall(t, tokens);
		}
		throw new Error('systax error', t);
	}

	function readCall(t, tokens) {
		let name = t;
		match(tokens.next(), '(');
		let args = collect(tokens, readExpression, ')', ',');
		return new Call(name, args);
	}

	function collect(tokens, read, delimiter, separator) {
		let list = [];
		let counter = 0;

		while (tokens.hasNext()) {
			let t = tokens.next();
			if (t.data === delimiter) return list;
			if (separator && counter > 0) {
				match(t, separator);
				t = tokens.next();
			}
			list.push(read(t, tokens));
			counter++;
		}

		throw new Error('end of file');
	}

	function match(token, data) {
		if (token.data !== data) throw new Error('syntax error', token);
		return token;
	}

	function matchType(token, type) {
		if (token.type !== type) throw new Error('syntax error', token);
		return token;
	}

	class Tokens {

		constructor(tokenList) {
			this.tokenList = tokenList;
			this.index = 0;
		}

		hasNext() {
			return (this.index < this.tokenList.length);
		}

		next() {
			if (!this.hasNext()) throw new Error('end of file');
			return this.tokenList[this.index++];
		}

	}

	class Error {

		constructor(message, token) {
			this.message = message;
			this.token = token;
		}

	}

	return { parse: (tokens) => parse(tokens) };

})();