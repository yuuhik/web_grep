dom.event.addEventListener(window, "load", setup);

function setup(event){
    var box = $("run");
    dom.event.addEventListener(box , "click", evalss);
}

function evalss() {
    $("hoge").value = runYkLsp($("lispSrc").value);
}
