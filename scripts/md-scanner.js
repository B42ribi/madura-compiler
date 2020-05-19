const STATE_INITIAL = 0;

const STATE_WHITESPACE = 1;
const STATE_CR = 2;

const STATE_ALL_UPPER = 1;
const STATE_TYPE_NAME = 2;

const STATE_ZERO = 1;
const STATE_INTEGER = 2;
const STATE_FLOAT = 3;
const STATE_HEX = 4;
const STATE_BIN = 5;
const STATE_DOT = 6;
const STATE_X = 7;
const STATE_B = 8;

class MdScanner {

	parse(input) {
		let data = getChars(input);
		let tokens = [];
		let pos = 0;

		while (pos < data.length) {
			let c = data[pos];
			let token =
				c > DEL ? this.consume(data, pos) :
				c >= BLOCK ? this.consumeSymbolOrOperator(data, pos) :
				c >= LOWER_A ? this.consumeNameOrKeyword(data, pos) :
				c >= ARA ? this.consumeSymbolOrOperator(data, pos) :
				c >= UPPER_A ? this.consumeTypeOrConstant(data, pos) :
				c >= PAIR ? this.consumeSymbolOrOperator(data, pos) :
				c >= DIGIT_0 ? this.consumeNumber(data, pos) :
				c >= NOT ? this.consumeSymbolOrOperator(data, pos) :
					this.consumeNonPrintable(data, pos);

			pos += token.data.length;
			tokens.push(token);
		}

		return tokens;
	}

	consumeNameOrKeyword(data, start) {
		let snd = start + 1; let trd = start + 2;
		if (snd >= data.length) { return new Token(TokenType.NAME, asString(data, start, snd)); }

		let c = data[snd];
		switch (data[start]) {
			case LOWER_A: return this.matchOrConsume(KEYWORD_AS, data, start);
			case LOWER_C:
				switch (c) {
					case LOWER_L: return this.matchOrConsume(KEYWORD_CLASS, data, start);
					case LOWER_A: return this.matchOrConsume(KEYWORD_CATCH, data, start);
				} break;
			case LOWER_D: return this.matchOrConsume(KEYWORD_DO, data, start);
			case LOWER_E:
				switch (c) {
					case LOWER_L: return this.matchOrConsume(KEYWORD_ELSE, data, start);
					case LOWER_N: return this.matchOrConsume(KEYWORD_ENUM, data, start);
				} break;
			case LOWER_F:
				switch (c) {
					case LOWER_O: return this.matchOrConsume(KEYWORD_FOR, data, start);
					case LOWER_A: return this.matchOrConsume(KEYWORD_FALSE, data, start);
					case LOWER_I: return this.matchOrConsume(KEYWORD_FINAL, data, start, KEYWORD_FINALLY);
				} break;
			case LOWER_I:
				switch (c) {
					case LOWER_F: return this.matchOrConsume(KEYWORD_IF, data, start);
					case LOWER_N: return this.matchOrConsume(KEYWORD_IN, data, start, KEYWORD_INLINE);
					case LOWER_S: return this.matchOrConsume(KEYWORD_IS, data, start);
					case LOWER_M: return this.matchOrConsume(KEYWORD_IMPORT, data, start);
				} break;
			case LOWER_J: return this.matchOrConsume(KEYWORD_JUMP, data, start);
			case LOWER_N: return this.matchOrConsume(KEYWORD_NEW, data, start);
			case LOWER_P:
				switch (c) {
					case LOWER_R:
						if (trd >= data.length) { break; }
						switch (data[trd]) {
							case LOWER_I: return this.matchOrConsume(KEYWORD_PRIVATE, data, start);
							case LOWER_O: return this.matchOrConsume(KEYWORD_PROTECTED, data, start);
						} break;
					case LOWER_U: return this.matchOrConsume(KEYWORD_PUBLIC, data, start);
					case LOWER_A: return this.matchOrConsume(KEYWORD_PACKAGE, data, start);
				} break;
			case LOWER_R: return this.matchOrConsume(KEYWORD_RETURN, data, start);
			case LOWER_S:
				switch (c) {
					case LOWER_H: return this.matchOrConsume(KEYWORD_SHARED, data, start);
					case LOWER_U: return this.matchOrConsume(KEYWORD_SUPER, data, start);
				} break;
			case LOWER_T:
				switch (c) {
					case LOWER_H: if (trd >= data.length) { break; }
						switch (data[trd]) {
							case LOWER_I: return this.matchOrConsume(KEYWORD_THIS, data, start);
							case LOWER_O: return this.matchOrConsume(KEYWORD_THROW, data, start);
						} break;
					case LOWER_R: if (trd >= data.length) { break; }
						switch (data[trd]) {
							case LOWER_U: return this.matchOrConsume(KEYWORD_TRUE, data, start);
							case LOWER_Y: return this.matchOrConsume(KEYWORD_TRY, data, start);
						} break;
					case LOWER_Y: return this.matchOrConsume(KEYWORD_TYPEALIAS, data, start);
				} break;
			case LOWER_V: return this.matchOrConsume(KEYWORD_VAR, data, start);
			case LOWER_W:
				switch (c) {
					case LOWER_H:
						if (trd >= data.length) { break; }
						switch (data[trd]) {
							case LOWER_E: return this.matchOrConsume(KEYWORD_WHEN, data, start);
							case LOWER_I: return this.matchOrConsume(KEYWORD_WHILE, data, start);
						} break;
				} break;
		}

		return this.consumeName(data, start);
	}

