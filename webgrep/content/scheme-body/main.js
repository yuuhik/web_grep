/**
 * main.js
 * :author yuuhik
 */
var YKS = {};
YKS.sexpPrint = new SexpPrint();
YKS.scaner = new Scaner();
YKS.parser = new Parser();
YKS.eval = new LEval();
YKS.main = function(str) {
  // tokenize
  var tokens = YKS.scaner.scan(str);
  console.log(YKS.sexpPrint.tokens(tokens));
  // parse
  var node_tree = YKS.parser.sexp(tokens);
  console.log(YKS.sexpPrint.sexp(node_tree));
  // eval
  var output_node_tree = YKS.eval.lEval(node_tree);
  console.log(YKS.sexpPrint.sexp(output_node_tree));
  return YKS.sexpPrint.sexp(output_node_tree);
};
