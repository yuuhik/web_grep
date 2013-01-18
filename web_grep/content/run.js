function run() {
    var textBoxSrc = $("programSource");
    var textBoxRlt = $("actResult");
    
    //textBoxSrc.value = "Hello,World!";
    //alert(1);
    var result = MoLsp.run(textBoxSrc.value);
    textBoxRlt.value = result;
    textBoxSrc.select();
}
