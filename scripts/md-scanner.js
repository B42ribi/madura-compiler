const NUM_PATTERN = /(?:[0-9]+(?:_+[0-9]+)*)?\.[0-9]+(?:_+[0-9]+)*[fi]?/y;
const INT_PATTERN = /[0-9]+(?:_+[0-9]+)*[Li]?/y;
const HEX_PATTERN = /0x[0-9A-Fa-f]+(?:_+[0-9A-Fa-f]+)*/y
const BIN_PATTERN = /0b[01]+(?:_+[01]+)*/y

const ALLOWED_KEYWORDS = new Set(['as', 'catch', 'class', 'else', 'enum', 'false', 'for', 'fun', 'if', 'import', 'in', 'inline', 'is', 'jump', 'let',
	'match', 'mut', 'null', 'private', 'protected', 'public', 'return', 'shared', 'super', 'this', 'throw', 'true', 'try', 'typealias', 'while']);

class MdScanner {

	parse(data) {
		let tokens = [];
		let pos = 0;

		while (pos < data.length) {
			let c = data.charCodeAt(pos);
			let token =
				(c >= LOWER_A && c <= LOWER_Z) ? consumeNameOrKeyword(data, pos) :
				(c >= UPPER_A && c <= UPPER_Z) ? consumeType(data, pos) :
				(c >= DIGIT_0 && c <= DIGIT_9) ? consumeNumber(data, pos) :
				(c >= NUL && c <= SPACE || c === NBSP || c === DEL) ? consumeNonPrintable(data, pos) :
				(isSymbol(c)) ? consumeSymbolOrOperator(data, pos) :
					consumeInvalid(data, pos);

			pos += token.data.length;
			tokens.push(token);
		}

		return tokens;
	}

}

function consumeNameOrKeyword(data, start) {
	let sequence = match(data, /b'\\?[ -~]'/y, start);
	if (sequence) return new Token(NUMBER, sequence);
	sequence = match(data, /[a-z]\w*/y, start);
	let type = ALLOWED_KEYWORDS.has(sequence) ? KEYWORD : NAME;
	return new Token(type, sequence);
}

function consumeType(data, start) {
	return new Token(TYPE, match(data, /[A-Z]\w*/y, start));
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
	if (sequence) return new Token(OPERATOR, sequence);

	return new Token(OPERATOR, data.substring(start, start + 1));
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

const WHITESPACE = 0;
const LINEBREAK = 1;
const NAME = 2;
const KEYWORD = 3;
const TYPE = 4;
const NUMBER = 5;
const STRING = 6;
const OPERATOR = 7;
const COMMENT = 8;
const META = 9;
const INVALID = 10;

class Token {

	constructor(type, data) {
		this.type = type;
		this.data = data;
	}

}