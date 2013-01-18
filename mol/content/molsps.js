var $ = function(id) { return document.getElementById(id); };
var clone = function(obj) {
    var f = function() {};
    f.prototype = obj;
    return new f;
};
//---------------------------------------------------------------------------
var Cc = Components.classes;
var Ci = Components.interfaces;
var Aaa = Application.activeWindow.activeTab;
var $$ = function(str) { return Aaa.document.getElementById(str); };

// var StringBuffer = "";

Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
};
var MoLsp = (function() {
    var SymbolSet = [];
    var createSymbol = function(str) {
        for (var i=0; i<SymbolSet.length; i++) {
	    if (SymbolSet[i] === str) {
	        return SymbolSet[i];
	    }
        }
        SymbolSet[SymbolSet.length] = new Symbol(str);
        return SymbolSet[SymbolSet.length - 1]; //ひとつ増えたから
    };

    var Nil = createSymbol("nil"),
        T = createSymbol("t");

    function createFunc(func) { return new Func(func); }
    function createSpform(form) { return new Spform(form); }
    var insertEnv = function(name, subst, env) {
        for(var envX = env; envX !== "root"; envX = envX.chainChild) {
	    if(envX[name]) {
	        envX[name] = subst;
	        return env;
	    }
        }
        env[name] = subst;
        return env;
    };
    // data structure
    function Symbol(str) {
        this.tag = "symbol";
        this.name = str;
    }
    function Num(val) {
        this.tag = "number";
        this.num = parseFloat(val);
    }
    function Str(str) {
        this.tag = "string";
        this.str = new String(str);
    }
    function Cell() {
        this.tag = "cell";
        this.car = Nil;
        this.cdr = Nil;
    }
    function Rx(str) {
        this.tag = "regexp";
        this.reg = new RegExp(str);
    }
    function Func(func) {
        this.tag = "func";
        this.func = func;
    }
    function Spform(form) {
        this.tag = "spform";
        this.form = form;
    }
    function Lambda(form, args, env) {
        this.tag = "lambda";
        this.form = form;
        this.args = args;
        this.env = env;
    }
    function Htmldoc(htmldoc) {
        this.tag = "htmldoc";
        this.doc = htmldoc;
    }
    function Htmldom(htag, dom) {
        this.tag = "htmldom";
        this.htag = new String(htag);
        this.dom = dom;
    }
    function Set(name, subst) {
        this.name = name;
        this.subst = subst;
    }
    function Ary(ary) {
        this.tag = "array";
        this.ary = ary;
        this.length = ary.length;
    }

    // ------------------------------------------- data structure creates
    function createNumber(n) { return new Num(n); }
    function createCell() { return new Cell(); }
    function createString(str) { return new Str(str); }
    function createRegexp(str) { return new Rx(str); }
    function createEnv(name, subst) { return new Set(name, subst); }
    function createLambda(form, args, env) { return new Lambda(form, args, env); }
    function createHtmldom(htag, dom) { return new Htmldom(htag, dom); }
    function createHtmldoc(doc) { return new Htmldoc(doc); }
    function createAry(ary) { return new Ary(ary); }

    // ----------------------------------------------------------------------------------
    function numberp(x) { return (x.tag === "num") ? T : Nil; }
    function consp(x) { return (x.tag === "cell") ? T : Nil; }
    function stringp(x) { return (x.tag === "string") ? T : Nil; }
    function regexpp(x) { return (x.tag === "regexp") ? T : Nil; }
    function symbolp(x) { return (x.tag !== "cell") ? T : Nil; }

    function valToBool(val) {
        if (val.tag === "num") { return (val.num === 0) ? Nil : T; }
        return (val === Nil) ? Nil : T;
    }

    function car(x) { return (x === Nil) ? Nil : x.car; }
    function cdr(x) { return (x === Nil) ? Nil : x.cdr; }
    function cons(a ,b) {
        var cell = createCell();
        cell.car = a;
        cell.cdr = b;
        return cell;
    }
    function setCar(x, val) { x.car = val; }
    function setCdr(x, val) { x.cdr = val; }

    function nullp(x) { return (x === Nil || (car(x) === Nil && cdr(x) === Nil)) ? T : Nil; }
    function length(lst) { return (nullp(lst) === T) ? 0 : 1 + length(cdr(lst)); }
    function append(lst1, lst2) { return (nullp(lst1) === T) ? lst2 : cons(car(lst1), append(cdr(lst1), lst2)); }
    function reverse(lst) {
        return _rev(lst, Nil);
        function _rev(lst1, lst2) {
	    return (nullp(lst1) === T) ? lst2 : _rev(cdr(lst1), cons(car(lst1), lst2));
        }
    }
    function list(lst) { return (lst === Nil) ? lst : cons(car(lst), list(cdr(lst))); }

    function caar(x) { return car(car(x)); }
    function caaar(x) { return car(car(car(x))); }
    function cddr(x) { return cdr(cdr(x)); }
    function cdddr(x) { return cdr(cdr(cdr(x))); }
    function cdar(x) { return cdr(car(x)); }
    function cadr(x) { return car(cdr(x)); }
    function caddr(x) { return car(cddr(x)); }

    //builtin------------------------------------------------------------------------------------------------

    function built_quote(args, env) { return car(args); }
    function built_car(args) { return caar(args); }
    function built_cdr(args) { return cdar(args); }
    function built_cons(args) { return cons(car(args), car(cdr(args))); }
    function built_list(args) { return list(args); }

    function built_equal(args) {
        var x = car(args);
        var y = cadr(args);
        return ((x.tag === "number" && y.tag === "number" && x.num === y.num) || x === y) ? T : Nil;
    }
    function built_atom(s) { return (car(s).tag !== "cell") ? T : Nil; }
    function built_add(args) { 
        var current = args;
        var ret = 0;
        while (current !== Nil && car(current).tag === "number") {
	    ret = ret + car(current).num;
	    current = cdr(current);
        }
        return createNumber(ret);
    }
    function built_sub(args) { 
        var x = car(args);
        var y = cadr(args);
        return (x.tag === "number" && y.tag === "number") ? createNumber(x.num - y.num) : Nil;
    }
    function built_mult(args) {
        var current = args;
        var ret = 1;
        while (current !== Nil && car(current).tag === "number") {
	    ret = ret * car(current).num;
	    current = cdr(current);
        }
        return createNumber(ret);
    }
    function built_div(args) {
        var x = car(args);
        var y = cadr(args);
        return (x.tag === "number" && y.tag === "number") ? createNumber(x.num / y.num) : Nil;
    }
    function built_mod(args) {
        var x = car(args);
        var y = cadr(args);
        return (x.tag === "number" && y.tag === "number") ? createNumber(x.num % y.num) : Nil;
    }
    function built_consp(args) { return consp(car(args)); }
    function built_zerop(args) { return zerop(car(args)); }
    function built_stringp(s) { return stringp(car(s)); }
    function built_regexpp(s) { return regexpp(car(s)); }
    function built_symbolp(s) { return symbolp(car(s)); }

    function built_and(args) {
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

    function built_or(args) {
        var x = car(args);
        var y = cadr(args);
        if (x.tag === "number") { x = (x.num === 0) ? Nil : T; }
        if (y.tag === "number") { y = (y.num === 0) ? Nil : T; }

        return (x === Nil && y === Nil) ? Nil : T;
    }
    function built_inequalityL(args) { //x > y?
        var x = car(args);
        var y = cadr(args);
        if(x.tag === "number" && y.tag === "number") { return (x.num > y.num) ? T : Nil; }
    }
    function built_inequalityLe(args) { //x >= y?
        var x = car(args);
        var y = cadr(args);
        if(x.tag === "number" && y.tag === "number") { return (x.num >= y.num) ? T : Nil; }
    }
    function built_inequalityR(args) { //x < y?
        var x = car(args);
        var y = cadr(args);
        if(x.tag === "number" && y.tag === "number") { return (x.num < y.num) ? T : Nil; }
    }
    function built_inequalityRe(args) { //x <= y?
        var x = car(args);
        var y = cadr(args);
        if(x.tag === "number" && y.tag === "number") { return (x.num <= y.num) ? T : Nil; }
    }
    function built_equalCalc(args) {
        var x = car(args);
        var y = cadr(args);
        if(x.tag === "number" && y.tag === "number") { return (x.num === y.num) ? T : Nil; }
    }
    function built_length(args) {
        return createNumber(length(car(args)));
    }
    function built_append(args) {
        return append(car(args), cadr(args));
    }
    function built_reverse(args) {
        return reverse(car(args));
    }
    function built_abs(args) {
        return Math.abs(car(args).num);
    }
    //---------------------------------------------------------------------
    function built_str_rx(args) {
        return createRx(car(args).str);
    }
    function built_rx_search(args) {
        var reg = car(args).reg;
        var str = cadr(args).str;
        return createNumber(str.search(reg));
    }
    function built_rx_test(args) {
        var reg = car(args).reg;
        var str = cadr(args).str;
        return reg.test(str) ? T : Nil;
    }
    function built_num_range(args) {
        var max = car(args).num;
        var min = cadr(args).num;
        return createNumRange(max, min);
    }
    function built_num_range_test(args) {
        var numRange = car(args);
        var str = cadr(args).str;
        
        var reg = /[0-9]+\.?[0-9]*/i;
        var numx = Number((str.match(reg))[0]);
        return (numRange.min <= numx && numx <= numRange.max) ? T : Nil;
    }
    //----------------------------------------------------------------------------
    function built_progn(args, env) {
        var ret = Nil;
        var current = args;
        while (current !== Nil) {
	    ret = sexpEval(car(current), env);
	    current = cdr(current);
        }
        return ret;
    }

    function built_map2(args, env) {
        var ret = createCell();
        var retp = ret;
        var current = cadr(args);
        var func = car(args);
        var tmp;
        
        while (current !== Nil) {
            tmp = cons(func, cons(cons(createSymbol("quote") ,cons(car(current), Nil)), Nil));
            retp.car = sexpEval(tmp, env); //alert(output(ret.car));
	    current = cdr(current); //alert(output(current));
	    retp.cdr = (current !== Nil) ? createCell() : Nil; //alert(output(ret.cdr));
	    retp = retp.cdr;
        }
        return ret;

    }

    // function built_map(args, env) {
    //     var ret = createCell();
    //     var retp = ret;    
    //     var current = sexpEval(cadr(args), env);
    //     var func = car(args);
    //     var tmp;
        
    //     while (current !== Nil) {
    //         tmp = cons(func, cons(cons(createSymbol("quote") ,cons(car(current), Nil)), Nil));
    //         retp.car = sexpEval(tmp, env); //alert(output(ret.car));
    //         current = cdr(current); //alert(output(current));
    //         retp.cdr = (current !== Nil) ? createCell() : Nil; //alert(output(ret.cdr));
    //         retp = retp.cdr;
    //     }
    //     return ret;
    // }
    function built_setq(args, env) {
        var name = car(args).name;
        var val = cadr(args);
        var bind = searchEnv(name, env); //now!
        if (bind === Nil) {
	    return built_define(args, env);
        }
        val = sexpEval(val, env);
        env = insertEnv(name, val, env);
        return name;
    }
    function built_defun(args, env) {
        var name = car(args);
        var sArgs = cadr(args);
        var form = cddr(args);
        form = built_lambda(cdr(args) , env);
        env = insertEnv(name.name, form, env);
        return name;
    }
    function built_define(args, env) {
        var name = car(args);
        var val = cadr(args);
        val = sexpEval(val, env);
        env = insertEnv(name.name, val, env);
        return name;
    }
    function built_lambda(args, env) {
        var envChild = chainEnv(car(args), env);
        
        var l = createLambda(cdr(args), car(args), envChild);
        return l;
    }
    function built_cond(args, env) {
        while (args != Nil) {
	    if (sexpEval(caar(args), env) !== Nil) { return built_progn(cdar(args), env); }
	    args = cdr(args);
        }
        return Nil;
    }
    function built_let(args, env) {
        var lArgs = car(args);
        var valName = createCell();
        var ini= createCell();
        var topValName = valName;
        var topIni = ini;
        for (; lArgs !== Nil; lArgs = cdr(lArgs)) {
            valName.car = car(car(lArgs));
            ini.car = car(cdr(car(lArgs)));
            if(cdr(lArgs) !== Nil){
                valName.cdr = createCell();
                valName = valName.cdr;
                ini.cdr = createCell();
                ini = ini.cdr;
            }
        }
        var retEnv = chainEnv(topValName, env);
        retEnv = bindArgs(topIni, topValName, retEnv);
        return built_progn(cdr(args), retEnv);
    }
    function built_alert(args) {
        alert(outputObjToStr(car(args)));
        return car(args);
    }

    function built_stringplus(args) {
        var string = function (args) {
            return (cdr(args) === Nil) ? car(args).str : (car(args).str + string(cdr(args)));
        };
        return createString(string(args));
    }

    //XMLHttpRequest関連---------------------------------------------------------------------------------------------
    function Build_get_text_http(args) { //args->(url),直接getしてきて,文字列型で返す
        var url = car(args).str;
        var getTxt = getTextHttpXpcom(url);
        var htmlEle = drawHtmlTag(getTxt); //getしたhtml文章のhtmlタグ内だけ抽出
        return createString(getTxt);
    }
    function Build_get_xml_http(args) { //args->(url),直接getしてきて,文字列型で返す
        var url = car(args).str;
        var getXml = getXmlHttpXpcom(url);    
        return createString(print_tags(0,getXml));
    }
    //-------------------------------------------------
    function Build_draw_googlesearch(args) { //args->google_htmldom
        var htmldoc = car(args).doc;
        var links = htmldoc.getElementsByClassName("l");
        var lst = Nil;
        for(var i=0; i < links.length; i++) {
	    lst = cons(cons(createString(links[i].innerHTML),
			    createString(links[i].href)), lst);
        }
        return reverse(lst);
    }
    //ファイル入出力-----------------------------------------------
    //browser要素に対しての操作-----------------------------------------------------
    function Build_read_url(args) { //args->(url),browserにurl先を表示，それをhtmlDOMのdocumentで返す
        //if(car(args) === Nil) { return Nil; }
        var url = car(args).str;
        var brw = $("my_browser");
        brw.setAttribute("src", url);
        //brw.reload;
        alert("read");
        var htmldoc = brw.contentDocument;
        return createHtmldoc(htmldoc);
    }
    // function Build_read_url(args) { //args->(url),browserにurl先を表示，それをhtmlDOMのdocumentで返す
    //     var url = car(args).str;
    //     var brw = $("my_browser");
    //     var htmldoc;
    //     brw.setAttribute("src", url);
    //     brw.window.addEventListener("load", function(evt) {
    //         htmldoc = brw.contentDocument;
    //     }, false);
    //     return createHtmldoc(htmldoc);
    // }
    function print_tags(domLevel, n) {
        var ret = ret + "<br />レベル " + domLevel + ": ";
        ret = ret + n.nodeName + " ";
        if (n.nodeType === 3) {
	    ret = ret + n.nodeValue;
        }
        if (n.hasChildNodes()) {
	    var child = n.firstChild;
	    ret = ret + " { ";
	    do {
	        ret = ret + child.nodeName + " ";
	        child = child.nextSibling;
	    } while (child);
	    ret = ret + " } ";
	    var children = n.childNodes;
	    for (var i = 0; i < children.length; i++) {
	        ret = ret + print_tags(domLevel+1, children[i]);
	    }
        }
        return ret;
    }
    function Build_print_document(args) {
        var doc = car(args).doc; //alert(output(car(args)));
        var ret = "";
        ret = print_tags(0, doc);
        return createString(ret);        
    }
    //------------------------------------------------------------------------------------------
    function drawHtmlTag(str) {
        var start = str.indexOf("<html") + 1;
        while (str.charAt(start) !== ">") {
	    start++;
        }
        start++;
        var end = str.lastIndexOf("</html>") - 1;
        return str.slice(start, end);
    }

    //web探索言語処理系関連-------------------------------------------------------------------------------
    function Build_cut_table(args) { //目的の部分を切り出す
        var table_dom = car(args).dom;
        var reg = cadr(args).reg;
        var cut_num = 0;

        for (var i =0; i < table_dom.rows[0].cells.length; i++) { //ヘッダーのみマッチング
	    var str = table_dom.rows[0].cells[i].innerHTML;
	    if(reg.test(str)) {
	        cut_num = i;
	        break;
	    }	
        }
        var ret = createCell();
        var current = ret;
        for (var i = 0; i < table_dom.rows.length; i++) {
	    if (cut_num < table_dom.rows[i].cells.length){
	        current.car = createHtmldom("div", table_dom.rows[i].cells[cut_num]);
	        current.cdr = createCell();
	        current = current.cdr;
	    }
        }
        current = Nil;
        return ret;
    }
    function Build_cut_table_rows(args) {
        var table_dom = car(args).dom;
        var row_number = cadr(args).num;

        return createHtmldom("tr", table_dom.rows[row_number]);
    }

    function Build_pull_table (args) {
        var table_dom = car(args).dom;
        var row = cadr(args).num;
        var cel = caddr(args).num;
        return createHtmldom("div", table_dom.rows[row].cells[cel]);
    }
    
    function Build_get_link(args) {  //現在のURLから相対URLを補完
        if(car(args) === Nil) {return Nil;}
        var brw = $("my_browser");
        var htmldoc = brw.contentDocument;
        var now_url = htmldoc.URL;
        var add_url = now_url.match(/http\:\/\/[\w\.\-\/]+\//);
        
        var html_dom = car(args).dom;
        var str = html_dom.innerHTML;
        var ret = str.match(/\<a href=\"[\w\.\/]+\"/);
        var ret2 = "";
        if(ret !== null) {
	    ret2 = add_url + ret[0].slice(9,-1);
	    return createString(ret2);
        }else{
	    return Nil;
        }
    }
    function Build_get_links_all(args) {
        //htmldomのdocumentオブジェクトの入ったリストを受け取り，そのdocumentのすべてのlinkのurlをリストにして返す
        var htmlObj = car(args).doc;
        var ret = createCell();
        var current = ret;
        for (var i=0; i<htmlObj.links.length; i++) {
	    var url = createString();
	    url.str = htmlObj.links[i].href;
	    current.car = url;
	    if (i+1 < htmlObj.links.length) { current.cdr = createCell(); }
	    else { current.cdr = Nil; }
	    current = current.cdr;
        }
        return ret;
    }
    function Build_get_tables_all(args) {
        //htmldomのdocumentオブジェクトの入ったリストを受け取り，そのdocumentのすべてのtableのDOMをリストにして返す
        var htmlObj = car(args).doc;    
        var ret = createCell();
        var current = ret;
        var tableObjs = htmlObj.getElementsByTagName("table");

            for (var i=0; i < tableObjs.length; i++) {
	        var tableObj = createHtmldom("table", tableObjs[i]);
	        current.car = tableObj;
	        if (i+1 < tableObjs.length) { current.cdr = createCell(); }
	        else { current.cdr = Nil; }
	        current = current.cdr;
            }
        return ret;
    }
    function Build_get_tag_all(args) {
        //htmldomのdocumentオブジェクトの入ったリストを受け取り，そのdocumentのすべてのtableのDOMをリストにして返す
        if(car(args) === Nil) { return Nil; }
        var htmlObj = car(args).doc;
        var tag = cadr(args).str;
        var ret = createCell();
        var current = ret;
        var tableObjs = htmlObj.getElementsByTagName(tag);
        
        for (var i=0; i < tableObjs.length; i++) {
	    var tableObj = createHtmldom(tag, tableObjs[i]);
	    current.car = tableObj;
	    if (i+1 < tableObjs.length) { current.cdr = createCell(); }
	    else { current.cdr = Nil; }
	    current = current.cdr;
        }
        return ret;
    }
    
    //-------------------------------------------------------------------------------------------------------------
    function Build_match_tr_rx(args) { //args->(modeltr tableDom),tableにそれが存在するか判定，T,Nilを返す．
        var modelTrLst = car(args);
            var tableObj = cadr(args).dom;
            return matchTr_rx(modelTrLst, tableObj);
    }
    function matchTrCell_rx(args, domCells) {
        //モデルとなる行を表すリストと，tableのtr(tdタグの集合,cellの配列)を受け取り，
        //リストの順にマッチしたらT，最後までマッチしないならNilを返す
        var len = length(args); //alert(output(args) + " " + output(cons(args, Nil)));
        var mLevel = 0;
        var ccel = args;
        for (var i = 0; i + len <= domCells.length; i++) {
	    for (var j = 0; j < len && ccel !== Nil; j++) {
	        var str = domCells[i+j].innerHTML;
	        var reg = car(ccel).reg; 
	        if (reg.test(str)) { mLevel++; }
	        if (mLevel === len) { return T; }
	        ccel = cdr(ccel);
	    }
	    ccel = args;
	    mLevel = 0;
        }
        return Nil;
    }
    function matchTr_rx(args, domTable) {
        //モデルとなる行を表すリストと，tableのDOMを受け取り、
        //tableすべての行に対してマッチングをする，一つでもマッチしたらT，でないならNilを返す
        for (var i=0; i < domTable.rows.length; i++) {
	    if (matchTrCell_rx(args, domTable.rows[i].cells) !== Nil) {
	        return T;
	    }
        }
        return Nil;
    }
    function Build_search_table_rx(args) {
        //tableのモデルを表すリストを受け取り，一番最初にマッチしたtableのdomを返す．
        //htmldomのdocumentオブジェクトの入ったリスト
        var htmlObj = cadr(args).doc;    
        var tableObjs = htmlObj.getElementsByTagName("table");
        var mLevel = 0;
        for (var i=0; i < tableObjs.length; i++) {
	    for (var current = car(args); current !== Nil; current = cdr(current)) {
	        if (matchTr_rx(car(current), tableObjs[i]) !== Nil) { mLevel++; }
	    } 
	    if (mLevel === length(car(args))) { return createHtmldom("table", tableObjs[i]); }
	    mLevel = 0;
        }
        return Nil;
    }
    function Build_match_table_rx(args) {
        var model = car(args);
        var tableObj = cadr(args).dom;
            var mLevel = 0;
            for (var current = model; current !== Nil; current = cdr(current)) {
	        if (matchTr_rx(car(current), tableObj) !== Nil) { mLevel++; }
            }
        return (mLevel === length(model)) ? createHtmldom("table", tableObj) : Nil;
    }


    function Build_iota(args) {
        var max = car(args).num ,
            min = cadr(args).num,
            n = min;
        var f = function () {
            return (max <= n) ? cons(createNumber(n), Nil) : cons(createNumber(n), f(n = n + 1));
        };
        return f();
    }

    function Build_num2string(args) {
        return createString("" + car(args).num);
    }
    function Build_getHtmlHttp(args) {
        var url = car(args).str;
        var getTxt = getTextHttpXpcom(url);
        let getDOMHtmlDocument=function(str){
            let doc;
            let range;
            try{
                if(document.implementation.createHTMLDocument){
                    // Firefox 4.0から
                    doc=document.implementation.createHTMLDocument('');
                    range=doc.createRange();
                    range.selectNodeContents(doc.documentElement);
                    range.deleteContents();
                    doc.documentElement.appendChild(range.createContextualFragment(str));
                }else{
                // Firefox 3.6.xまで
                    let doctype=document.implementation.createDocumentType(
                        'html',
                        '-//W3C//DTD HTML 4.01 Transitional//EN',
                        'http://www.w3.org/TR/html4/loose.dtd'
                    );
                    doc=document.implementation.createDocument(null,'html',doctype);
                    range=doc.createRange();
                    range.selectNodeContents(doc.documentElement);
                    let content=doc.adoptNode(range.createContextualFragment(str));
                    doc.documentElement.appendChild(content);
                }
            }catch(e){
                doc=null;
            }
            return doc;
        };
        return createHtmldoc(getDOMHtmlDocument(getTxt));
    }
    
    //---------------------------------------------------------------------------------------
    function getTextHttpXpcom(url) {
        //httpRequestのGETを使って、urlのhtmlテキストをgetそれを返す
        //url = "http://www.shimane-u.ac.jp/";
        alert("get");
        var str = "";
        var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
        //(Ci.nsIXMLHttpRequest);
        
        request.QueryInterface(Ci.nsIDOMEventTarget);
        request.addEventListener("progress", function(evt) {
        }, false);
        request.addEventListener("load", function(evt) {
	    if (request.readyState === 4 && request.status === 200) {
	        str = request.responseText;
	    }
        }, false);
        request.addEventListener("error", function(evt) {}, false);
        request.QueryInterface(Ci.nsIXMLHttpRequest);
        request.open('GET', url, false);
        request.send(null);
        return str;
    }
    function getXmlHttpXpcom(url) {
        //httpRequestのGETを使って、urlのhtmlテキストをgetそれを返す
        //url = "http://www.shimane-u.ac.jp/";
        alert("get");
        var str = "";
        var request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
        //(Ci.nsIXMLHttpRequest);
        
        request.QueryInterface(Ci.nsIDOMEventTarget);
        request.addEventListener("progress", function(evt) {
        }, false);
        request.addEventListener("load", function(evt) {
	    if (request.readyState === 4 && request.status === 200) {
	        str = request.responseXML;
	    }
        }, false);
        request.addEventListener("error", function(evt) {}, false);
        request.QueryInterface(Ci.nsIXMLHttpRequest);
        request.open('GET', url, false);
        request.send(null);
        return str;
    }
    function aryToList(ary) {
        var root = createCell();
        var current = root;
            for(var i = ary.length - 1; i >= 0; i--) {
	        if (typeof ary[i] === "object") {
	            current.car = AryToList(ary[i]);
	        } else {
	            current.car = createString(ary[i]);
	        }
	        if(i !== 0) {
	            current.cdr = createCell();
	            current = current.cdr;
	        }
            }
        return reverse(root);
    }
    function Build_html_to_doc(args) {
        var htmlStr = car(args).str;
        let getDOMHtmlDocument=function(str){
            let doc;
            let range;
            try{
                if(document.implementation.createHTMLDocument){
                    // Firefox 4.0から
                    doc=document.implementation.createHTMLDocument('');
                    range=doc.createRange();
                    range.selectNodeContents(doc.documentElement);
                    range.deleteContents();
                    doc.documentElement.appendChild(range.createContextualFragment(str));
                }else{
                // Firefox 3.6.xまで
                    let doctype=document.implementation.createDocumentType(
                        'html',
                        '-//W3C//DTD HTML 4.01 Transitional//EN',
                        'http://www.w3.org/TR/html4/loose.dtd'
                    );
                    doc=document.implementation.createDocument(null,'html',doctype);
                    range=doc.createRange();
                    range.selectNodeContents(doc.documentElement);
                    let content=doc.adoptNode(range.createContextualFragment(str));
                    doc.documentElement.appendChild(content);
                }
            }catch(e){
                doc=null;
            }
            return doc;
        };
        return createHtmldoc(getDOMHtmlDocument(htmlStr));
    }

    function Build_write_html(args) {
        var domLst = car(args);
        var fileName = cadr(args).str;
        // var f = function(lst) {
        //     return (cdr(lst) === Nil) ?
        //         "<table border=\"1\">" + outputObjToStr(car(lst)) + "</table>" : "<table border=\"1\">"+outputObjToStr(car(lst))+"</table>" + f(cdr(lst));
        // };
        // var str = f(domLst);
        var f = function(lst) {
            return (cdr(lst) === Nil) ?
                outputObjToStr(car(lst)) : outputObjToStr(car(lst)) + f(cdr(lst));
        };

        var str = '<table border="1">' + f(domLst) + '</table>';
        // alert(str);
        var address = "/content/temp_html/" + fileName;
        // alert(address);
        fileOutput(str, address);
        return createString(str);
    }
    //-----------------------------------------------------------------------------------
    var GlobalEnv = {
        "chainChild" : "root",
        "nil" : Nil ,
        "t" : T
    };
    var builtinSpform = function(formName, formType) {
        GlobalEnv = insertEnv(formName, createSpform(formType), GlobalEnv);
    };
    var builtinFunc = function(funcName, funcType) {
        GlobalEnv = insertEnv(funcName, createFunc(funcType), GlobalEnv);
    };
    (function () {
        // Lisp basic functions
        builtinFunc("car", built_car);
        builtinFunc("cdr", built_cdr);
        builtinFunc("equal", built_equal);
        builtinFunc("atom", built_atom);
        builtinFunc("cons", built_cons);

        // list functions
        builtinFunc("list", built_list);
        builtinFunc("consp", built_consp);
        builtinFunc("length", built_length);
        builtinFunc("append", built_append);
        builtinFunc("reverse", built_reverse);

        builtinFunc("symbolp", built_symbolp);

        // num functions
        builtinFunc("+", built_add);
        builtinFunc("-", built_sub);
        builtinFunc("*", built_mult);
        builtinFunc("/", built_div);
        builtinFunc("mod", built_mod);
        builtinFunc("abs", built_abs);
        builtinFunc("zerop", built_zerop);
        builtinFunc(">", built_inequalityL);
        builtinFunc("<", built_inequalityR);
        builtinFunc("=", built_equalCalc);
        builtinFunc(">=", built_inequalityLe);
        builtinFunc("<=", built_inequalityRe);
        builtinFunc("map", built_map2);

        builtinFunc("regexp-test", built_rx_test);
        builtinFunc("regexp-search", built_rx_search);
        
        builtinSpform("progn", built_progn);
        builtinSpform("define", built_define);
        builtinSpform("defun", built_defun);
        builtinSpform("cond", built_cond);
        builtinSpform("quote", built_quote);
        builtinSpform("setq", built_setq);
        builtinSpform("lambda", built_lambda);
        // builtinSpform("map", built_map);
        builtinSpform("let", built_let);

        builtinFunc("alert", built_alert);
        builtinFunc("string", built_stringplus);
        builtinFunc("iota", Build_iota);
        builtinFunc("num->string", Build_num2string);

        builtinFunc("get-html-http", Build_getHtmlHttp);
        
        //---------------------------------------------------------------------
        builtinFunc("get-links-all", Build_get_links_all);
        builtinFunc("get-tables-all", Build_get_tables_all);
        builtinFunc("get-tag-all", Build_get_tag_all);
        
        builtinFunc("search-table", Build_search_table_rx);
        builtinFunc("match-table", Build_match_table_rx);
        
        builtinFunc("print-document", Build_print_document);
        
        builtinFunc("get-text-http", Build_get_text_http);
        builtinFunc("get-xml-http", Build_get_xml_http);
        builtinFunc("read-url", Build_read_url);
        
        builtinFunc("draw-google", Build_draw_googlesearch);
        builtinFunc("pull-table", Build_pull_table);

        builtinFunc("str->htmldoc", Build_html_to_doc);

        builtinFunc("cut-table", Build_cut_table);
        builtinFunc("get-link", Build_get_link);

        builtinFunc("cut-table-row", Build_cut_table_rows);

        builtinFunc("write-html", Build_write_html);

    }());
    
    var sexpParse = function(src) {
	    var createTokens = function(src) {
	        var transQuote = function(ary) { //'(シングルクオート)部をS式の表現に変換
		    var correspondParenPos = function(ary, pos) { //対応するカッコを見つけて、その配列の位置
		        var i = pos+1;
		        var depth = 1;
		        try {
			    while (depth > 1 || ary[i] !== ")") {
			        if (ary[i] === "(") { depth++; }
			        if (ary[i] === ")") { depth--; }
			        i++;
			    }			
		        } catch (e) {
			    alert("Error ( -> ) nothing.");
		        }
		        return i;
		    };
		    var pos = 0;
		    var i = 0;
		    while (i < ary.length) {
		        if(ary[i] === "'") {
			    if (ary[i+1] === "(") {
			        for (var j=ary.length - 1; j >= i+1; j--) {
				    ary[j+1] = ary[j];
			        }
			        ary[i] = "(";
			        ary[i+1] = "quote";
			        pos = correspondParenPos(ary,i+2);
			        for (var j=ary.length - 1; j >= pos; j--) {
				    ary[j+1] = ary[j];
			        }
			        ary[pos] = ")";
			        i = i + 2;
			    } else {
			        for (var j=ary.length - 1; j >= i+2; j--) {
				    ary[j+2] = ary[j];
			        }
			        ary[i+0] = "(";
			        ary[i+2] = ary[i+1];
			        ary[i+1] = "quote";
			        ary[i+3] = ")";
			        i = i + 3;
			    }
		        }
		        i++;
		    }
		    return ary;
	        };
	        var ary = src.match(/\(|\)|\'|[^\(\)\s]+/g);
	        return transQuote(ary);
	    };

	var parse = function(ary) { return parseAryToObj(ary, 0, ary.length-1);};

	var parseTokenToObj = function(token) { //"("以外のトークンがくる
	    if(isNumber(token)) {
		return createNumber(token);
	    } else if (isString(token)) {
		token = token.slice(1, token.length-1);
		return createString(token);
	    } else if (isRegexp(token)) {
		token = token.slice(2, token.length-1);
		return createRegexp(token);
	    } else { //symbolなら
		return createSymbol(token);
	    }
	};
	var parseAryToObj = function(ary) { //pos=0
	    if (ary[0] === "(") {
		return parseAryToList(ary);
	    } else if (isNumber(ary[0])) {
		return createNumber(ary[0]);
	    } else if (isString(ary[0])){
		ary[0] = ary[0].slice(1, ary[0].length-1);
		return createString(ary[0]);
	    } else if (isRegexp(ary[0])) {
		ary[0] = ary[0].slice(2, ary[0].length-1);
		return createRegexp(ary[0]);
	    } else {
		return createSymbol(ary[0]);
	    }
	};
	var isNumber = function(str) { return /^-?[0-9]+$/.test(str); };
	var isString = function(str) { return (str.search(/\"[\w\W\s\S]*\"/) > -1); };
	var isRegexp = function(str) { return (str.search(/\#\/[\w\W\s\S]*\//) > -1); };
	var parseAryToList = function(ary) {
	    var retCell = createCell();
	    var cell = retCell;
	    for (var i=1; ary[i] !== ")"; i++) {
		if (ary[i] !== "(") {
		    cell.car = parseTokenToObj(ary[i]);
		} else 
		    if (ary[i] === "(") {
			var childAry = [];
			for (var j=0, depth=0; depth > 1 || ary[i+j] !== ")"; j++) {
			    if (ary[i+j] === "(") { depth++; }
			    if (ary[i+j] === ")") { depth--; }
			    childAry[j] = ary[i+j];
			}
			childAry[j] = ")";
			cell.car = parseAryToList(childAry);
			
			i = i + j;
		    }
		if (ary[i+1] !== ")") {
		    cell.cdr = createCell();
		    cell = cell.cdr;
		} else {
		    cell.cdr = Nil;
		}
	    }
	    return retCell;
	};
	var ary = createTokens(src);
	var sexp = parse(ary);
	return sexp;
    };

    //eval-----------------------------------------------------------------------------
    var sexpEval = function(s, env) {
        switch (s.tag) {
          case "number" :
            return s;
          case "string" :
            return s;
          case "regexp" :
            return s;
          case "array" :
            return s;
          case "symbol" :
            var foo = searchEnv(s.name, env);
            return foo;
          case "lambda" :
            return s;
          case "cell" :
            return sApply(sexpEval(car(s), env), cdr(s), env);
        }
    };
    var sApply = function(func, args, env) {
        if (func.tag === "func" || func.tag === "lambda") {
	    args = evlis(args, env);
        }
        switch (func.tag) {
          case "func" :
	    return func.func(args, env);
          case "spform" :
	    return func.form(args, env);
          case "lambda" :
                    func.env = bindArgs(args, func.args, func.env);
	    return built_progn(func.form, func.env);
        }
        return Nil;
    };
    var bindArgs = function(args, formArgs, env) {
        var current = formArgs;
        while (car(current)!==Nil){
            env[car(current).name] = car(args);
            args = cdr(args);
            current = cdr(current);
        }
        return env;
    };
    var chainEnv = function(formArgs, env) {
        var retEnv = { "chainChild" : env };
        var current = formArgs;
        var name = car(current).name;
        for (; car(current) !== Nil; current = cdr(current)) {
            retEnv[car(current).name] = car(current);
        }
        return retEnv;
    };
    var searchEnv = function(name, env) {
        var envX = env;
        while(envX.chainChild !== "root") {
            if(envX[name]) {
                return envX[name];
                } else {
                    envX = envX.chainChild;
                }
        }
        return (envX[name]) ? envX[name] : Nil;
    };
    var evlis = function(args, env) { //argsをすべて評価して、それらをリストにして返す
        var p = args;
        var topCell = createCell();
        var current = topCell;
        while (p !== Nil) {
	    current.car = sexpEval(car(p), env);
	    current.cdr = createCell();
	    if (cdr(p) !== Nil) {
	        current = cdr(current);
	        p = cdr(p);
	    } else {
	        current.cdr = Nil;
	        break;
	    }
        }
        return topCell;
    };
    //output-----------------------------------------------------------
    var outputObjToStr = function(obj) {
        switch (obj.tag) {
          case "number" :
            return String(obj.num);
          case "string" :
            return '"' + obj.str + '"';
          case "array" :
            return obj.ary;
          case "symbol" :
            return obj.name;
            //html
          case "htmldom" :
            return "<" + obj.htag + ">" + obj.dom.innerHTML + "</" + obj.htag+ ">";
          case "htmldoc" :
            return "<html>" + obj.doc.getElementsByTagName("html")[0].innerHTML + "</html>";
            //end
          case "regexp" :
            return "#/" + obj.reg.source + "/";
          case "numrange" :
            return "(NumRange" + obj.max + " " + obj.min + ")";
          case "lambda" :
            return "#lambda " + outputListToStr(obj.form) + "#";
          case "cell" :
            var str;
            str = outputListToStr(obj);
            return str;
        }
    };
    var outputListToStr = function(obj) {
        var str = "";
        str = str + "(";
        str = str + outputObjToStr(car(obj)) + " . ";
        str = str + outputObjToStr(cdr(obj)) + ")";
        return str;
    };
    var self = {
        //env
        "SymbolSet" : SymbolSet,
        "GlobalEnv" : GlobalEnv,
        //function
        "parse" : function(src) { return sexpParse(src); },
        "eval" : function(sObj) { return sexpEval(sObj, this.GlobalEnv); },
        "output" : function(sObj) { return outputObjToStr(sObj); },
        "run" : function(src) {
            var s = this.parse(src);
            s = this.eval(s);
            return this.output(s);
        }
    };
    //alert("test");
    return self;
}());

function getExtensionUrl () {
    const id = "shimane3katagiri@gmail.com";
    var ext = Components.classes["@mozilla.org/extensions/manager;1"]
                    .getService(Components.interfaces.nsIExtensionManager)
                    .getInstallLocation(id)
                    .getItemLocation(id); 
    // ext は nsIFile のインスタンス、ext.path はディレクトリ文字列を保持します
    return ext.path;
}

function fileOutput(str, path) { //文字列strをpathのファイルに保存.
    var rootPath = getExtensionUrl();
    path = rootPath + path; //文字列の連結
    // alert(path);
    
    var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    var charset = "UTF-8";
    //var charset = "SJIS";
    
    file.initWithPath(path);
    if (file) { file.remove(true); }
    file.create(file.NORMAL_FILE_TYPE, 0666);
    
    var fileStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
    fileStream.init(file, 2, 0x200, false);
    
    var converterStream = Cc['@mozilla.org/intl/converter-output-stream;1'].createInstance(Ci.nsIConverterOutputStream);
    converterStream.init(fileStream, charset, str.length, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    converterStream.writeString(str);
    
    converterStream.close();
    fileStream.close();
}

function bwrReload() { //読み込みボタンに対応
    var brw = $("my_browser");
    var str = $("actResult").value;
    
    var url = "/content/temp_html/hoge.html";
    //home
    var url_chrome = "chrome://molsps/content/temp_html/hoge.html";
    fileOutput(str, url);
    if (brw.getAttribute("src") === url_chrome) {
	brw.reload();
    }else {
	brw.setAttribute("src", url_chrome);
    }
}

