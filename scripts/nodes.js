class Node {
	constructor(tag) {
		this.tag = tag;
	}

	print() {
		return this.tag;
	}
}

class Module extends Node {
	constructor(defs) {
		super('module');
		this.defs = defs;
	}

	print() {
		return `{"defs": ${printList(this.defs)}}`
	}
}

class Function extends Node {
	constructor(name, params, type, body) {
		super('fun');
		this.name = name;
		this.params = params;
		this.type = type;
		this.body = body;
	}

	print() {
		return `{"name": "${this.name.print()}", "params": ${printList(this.params)}, "type": "${this.type ? this.type.print() : 'None'}", "body": ${printList(this.body)}}`
	}
}

class Parameter extends Node {
	constructor(name, type) {
		super();
		this.name = name;
		this.type = type;
	}

	print() {
		return `{"name": "${this.name.print()}", "type": "${this.type.print()}"}`
	}
}

class Call extends Node {
	constructor(name, args) {
		super();
		this.name = name;
		this.args = args;
	}

	print() {
		return `{"name": "${this.name.print()}", "args": ${printList(this.args)}}`
	}
}

function printList(list) {
	let builder = [];
	builder.push('[');

	for (let i = 0; i < list.length; ++i) {
		if (i > 0) builder.push(', ');
		builder.push(list[i].print());
	}

	builder.push(']');
	return builder.join('');
}