	matchOrConsume(template, data, start, extension) {
		for (var i = 2, pos = start + 2; i < template.length && pos < data.length && (template[i] === data[pos]); ++i, ++pos);
		if (i === template.length && !this.match(data, pos)) { return new Token(TokenType.KEYWORD, asString(data, start, pos)); }
		if (extension) {
			for (; i < extension.length && pos < data.length && (extension[i] === data[pos]); ++i, ++pos);
			if (i === extension.length && !this.match(data, pos)) { return new Token(TokenType.KEYWORD, asString(data, start, pos)); }
		}
		return this.consumeName(data, start, i);
	}

	consumeName(data, start, offset = 1) {
		for (var pos = start + offset; this.match(data, pos); ++pos);
		return new Token(TokenType.NAME, asString(data, start, pos));
	}

	match(data, pos) {
		if (pos >= data.length) { return false; }
		let c = data[pos];
		if (c >= LOWER_A && c <= LOWER_Z) { return true; }
		if (c >= UPPER_A && c <= UPPER_Z) { return true; }
		if (c >= DIGIT_0 && c <= DIGIT_9) { return true; }
		if (c === BLANC) { return true; }
		return false;
	}

	consumeTypeOrConstant(data, start) {
		let state = STATE_ALL_UPPER;

		for (var pos = start + 1; pos < data.length; ++pos) {
			let c = data[pos];

			switch (state) {
				case STATE_ALL_UPPER:
					if (c >= LOWER_A && c <= LOWER_Z) { state = STATE_TYPE_NAME; break; }

					if (c === BLANC) { break; }
					if (c >= UPPER_A && c <= UPPER_Z) { break; }
					if (c >= DIGIT_0 && c <= DIGIT_9) { break; }

					return new Token(TokenType.CONSTANT, asString(data, start, pos));
				case STATE_TYPE_NAME:
					if (c >= LOWER_A && c <= LOWER_Z) { break; }
					if (c >= UPPER_A && c <= UPPER_Z) { break; }
					if (c >= DIGIT_0 && c <= DIGIT_9) { break; }

					return new Token(TokenType.TYPE, asString(data, start, pos));
			}
		}

		switch (state) {
			case STATE_ALL_UPPER: return new Token(TokenType.CONSTANT, asString(data, start, pos));
			default: return new Token(TokenType.TYPE, asString(data, start, pos));
		}
	}

