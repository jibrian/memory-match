'use strict';

function Manipulatr(selector, context) {
	this.el = [];
	if (typeof selector === 'object') {
		this.el.push(selector);
	} else if (selector.match(/^\#/)) {
		this.el.push(document.getElementById(selector.substring(1)));
	} else if (selector.match(/^\./)) {
		var el = document.getElementsByClassName(selector.substring(1)),
			i = 0,
			len = el.length;

		for (; i < len; i++) {
			this.el.push(el[i])
		}
	} else if (!selector.match(/[\.||\#]/)) {
		var el = document.getElementsByTagName(selector);
			i = 0,
			len = el.length;

		for (; i < len; i++) {
			this.el.push(el[i])
		}
	} 
}

Manipulatr.fn = Manipulatr.prototype;

Manipulatr.fn.extend = function(obj) {
	for (var key in obj) {
		Manipulatr.fn[key] = obj[key];
	}
}

Manipulatr.fn.each = function(fn) {
	var i = 0,
		len = this.el.length;

	for (; i < len; i++) {
		fn(this.el[i], i)
	}

	return this;
}

Manipulatr.fn.get = function(num) {
	if (typeof num === 'number') {
		return this.el[num];
	} 

	if (this.el.length > 1) {
		return this.el;
	} else {
		return this.el[0];
	}

}

Manipulatr.fn.eq = function(num) {
	this.el = [this.el[num]];

	return this;
}

var methods = {
	addClass: function() {
		var arg = arguments,
			len = arg.length;
	
		this.each(function(item) {
			var i = 0,
				clazz = item.className;

			// cycle through all arguments
			for (; i < len; i++) {
				if (!clazz.match(arg[i])) {
					clazz += ' ' + arg[i];	
				}
			}

			item.className = clazz.trim();
		});

		return this;
	},

	removeClass: function() {
		var arg = arguments,
			len = arg.length;
	
		this.each(function(item) {
			var i = 0,
				clazz = item.className;

			// cycle through all arguments
			for (; i < len; i++) {
				var reg = new RegExp(arg[i], 'g');
				clazz = clazz.replace(reg, '');
			}

			clazz = clazz.match(/[a-zA-Z0-9\_\-].+\S/g) || [''];
			
			item.className = clazz.join(' ').trim() || '';
		});

		return this;	
	},

	toggleClass: function() {
		var arg = arguments,
			len = arg.length,
			_this = this;
	
		this.each(function(item) {
			var i = 0,
				clazz = item.className;

			// cycle through all arguments
			for (; i < len; i++) {
				if (!clazz.match(arg[i])) {
					clazz += ' ' + arg[i];	
				} else {
					var reg = new RegExp(arg[i], 'g');
					clazz = clazz.replace(reg, '');
				}
			}

			item.className = clazz.trim();
		});

		return this;
	},

	css: function(steez, value) {
		var arg = arguments;

		if (typeof arg[0] === 'object') {
			for (var key in arg[0]) {
				this.each(function(item) {
					item.style[key] = arg[0][key];
				});
			}

			return this;
		}

		this.each(function(item) {
			item.style[steez] = value;
		});

		return this;
	},

	html: function(html) {
		if (typeof html === 'string' || typeof html === 'number') {
			this.each(function(item) {
				item.innerHTML = html;
			})

			return this;
		}

		return this.el[0].innerHTML.trim();	
	},

	append: function(html) {
		this.each(function(item) {
			item.innerHTML += html;
		})
	},

	before: function(html) {
		this.each(function(item) {
			item.innerHTML = html + item.innerHTML;
		});

		return this;
	},

	after: function(html) {
		this.each(function(item) {
			item.innerHTML = item.innerHTML + html;
		});

		return this;
	},

	on: function(event, fn) {
		var originalEl = this.el;
		var _this = this;

		this.each(function(item, i) {
			item.addEventListener(event, function() {
				/*
				* Super hacky. Every time eq is used, it drops the el count to one.
				* Workaround was to refill it with original elements. 
				* Need to refactor eq and each method.
				*/
				_this.el = originalEl;
				fn(_this.eq(i));			
			}, false);
		})

		return this;
	},

	attr: function(attr) {
		return this.el[0].getAttribute(attr);
	},

	val: function() {
		return this.el[0].value;
	},

	hasClass: function(clazz) {
		var answer = false;

		this.each(function(item) {
			if (item.className.match(clazz)) {
				answer = true;
			} 
		})

		return answer;
	}
}


Manipulatr.fn.extend(methods);


var $ = function(selector) {
	return new Manipulatr(selector);
}


