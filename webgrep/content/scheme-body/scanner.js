// my Scaner
var Scaner = function(){};
Scaner.prototype.scan = function(str) {
  // str removed commet and retrun the removed str.
  var removeComment = function (str, commentSpec) {
    return str.replace(commentSpec, "");
  };

  // コメント除去
  var str_removed_comment = removeComment(str, /[;].*$/g);

  // separater
  var separaterSpec = /\(|\)|'|[^\(\)\s]+/g;
  var tokens = str_removed_comment.match(separaterSpec);
  
  this.lexCheck(tokens);

  return tokens;
};
Scaner.prototype.lexCheck = function(tokens){
  var i = 0;
  var n = 0;
  tokens.forEach(function(ele, index, ary) {
    if (ele === '(') { ++n; }
    if (ele === ')') { --n; }
    if (n < 0) {
      throw 'lex-error';
    }
  });
  if (n!==0){
    throw 'lex-error';
  }
  return true;
};
