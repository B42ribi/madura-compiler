class Node {}

class Definition extends Node {
	constructor(root) {
		super();
		this.root = root;
	}
}

class Module extends Definition {
	constructor(defs) {
		super('module');
		this.defs = defs;
	}
}

class Function extends Definition {
	constructor(name, params, type, body) {
		super('fun');
		this.name = name;
		this.params = params;
		this.type = type;
		this.body = body;
	}
}

class Parameter extends Node {
	constructor(name, type) {
		super();
		this.name = name;
		this.type = type;
	}
}

class Call extends Node {
	constructor(name, args) {
		super();
		this.name = name;
		this.args = args;
	}	
}