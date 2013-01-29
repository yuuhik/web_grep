var LEval = function() {
  // 環境をsetupする関数
  this.setupEnvironment = function () {
    return this.extendEnvironment(
      this.primitiveFunctionNames(),
      this.primitiveFunctionObjects(),
      [] // 元になるenv
    );
  };
  this.primitiveFunctionNames = function() {
    return LEval.PrimitiveFunctions.map(function(bind) {
      return bind.variable;
    });
  };
  this.primitiveFunctionObjects = function () {
    return LEval.PrimitiveFunctions.map(function(bind) {
      return bind.value;
    });
  };
  
  this.GlobalEnvironment = this.setupEnvironment();
  // console.log(GlobalEnvironment.toSource());
  
};
LEval.prototype.lEval = function (s) {
  return this._lEval(s, this.GlobalEnvironment);
};
LEval.prototype._lEval = function (s, env) {
  if(s instanceof LNil) {
    return Nil;
  }
  if(s instanceof LNumber) {
    return s;
  }
  if(s instanceof LString) {
    return s;
  }
  if (s instanceof LSymbol) {
    return this.lookupVariableValue(s.name,
                                    env);      
  }
  if (s instanceof LCell) {
    var head = this._lEval(s.car, env);

    if (head instanceof LSpform) {
      return this.lApplySpform(head,
                               cdr(s), // 引数
                               env);
    } else {
      return this.lApply(head, // 関数部
                         cdr(s), // 残りの引数
                         env);
    }
  }
  throw "illegal node eval.";
};
LEval.prototype.lApplySpform = function (proc, argsList, env) {
  return proc.form(argsList, env);        
};
LEval.prototype.lApply = function (proc, argsList, env) {
  // 関数ならば，引数のフォームを評価後に関数にその値のリストを渡す
  argsList = this.lEvalArguments(argsList, env);
  if (proc instanceof LPrimitiveFunc) {
    return proc.func(argsList);
  }
  if (proc instanceof LClosure) {
    return this.lEvalSequence(proc.form,
                              this.extendEnvironment(proc.args,
                                                     argsList,
                                                     proc.env));
  }
  return Nil;
};
LEval.prototype.lEvalSequence = function(args, env) {
  var ret = Nil;
  var current = args;
  while (current !== Nil) {
    ret = this._lEval(current.car, env);
    current = current.cdr;
  }
  return ret;
};
LEval.prototype.lEvalArguments = function (argsList, environment) {
  var result = Nil;
  var current = argsList;
  while (current !== Nil) {
    result = cons(this._lEval(first(current), environment), result);
    current = rest(current);
  }
  return reverse(result);
};
LEval.prototype.headFrame = function (environment) {
  var result = environment[environment.length - 1];
  return result;
};
// 残りトップを除いた残りの環境
LEval.prototype.restEnvironment = function (environment) {
  var result = environment.slice(0, environment.length - 1);
  return result;
};
// 新しいフレームを作って環境に追加
LEval.prototype.extendEnvironment = function (variables, values, baseEnvironment) {
  if (variables === Nil || values === Nil)
    return baseEnvironment;
  if (variables.length === values.length) {
    // 新しい配列を用意し，フレームの参照を突っ込んでいく
    var resultEnv = [];
    for (var i = 0; i < baseEnvironment.length; ++i) {
      resultEnv.push(baseEnvironment[i]);
    }

    // 新しいフレームを作って環境に追加
    resultEnv.push(this.makeFunctionFrame(variables, values));

    return resultEnv;
  } else {
    throw "extendEnvironment arguments error!";
  }
};

// 環境から目的に変数を探す
LEval.prototype.lookupVariableValue = function(variable, environment) {
  for (var i = environment.length - 1; i >= 0; --i) {
    var frame = environment[i];
    // フレームにvariableという変数があったなら，そのvalueを返す
    if(frame.binds.hasOwnProperty(variable)) {
      return frame.binds[variable];
    }
  }
  // 最後まで見つからなかったら
  throw "Unbound Variable" + variable;
};

// ある変数の値を書き換える
LEval.prototype.setVariableValueBan = function(variable, value, environment) {
  for (var i = environment.length - 1; i >= 0; --i) {
    var frame = environment[i];
    // フレームにvariableという変数があったなら，そのvalueを返す
    if(frame.binds.hasOwnProperty(variable)) {
      frame.binds[variable] = value;
      return value;
    }
  }
  // 最後まで見つからなかったら
  throw "Unbound Variable" + variable;  
};

