// S-expression to String
var SexpPrint = function() {};
SexpPrint.prototype.sexp = function (obj) {
    if (obj instanceof LNil) {
      return '()';
    }
    if (obj instanceof LBool) {
      return obj.value ? "#t" : "#f";
    }
    if (obj instanceof LNumber) {
      return String(obj.value);
    }
    if (obj instanceof LString) {
      return "\"" + obj.str + "\"";
    }
    if (obj instanceof LSymbol)
      return obj.name;
    if (obj instanceof LRegExp)
      return "#/" + obj.reg.source + "/";
    if (obj instanceof LCell) {
      var str;      
      if (cdr(obj) === Nil) {
        str = "(" + this.sexp(car(obj)) + ")";
      } else if (!(cdr(obj) instanceof LCell)) {
        str = this.pair(obj);
      } else {
        str = this.list(obj);
      }
      return str;
    }
};
SexpPrint.prototype.list = function (lst) {
  var str = "";
  str = str  + "(";
  var current = lst;
  while (current!==Nil) {
    str = str + this.sexp(car(current)) + " ";
    current = cdr(current);
    }
  var tmp = str.length - 1;
  str = str.slice(0, tmp);
  str = str + ")";
  return str;
};
SexpPrint.prototype.pair = function (obj) {
  var str = "";
  str = str + "(";
  str = str + this.sexp(car(obj)) + " . ";
  str = str + this.sexp(cdr(obj)) + ")";
  return str;
};
SexpPrint.prototype.tokens = function(tokens) {
  var temp = tokens.map(
    function(token){
      return token;
    }
    , tokens);
  return temp.join(',');
};
