let TokenType = {
	WHITESPACE: 0,
	LINEBREAK: 1,
	NAME: 2,
	KEYWORD: 3,
	TYPE: 4,
	CONSTANT: 5,
	NUMBER: 6,
	STRING: 7,
	OPERATOR: 8,
	SUBOPERATOR: 9,
	ASSIGNMENT: 10,
	COMPARISON: 11,
	COMMENT: 12,
	META: 13,
	CONTROL: 14,
	INVALID: 15
}

class Token {

	constructor(type, data) {
		this.type = type;
		this.data = data;
	}

}