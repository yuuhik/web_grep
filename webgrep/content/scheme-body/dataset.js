var SymbolSet = [];
var LNil = function () {
  this.tag = 'nil';
};
var Nil = new LNil; // 

var LBool = function (val) {
  this.value = val;
};
var T = new LBool(true); // 
var F = new LBool(false); // 

// data structure
function LNumber(value) {
  this.value = parseFloat(value);
}
function LString(str) {
  this.string = new String(str);
}
function LCell(car, cdr) {
  this.car = (car === undefined) ?
      Nil : car;
  this.cdr = (cdr === undefined) ?
      Nil : cdr;
}
LCell.prototype.toString = function () {
  return "(" +
      this.car +
      " . " +
      this.cdr +
      ")";
};
LCell.prototype.first = function () {
  return this.car;
};
LCell.prototype.rest = function () {
  return this.cdr;
};


function LRegExp(str) {
  this.reg = new RegExp(str);
}

// 組み込み関数の型
function LPrimitiveFunc(func) {
  this.func = func;
}

// スペシャルフォームの型
function LSpform(form) {
  this.form = form;
}

// クロージャの型
function LClosure(form, args, env) {
  this.form = form;
  this.args = args;
  this.env = env;
}

// Constructors
function LSymbol(str) {
  this.name = str;
}
// Sybolはこの関数で生成する
function createSymbol(str) {
  for (var i=0; i< SymbolSet.length; i++) {
    if (SymbolSet[i] === str) {
      return SymbolSet[i];
    }
  }
  SymbolSet[SymbolSet.length] = new LSymbol(str);
  return SymbolSet[SymbolSet.length - 1]; //ひとつ増えたから
}

// 
function valToBool(val) {
  if (val instanceof LNumber) {
    return (val.value === 0) ? Nil : T;
  }
  return (val === Nil) ? Nil : T;
}

function car(x) { return (x === Nil) ? Nil : x.car; }
function first(x) { return (x === Nil) ? Nil : x.car; }
function cdr(x) { return (x === Nil) ? Nil : x.cdr; }
function rest(x) { return (x === Nil) ? Nil : x.cdr; }
function cons(a ,b) {
  var cell = new LCell();
  cell.car = a;
  cell.cdr = b;
  return cell;
}
function setCar(x, val) { x.car = val; }
function setCdr(x, val) { x.cdr = val; }

function length(lst) { return (nullp(lst) === T) ? 0 : 1 + length(cdr(lst)); }
function append(lst1, lst2) { return (nullp(lst1) === T) ? lst2 : cons(car(lst1), append(cdr(lst1), lst2)); }
function reverse(lst) {
  var _rev = function (lst1, lst2) {
    return (nullp(lst1) === T) ? lst2 : _rev(cdr(lst1), cons(car(lst1), lst2));
  };
  return (nullp(lst) === T) ? lst : _rev(lst, Nil);
}
function list(lst) { return (lst === Nil) ? lst : cons(car(lst), list(cdr(lst))); }

function caar(x) { return car(car(x)); }
function caaar(x) { return car(car(car(x))); }
function cddr(x) { return cdr(cdr(x)); }
function cdddr(x) { return cdr(cdr(cdr(x))); }
function cdar(x) { return cdr(car(x)); }
function cadr(x) { return car(cdr(x)); }
function caddr(x) { return car(cddr(x)); }

// predicate -------
function numberp(x) { return (x instanceof LNumber) ? T : Nil; }
function consp(x) { return (x instanceof LCell) ? T : Nil; }
function stringp(x) { return (x instanceof LString) ? T : Nil; }
function regexpp(x) { return (x instanceof LRegExp) ? T : Nil; }
function symbolp(x) { return (x instanceof LSymbol) ? T : Nil; }
function nullp(x) { return (x === Nil || (car(x) === Nil && cdr(x) === Nil)) ? T : Nil; }

// LispのデータからJavaScriptのデータへの変換(汚い)
var lSymbolList2jsStringArray = function (lst) {
  var result = [];
  var current = lst;
  while (current !== Nil) {
    result.push(first(current).name);
    current = rest(current);
  }
  return result;
};
var lList2jsArray = function (lst) {
  var result = [];
  var current = lst;
  while (current !== Nil) {
    result.push(first(current));
    current = rest(current);
  }
  return result;
};
