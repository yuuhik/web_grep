var Parser = function () {};
Parser.prototype.atom = function (token) {
  if(this.isNumber(token)) {
    return new LNumber(token);
  } else if (this.isString(token)) {
    return new LString(
      token.slice(1, token.length-1));
  } else if (this.isRegexp(token)) {
    return new LRegexp(
      token.slice(2, token.length-1));
  } else { //symbolなら
    return createSymbol(token);
  }
};
Parser.prototype.sexp = function (tokens) {
  if (this.isEmpty(tokens)) {
    return Nil;
  }
  if (this.isSingleQuote(tokens)) {
    return this.singleQuote(tokens);
  }
  if (this.isList(tokens)) {
    return this.list(tokens.slice(1, tokens.length - 1));
  }
  // atom
  return this.atom(tokens[0]);
};
Parser.prototype.singleQuote = function(tokens) {
  return cons(createSymbol('quote'),
              (function(tokens) {
                var ret = Parser.prototype.sexp(tokens.slice(1));
                return cons(ret, Nil);
              }(tokens)));
};
Parser.prototype.list = function (ary) {
  var retCell = new LCell();
  var cell = retCell;
  for (var i = 0; i < ary.length; i++) {
    if (ary[i] !== "(") {
      cell.car = this.atom(ary[i]);
    } else {
      if (ary[i] === "(") {
	var childAry = [];
	for (var j=0, depth=0; depth > 1 || ary[i+j] !== ")"; j++) {
	  if (ary[i+j] === "(") { depth++; }
	  if (ary[i+j] === ")") { depth--; }
	  childAry[j] = ary[i+j];
	}
	childAry[j] = ")";
	cell.car = this.sexp(childAry);
	i = i + j;
      }
    }
    if (i + 1 < ary.length) {
      cell.cdr = new LCell();
      cell = cell.cdr;
    } else {
      cell.cdr = Nil;
    }
  }
  return retCell;
};

Parser.prototype.isNumber = function (str) {
  return /^-?[0-9]+$/.test(str);
};
Parser.prototype.isString = function (str) {
  return (str.search(/\"[\w\W\s\S]*\"/) > -1);
};
Parser.prototype.isRegexp = function (str) {
  return (str.search(/\#\/[\w\W\s\S]*\//) > -1);
};
Parser.prototype.isEmpty = function (ary) {
  return ary[0] === '(' && ary[1] === ')';
};
Parser.prototype.isList = function (ary) {
  return ary[0] === '(' && ary[ary.length - 1] === ')';
};
Parser.prototype.isSingleQuote = function(ary) {
  return ary[0] === "'";
};

