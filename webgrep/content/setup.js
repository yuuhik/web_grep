
var Setup = {};
Setup.default_scm =
    "(let ((x 123))"
    + " (setq make-count (lambda () (let ((x 0)) "
    + "(lambda () (setq x (+ x 1)) x)))) "
    + "(setq f (make-count)) (alert (f)) "
    + "(alert (f)) (alert (f))"
    + "(alert (f)) (alert (f)) x)";

(function () {
  var programSource = $('programSource');
})();