	consumeSymbolOrOperator(data, start) {
		let c = data[start];
		if (c === QUOTE) { return this.consumeString(data, start, QUOTE); }
		if (c === CHAR) { return this.consumeString(data, start, CHAR); }

		return new Token(TokenType.OPERATOR, asString(data, start, start + 1));
	}

	consumeString(data, start, delimiter) {
		for (var pos = start + 1; pos < data.length; ++pos) {
			let c = data[pos];
			if (c === delimiter) { return new Token(TokenType.STRING, asString(data, start, pos + 1)); }
			if (c === LF || c === CR) { return new Token(TokenType.INVALID, asString(data, start, pos)); }
		}

		return new Token(TokenType.STRING, asString(data, start, pos));
	}

	consumeNumber(data, start) {
		let state = STATE_INITIAL;

		for (var pos = start; pos < data.length; ++pos) {
			let c = data[pos];

			switch (state) {
				case STATE_INITIAL:
					if (c === DIGIT_0) { state = STATE_ZERO; break; }
					state = STATE_INTEGER; break;
				case STATE_ZERO:
					if (c >= DIGIT_0 && c <= DIGIT_9) { state = STATE_INTEGER; break; }
					if (c === DOT) { state = STATE_DOT; break; }
					if (c === LOWER_X) { state = STATE_X; break; }
					if (c === LOWER_B) { state = STATE_B; break; }
					if (c === UPPER_L || c === LOWER_I) { return new Token(TokenType.NUMBER, asString(data, start, pos + 1)); }
					return new Token(TokenType.NUMBER, "0");
				case STATE_INTEGER:
					if (c >= DIGIT_0 && c <= DIGIT_9) { break; }
					if (c === DOT) { state = STATE_DOT; break; }
					if (c === UPPER_L || c === LOWER_I) { return new Token(TokenType.NUMBER, asString(data, start, pos + 1)); }
					return new Token(TokenType.NUMBER, asString(data, start, pos));
				case STATE_FLOAT:
					if (c >= DIGIT_0 && c <= DIGIT_9) { break; }
					if (c === LOWER_F || c === LOWER_I) { return new Token(TokenType.NUMBER, asString(data, start, pos + 1)); }
					return new Token(TokenType.NUMBER, asString(data, start, pos));
				case STATE_HEX:
					if (c >= DIGIT_0 && c <= DIGIT_9) { break; }
					if (c >= LOWER_A && c <= LOWER_F) { break; }
					if (c >= UPPER_A && c <= UPPER_F) { break; }
					return new Token(TokenType.NUMBER, asString(data, start, pos));
				case STATE_BIN:
					if (c === DIGIT_0 || c === DIGIT_1) { break; }
					return new Token(TokenType.NUMBER, asString(data, start, pos));
				case STATE_DOT:
					if (c >= DIGIT_0 && c <= DIGIT_9) { state = STATE_FLOAT; break; }
					return new Token(TokenType.NUMBER, asString(data, start, pos - 1));
				case STATE_X:
					if (c >= DIGIT_0 && c <= DIGIT_9) { state = STATE_HEX; break; }
					if (c >= LOWER_A && c <= LOWER_F) { state = STATE_HEX; break; }
					if (c >= UPPER_A && c <= UPPER_F) { state = STATE_HEX; break; }
					return new Token(TokenType.NUMBER, asString(data, start, pos - 1));
				case STATE_B:
					if (c === DIGIT_0 || c === DIGIT_1) { state = STATE_BIN; break; }
					return new Token(TokenType.NUMBER, asString(data, start, pos - 1));
			}
		}

		switch (state) {
			case STATE_ZERO:
			case STATE_INTEGER:
			case STATE_FLOAT:
			case STATE_HEX:
			case STATE_BIN: return new Token(TokenType.NUMBER, asString(data, start, pos));
			default: return new Token(TokenType.NUMBER, asString(data, start, pos - 1));
		}
	}

