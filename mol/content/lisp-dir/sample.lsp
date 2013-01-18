(progn
  (setq model '((#/[真][^偽]/ #/真/ #/偽/) (#/偽/ #/偽/ #/偽/)))
  (search-table model (read-url "http://ja.wikipedia.org/wiki/%E6%8E%92%E4%BB%96%E7%9A%84%E8%AB%96%E7%90%86%E5%92%8C")))

(map (lambda (x) (+ x x)) '(5 7 9))

(progn
 (setq links (get-links-all (read-url "http://www.cis.shimane-u.ac.jp/")))
 (define shimane-search (lambda (str) (cond ((regexp-test #/www\.cis\.shimane\-u\.ac\.jp/ str) t) (t nil))))
 (map shimane-search links))

(draw-google (read-url "http://www.google.co.jp/search?q=firefox"))

(regexp-search #/自作PC/ "自作PCをはじめた。")

(progn
 (setq model '((#/真/ #/真/ #/偽/) (#/偽/ #/偽/ #/偽/)))
 (setq mydoc (read-url "http://ja.wikipedia.org/wiki/%E6%8E%92%E4%BB%96%E7%9A%84%E8%AB%96%E7%90%86%E5%92%8C"))
 (setq table-list (get-tag-all mydoc "table"))
 (setq m-table (lambda (x) (match-table model x)))
 (m-table (car table-list)))

(progn
 (setq doc (read-url "http://www.cis.shimane-u.ac.jp/"))
 (get-tag-all doc "li"))

(progn
 (setq model '((#/真/ #/真/ #/偽/)))
 (setq mydoc (read-url "http://ja.wikipedia.org/wiki/%E6%8E%92%E4%BB%96%E7%9A%84%E8%AB%96%E7%90%86%E5%92%8C"))
 (setq table-list (get-tag-all mydoc "table"))
 (match-table model (car table-list)))

(progn
 (setq model '((#/地点/)))
 (search-table model (read-url "http://www.data.jma.go.jp/obd/stats/data/mdrr/synopday/data1s.html")))

(progn
  (setq table-model
	'((#/[真][^偽]/ #/真/ #/偽/) (#/偽/ #/偽/ #/偽/)))
  (setq links (map cdr (draw-google (html2doc (get-text-http "http://www.google.co.jp/search?q=真理値表+-filetype%3Apdf")))))
  (map (lambda (link) (search-table table-model (html2doc (get-text-http link)))) links))

(setq links (map cdr (draw-google 
      (read-url "http://www.google.co.jp/search?q=真理値表"))))

(progn
  (setq model '((#/物件コード/)))
  (setq t-list (cut-table (car (get-tag-all (read-url 
     "http://www.raci-ne.co.jp/bukken/reikin0.html") "table"))
        #/詳細/))
 (setq links (map get-link t-list))
 (map (lambda (link) (search-table model (read-url link))) links)))

(get-links-all (html2doc
 (get-text-http "http://www.shimane-u.ac.jp/")))
