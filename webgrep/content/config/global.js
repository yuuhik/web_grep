
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
var $$ = function(str) {
  return Aaa.document.getElementById(str);
};

var Cc_mozilla_XHR = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"];

