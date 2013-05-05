
var run = function () {
    var textBoxSrc = $("programSource");
    var textBoxRlt = $("actResult");
    
    //textBoxSrc.value = "Hello,World!";
    //alert(1);
    var result = YKS.run(textBoxSrc.value);
    textBoxRlt.value = result;
    textBoxSrc.select();
};

