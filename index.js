const propToArray = (prop) => {
	return prop.split('.').reduce(function (ret, el, index, list) {
		var last = index > 0 && list[index - 1];
		if (last && /(?:^|[^\\])\\$/.test(last)) {
			ret.pop();
			ret.push(last.slice(0, -1) + '.' + el);
		} else {
			ret.push(el);
		}
		return ret;
	}, []);
}

const arrify = (val) => {
	if (val === null || val === undefined) {
		return [];
	}
	return Array.isArray(val) ? val : [val];
};

const dotPropGet = (obj, prop, value) => {
	prop = typeof prop === 'number' ? propToArray(prop.toString()) : typeof prop === 'string' ? propToArray(prop) : prop;

	for (var i = 0; i < prop.length; i++) {
		if (typeof obj !== 'object') {
			return value;
		}
		var head = prop[i];
		if (Array.isArray(obj) && head === '$end') {
			head = obj.length - 1;
		}
		obj = obj[head];
	}

	if (typeof obj === 'undefined') {
		return value;
	}

	return obj;
};

const sortOn = (arr, prop) => {
	if (!Array.isArray(arr)) {
		throw new TypeError('Expected an array');
	}

	return arr.slice().sort((a, b) => {
		let ret = 0;

		arrify(prop).some(el => {
			let x;
			let y;
			let desc;

			if (typeof el === 'function') {
				x = el(a);
				y = el(b);
			} else if (typeof el === 'string') {
				desc = el.charAt(0) === '-';
				el = desc ? el.slice(1) : el;
				x = dotPropGet(a, el);
				y = dotPropGet(b, el);
			} else {
				x = a;
				y = b;
			}

			if (x === y) {
				ret = 0;
				return false;
			}

			if (y !== 0 && !y) {
				ret = desc ? 1 : -1;
				return true;
			}

			if (x !== 0 && !x) {
				ret = desc ? -1 : 1;
				return true;
			}

			if (typeof x === 'string' && typeof y === 'string') {
				ret = desc ? y.localeCompare(x) : x.localeCompare(y);
				return ret !== 0;
			}

			if (desc) {
				ret = x < y ? 1 : -1;
			} else {
				ret = x < y ? -1 : 1;
			}

			return true;
		});

		return ret;
	});
};

export default sortOn;