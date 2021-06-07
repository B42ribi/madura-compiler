let Scanner = (function () {

	const NUM_PATTERN = /(?:[0-9]+(?:_+[0-9]+)*)?\.[0-9]+(?:_+[0-9]+)*i?/y;
	const INT_PATTERN = /[0-9]+(?:_+[0-9]+)*i?/y;
	const HEX_PATTERN = /0x[0-9A-Fa-f]+(?:_+[0-9A-Fa-f]+)*/y
	const BIN_PATTERN = /0b[01]+(?:_+[01]+)*/y

	const ALLOWED_KEYWORDS = new Set(['as', 'catch', 'class', 'else', 'enum', 'false', 'for', 'fun', 'if', 'import', 'in', 'inline', 'is', 'jump', 'let',
		'match', 'mut', 'null', 'private', 'protected', 'public', 'return', 'shared', 'super', 'this', 'throw', 'true', 'try', 'typealias', 'while']);

	function parse(data) {
		let tokens = [];
		let pos = 0;

		while (pos < data.length) {
			let c = data.charCodeAt(pos);
			let token =
				(c >= LOWER_A && c <= LOWER_Z) ? consumeNameOrKeyword(data, pos) :
				(c >= UPPER_A && c <= UPPER_Z) ? consumeNameOrType(data, pos) :
				(c >= DIGIT_0 && c <= DIGIT_9) ? consumeNumber(data, pos) :
				(c >= NUL && c <= SPACE || c === NBSP || c === DEL) ? consumeNonPrintable(data, pos) :
				(isSymbol(c)) ? consumeSymbolOrOperator(data, pos) :
					consumeInvalid(data, pos);

			token.pos = pos;
			pos += token.data.length;
			tokens.push(token);
		}

		return tokens;
	}

	function consumeNameOrKeyword(data, start) {
		let sequence = match(data, /b'\\?[ -~]'/y, start);
		if (sequence) return new Token(NUMBER, sequence);
		sequence = match(data, /[a-z]\w*/y, start);
		let type = ALLOWED_KEYWORDS.has(sequence) ? KEYWORD : NAME;
		return new Token(type, sequence);
	}

	function consumeNameOrType(data, start) {
		return new Token(NAME, match(data, /[A-Z]\w*/y, start));
	}

	function consumeNumber(data, start) {
		let sequence = matchAll(data, [NUM_PATTERN, HEX_PATTERN, BIN_PATTERN, INT_PATTERN], start);
		return new Token(NUMBER, sequence);
	}

	function consumeNonPrintable(data, start) {
		let c = data.charCodeAt(start);
		return isWhiteSpace(c) ? new Token(WHITESPACE, consume(data, start, c => isWhiteSpace(c))) :
			new Token((c === LF) ? LINEBREAK : WHITESPACE, data.substring(start, start + 1));
	}

	function consumeSymbolOrOperator(data, start) {
		let sequence;

		switch (data.charCodeAt(start)) {
			case QUOTE:
			case SINGLE_QUOTE:
			case BACK_TICK:
				sequence = matchAll(data, [/"(?:(?:\\")|[^"\r\n])*"?/y, /'(?:(?:\\')|[^'\r\n])*'?/y, /`(?:(?:\\`)|[^`\r\n])*`?/y], start);
				if (sequence) return new Token(STRING, sequence); break;
			case SLASH:
				sequence = match(data, /\/\/[^\n]*/y, start);
				if (sequence) return new Token(COMMENT, sequence); break;
			case DOT:
				sequence = match(data, NUM_PATTERN, start);
				if (sequence) return new Token(NUMBER, sequence); break;
			case AT:
				sequence = match(data, /@(?:[A-Z]\w*)?/y, start)
				if (sequence) return new Token(META, sequence); break;
		}

		sequence = matchAll(data, [/[+\-*/\^%<>]=?/y, /&[&=]?/y, /\|[\|=]?/y, /=>/y, /[!=]=?=?/y, /[\?\.]\.?/y, /::?/y], start);
		if (sequence) return new Token(SYMBOL, sequence);

		return new Token(SYMBOL, data.substring(start, start + 1));
	}

	function consumeInvalid(data, start) {
		return new Token(INVALID, consume(data, start, c => c > DEL && c !== NBSP));
	}

	function matchAll(data, patterns, start) {
		for (let p of patterns) {
			let sequence = match(data, p, start);
			if (sequence) return sequence;
		}

		return null;
	}

	function match(data, pattern, start) {
		pattern.lastIndex = start;
		let sequence = pattern.exec(data);
		return (sequence) ? sequence[0] : null;
	}

	function consume(data, start, doesApply) {
		for (var pos = start + 1; pos < data.length && doesApply(data.charCodeAt(pos)); ++pos);
		return data.substring(start, pos);
	}

	function isSymbol(c) {
		return c >= EXCLAMATION_MARK && c <= SLASH
			|| c >= COLON && c <= BACK_TICK
			|| c >= CURLY_BRACKET_OPEN && c <= TILDE;
	}

	function isWhiteSpace(c) {
		return c === SPACE || c === NBSP || c === TAB;
	}

	return { parse: (data) => parse(data) };

})();

const WHITESPACE = 0;
const LINEBREAK = 1;
const NAME = 2;
const KEYWORD = 3;
const NUMBER = 4;
const STRING = 5;
const SYMBOL = 6;
const COMMENT = 7;
const META = 8;
const INVALID = 9;

class Token {

	constructor(type, data) {
		this.type = type;
		this.data = data;
	}

}

const EXCLAMATION_MARK = 33;
const QUOTE = 34;
const SINGLE_QUOTE = 39;
const DOT = 46;
const SLASH = 47;
const COLON = 58;
const EQ = 61;
const AT = 64;
const SQUARE_BRACKET_OPEN = 91;
const UNDERSCORE = 95;
const BACK_TICK = 96;
const CURLY_BRACKET_OPEN = 123;
const TILDE = 126;
const DEL = 127;

const PLUS = 43;
const MINUS = 45;
const TIMES = 42;

const UPPER_A = 65;
const UPPER_B = 66;
const UPPER_C = 67;
const UPPER_D = 68;
const UPPER_E = 69;
const UPPER_F = 70;
const UPPER_L = 76;
const UPPER_Z = 90;

const DIGIT_0 = 48;
const DIGIT_1 = 49;
const DIGIT_9 = 57;

const NUL = 0;
const SPACE = 32;
const TAB = 9;
const LF = 10;
const CR = 13;
const NBSP = 160;

const LOWER_A = 97;
const LOWER_B = 98;
const LOWER_C = 99;
const LOWER_D = 100;
const LOWER_E = 101;
const LOWER_F = 102;
const LOWER_G = 103;
const LOWER_H = 104;
const LOWER_I = 105;
const LOWER_J = 106;
const LOWER_K = 107;
const LOWER_L = 108;
const LOWER_M = 109;
const LOWER_N = 110;
const LOWER_O = 111;
const LOWER_P = 112;
const LOWER_Q = 113;
const LOWER_R = 114;
const LOWER_S = 115;
const LOWER_T = 116;
const LOWER_U = 117;
const LOWER_V = 118;
const LOWER_W = 119;
const LOWER_X = 120;
const LOWER_Y = 121;
const LOWER_Z = 122;