// 渡された環境のトップの関数フレームに新しい束縛を追加
LEval.prototype.defineVariableBan = function (variable, value, environment) {
  // トップの環境を取り出す
  var frame = environment[environment.length -1];
  // 変数のbindを追加
  if(frame.binds.hasOwnProperty(variable)) {
    frame.binds[variable] = value;
  } else {
    frame.binds[variable] = value;
  }
  return value;
};

// 新しいフレームの作成
// variables, valuesは同じ数の要素を持つ配列でなければならない
LEval.prototype.makeFunctionFrame = function (variables, values) {
  return new this.FunctionFrame(variables, values);
};
// 型
LEval.prototype.FunctionFrame = function (variables, values) {
  var tmp = {};
  var _variables = variables;
  var _values = values;
  // もし，variablesがlListならば，JSのArrayに変換する
  if (variables instanceof LCell) {
    _variables = lSymbolList2jsStringArray(variables);
    _values = lList2jsArray(values);
  }

  for (var i = 0; i < _variables.length; ++i) {
    tmp[_variables[i]] = _values[i];
  }
  this.binds = tmp;
};

// predicates
LEval.prototype.isEmptyEnvironment = function (environment) {
  return (environment.length === 0);
};

// [bind1, bind2, ...]というようなプリミティブ関数群の配列を代入している
LEval.PrimitiveFunctions = (function () {
  var result = [];
  var createBind = function (variable, value) {
    var result = {};
    result.variable = variable;
    result.value = value;
    return result;
  };
  var builtinFunc = function (variable, value) {
    result.push(createBind(variable, new LPrimitiveFunc(value)));
  };
  var builtinSpform = function (variable, value) {
    result.push(createBind(variable, new LSpform(value)));
  };
  
  //builtin---------------------------------------------------------------------
  function _lquote(args, env) { return args.car; }
  function _lcar(args) { return caar(args); }
  function _lcdr(args) { return cdar(args); }
  function _lcons(args) { return cons(car(args), car(cdr(args))); }
  function _llist(args) { return list(args); }

  function _leq(args) {
    var x = car(args);
    var y = cadr(args);
    return ((x instanceof LNumber &&
             y instanceof LNumber &&
             x.value === y.value) ||
            x === y) ?
        T : Nil;
  }
  function _latom(s) { return (car(s).tag !== "cell") ? T : Nil; }
  function _ladd(args) { 
    var current = args;
    var ret = 0;
    while (current !== Nil && car(current) instanceof LNumber) {
      ret = ret + car(current).value;
      current = cdr(current);
    }
    return new LNumber(ret);
  }
  function _lsub(args) { 
    var x = car(args);
    var y = cadr(args);
    return (x instanceof LNumber &&
            y instanceof LNumber) ?
        new LNumber(x.value - y.value) : Nil;
  }
  function _lmult(args) {
    var current = args;
    var ret = 1;
    while (current !== Nil &&
           car(current) instanceof LNumber) {
      ret = ret * car(current).value;
      current = cdr(current);
    }
    return new LNumber(ret);
  }
  function _ldiv(args) {
    var x = car(args);
    var y = cadr(args);
    return (x instanceof LNumber &&
            y instanceof LNumber) ?
        new LNumber(x.value / y.value) : Nil;
  }
  function _lmod(args) {
    var x = car(args);
    var y = cadr(args);
    return (x instanceof LNumber &&
            y instanceof LNumber) ?
        new LNumber(x.value % y.value) : Nil;
  }

  function _lconsp(args) { return consp(car(args)); }
  function _lzerop(args) { return zerop(car(args)); }
  function _lstringp(s) { return stringp(car(s)); }
  function _lregexpp(s) { return regexpp(car(s)); }
  function _lsymbolp(s) { return symbolp(car(s)); }

  function _land(args) {
    var x = valToBool(car(args));
    var next = cdr(args);
    var y;

    while (x !== Nil && next !== Nil) {
      y = valToBool(car(next));
      x = (x !== Nil && y !== Nil) ? T : Nil;
      next = cdr(next); 
    }
    return x;
  }

  function _lor(args) {
    var x = car(args);
    var y = cadr(args);
    if (x instanceof LNumber ) { x = (x.num === 0) ? Nil : T; }
    if (y instanceof LNumber ) { y = (y.num === 0) ? Nil : T; }

    return (x === Nil && y === Nil) ? Nil : T;
  }

  function _linequalityL(args) { //x > y?
    var x = car(args);
    var y = cadr(args);
    if (x instanceof LNumber &&
        y instanceof LNumber ) {
      return (x.value > y.value) ? T : Nil;
    }
  }
  function _linequalityLe(args) { //x >= y?
    var x = car(args);
    var y = cadr(args);
    if(x instanceof LNumber &&
       y instanceof LNumber ) {
      return (x.value >= y.value) ? T : Nil;
    }
  }

  function _linequalityR(args) { //x < y?
    var x = car(args);
    var y = cadr(args);
    if(x instanceof LNumber &&
       y instanceof LNumber ) {
      return (x.value < y.value) ? T : Nil;
    }
  }

  function _linequalityRe(args) { //x <= y?
    var x = car(args);
    var y = cadr(args);
    if(x instanceof LNumber &&
       y instanceof LNumber ) {
      return (x.value <= y.value) ? T : Nil;
    }
  }

  function _lequalCalc(args) {
    var x = car(args);
    var y = cadr(args);
    if(x instanceof LNumber  && y instanceof LNumber ) {
      return (x.value === y.value) ? T : Nil;
    }
  }
  
  function _llength(args) {
    return new Number(length(car(args)));
  }

  function _lappend(args) {
    return append(car(args), cadr(args));
  }

  function _lreverse(args) {
    return reverse(car(args));
  }
  function _labs(args) {
    return Math.abs(car(args).value);
  }
  
  //----------------------------------------------------------------------------
  function _lprog(args, env) {
    var ret = Nil;
    var current = args;
    while (current !== Nil) {
      ret = LEval.prototype._lEval(car(current), env);
      current = cdr(current);
    }
    return ret;
  }

  function _lsetBan(args, env) {
    var name = car(args).name;
    var val = cadr(args);
    val = LEval.prototype._lEval(val, env);
    LEval.prototype.setVariableValueBan(name, val, env);
    return val;
  }
  function _ldefine(args, env) {
    var name = car(args);
    var val = cadr(args);
    val = LEval.prototype._lEval(val, env);
    LEval.prototype.defineVariableBan(name.name, val, env);
    return name;
  }

  function _llambda(args, env) {
    return new LClosure(cdr(args), car(args), env);
  }

  function _lcond(args, env) {
    while (args != Nil) {
      if (LEval.prototype._lEval(caar(args), env) !== Nil) {
        return _lprog(cdar(args), env); }
      args = cdr(args);
    }
    return Nil;
  }

  function _lalert(args) {
    alert(sexpToStr(car(args)));
    return car(args);
  }

  // 空リスト
  result.push(createBind('nil', Nil));
  result.push(createBind('#f', F));
  result.push(createBind('#t', T));

  // Lisp basic functions
  builtinFunc("car", _lcar);
  builtinFunc("cdr", _lcdr);
  builtinFunc("eq", _leq);
  builtinFunc("atom", _latom);
  builtinFunc("cons", _lcons);
  
  // list functions
  builtinFunc("list", _llist);
  builtinFunc("consp", _lconsp);
  builtinFunc("length", _llength);
  builtinFunc("append", _lappend);
  builtinFunc("reverse", _lreverse);
  builtinFunc("symbolp", _lsymbolp);

  // num functions
  builtinFunc("+", _ladd);
  builtinFunc("-", _lsub);
  builtinFunc("*", _lmult);
  builtinFunc("/", _ldiv);
  builtinFunc("mod", _lmod);
  builtinFunc("abs", _labs);
  builtinFunc("zerop", _lzerop);
  builtinFunc(">", _linequalityL);
  builtinFunc("<", _linequalityR);
  builtinFunc("=", _lequalCalc);
  builtinFunc(">=", _linequalityLe);
  builtinFunc("<=", _linequalityRe);

  builtinSpform("begin", _lprog);
  builtinSpform("define", _ldefine);
  builtinSpform("cond", _lcond);
  builtinSpform("quote", _lquote);
  builtinSpform("set!", _lsetBan);
  builtinSpform("lambda", _llambda);

  // js特有の機能
  builtinFunc("alert", _lalert);

  return result;
}());