	consumeNonPrintable(data, start) {
		let state = STATE_INITIAL;

		for (var pos = start; pos < data.length; ++pos) {
			let c = data[pos];

			switch (state) {
				case STATE_INITIAL:
					switch (c) {
						case SPACE:
						case TAB: state = STATE_WHITESPACE; break;
						case LF: return new Token(TokenType.LINEBREAK, "\n");
						case CR: state = STATE_CR; break;
						default: return new Token(TokenType.CONTROL, asString(data, start, pos));
					}
					break;
				case STATE_WHITESPACE:
					switch (c) {
						case SPACE:
						case TAB: break;
						default: return new Token(TokenType.WHITESPACE, asString(data, start, pos));
					}
					break;
				case STATE_CR:
					switch (c) {
						case LF: return new Token(TokenType.LINEBREAK, "\r\n");
						default: return new Token(TokenType.LINEBREAK, "\r");
					}
			}
		}

		switch (state) {
			case STATE_WHITESPACE: return new Token(TokenType.WHITESPACE, asString(data, start, pos));
			default: return new Token(TokenType.LINEBREAK, asString(data, start, pos));
		}
	}

	consume(data, start) {
		for (var pos = start + 1; pos < data.length && data[pos] > DEL; ++pos);
		return Token(TokenType.INVALID, asString(data, start, pos - start));
	}
}

function asString(data, start, end) {
	return String.fromCharCode.apply(null, data.slice(start, end));
}

function getChars(input) {
	let data = []
	for (let i = 0; i < input.length; ++i) {
		let code = input.charCodeAt(i);
		data.push(code === NBSP ? SPACE : code);
	}
	return data;
}

const KEYWORD_AS = [97, 115];
const KEYWORD_CATCH = [99, 97, 116, 99, 104];
const KEYWORD_CLASS = [99, 108, 97, 115, 115];
const KEYWORD_DO = [100, 111];
const KEYWORD_ELSE = [101, 108, 115, 101];
const KEYWORD_ENUM = [101, 110, 117, 109];
const KEYWORD_FALSE = [102, 97, 108, 115, 101];
const KEYWORD_FINAL = [102, 105, 110, 97, 108];
const KEYWORD_FINALLY = [102, 105, 110, 97, 108, 108, 121];
const KEYWORD_FOR = [102, 111, 114];
const KEYWORD_IF = [105, 102];
const KEYWORD_IMPORT = [105, 109, 112, 111, 114, 116];
const KEYWORD_IN = [105, 110];
const KEYWORD_INLINE = [105, 110, 108, 105, 110, 101];
const KEYWORD_IS = [105, 115];
const KEYWORD_JUMP = [106, 117, 109, 112];
const KEYWORD_NEW = [110, 101, 119];
const KEYWORD_PACKAGE = [112, 97, 99, 107, 97, 103, 101];
const KEYWORD_PRIVATE = [112, 114, 105, 118, 97, 116, 101];
const KEYWORD_PROTECTED = [112, 114, 111, 116, 101, 99, 116, 101, 100];
const KEYWORD_PUBLIC = [112, 117, 98, 108, 105, 99];
const KEYWORD_RETURN = [114, 101, 116, 117, 114, 110];
const KEYWORD_SHARED = [115, 104, 97, 114, 101, 100];
const KEYWORD_SUPER = [115, 117, 112, 101, 114];
const KEYWORD_THIS = [116, 104, 105, 115];
const KEYWORD_THROW = [116, 104, 114, 111, 119];
const KEYWORD_TRUE = [116, 114, 117, 101];
const KEYWORD_TRY = [116, 114, 121];
const KEYWORD_TYPEALIAS = [116, 121, 112, 101, 97, 108, 105, 97, 115];
const KEYWORD_VAR = [118, 97, 114];
const KEYWORD_WHEN = [119, 104, 101, 110];
const KEYWORD_WHILE = [119, 104, 105, 108, 101];