let Lang = (function() {

	const I32 = 'I32';
	const F32 = 'F64';
	const U8 = 'U8'
	const Bool = 'Bool';
	const Str = 'String';

	let i32 = new Type(
		I32,
		{
			'plus': new Function((other, self) => new Value(self.value + other.value, I32), [I32], I32),
			'minus': new Function((other, self) => new Value(self.value - other.value, I32), [I32], I32),
			'times': new Function((other, self) => new Value(self.value * other.value, I32), [I32], I32),
			'div': new Function((other, self) => new Value(self.value / other.value, F64), [I32], F64),
			'power': new Function((other, self) => new Value(Math.pow(self.value, other.value), I32), [I32], I32),
			'toString': new Function((self) => new Value(`${self.value}`, Str), [], Str)
		}
	);

	let types = {
		'I32':''
	}



})();

class Type {

	constructor(name, functions) {
		this.name = name
		this.functions = functions
	}

}

class Value {

	constructor(value, type) {
		this.value = value;
		this.type = type;
	}

}

class Function {

	constructor(operation, parameters, type) {
		this.operation = operation;
		this.parameters = parameters;
		this.type = type;
	}

}

class Flow {

	constructor(op, args) {
		this.op = op;
		this.args = args;
	}

}