/**
 * Created with JetBrains WebStorm.
 * User: katagiri
 * Date: 2013/01/30
 * Time: 4:42
 * To change this template use File | Settings | File Templates.
 */

var ExtendedLibrary = {

  getExtensionUrl:function () {
    const id = "yuuhik@uneune.info";
    var ext = Components.classes["@mozilla.org/extensions/manager;1"]
      .getService(Components.interfaces.nsIExtensionManager)
      .getInstallLocation(id)
      .getItemLocation(id);
    // ext は nsIFile のインスタンス、ext.path はディレクトリ文字列を保持します
    return ext.path;
  },
  fileOutput:function (str, path) { //文字列strをpathのファイルに保存.
    var rootPath = getExtensionUrl();
    path = rootPath + path; //文字列の連結
    // alert(path);

    var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
    var charset = "UTF-8";
    //var charset = "SJIS";

    file.initWithPath(path);
    if (file) {
      file.remove(true);
    }
    file.create(file.NORMAL_FILE_TYPE, 0666);

    var fileStream = Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Ci.nsIFileOutputStream);
    fileStream.init(file, 2, 0x200, false);

    var converterStream = Cc['@mozilla.org/intl/converter-output-stream;1'].createInstance(Ci.nsIConverterOutputStream);
    converterStream.init(fileStream, charset, str.length, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
    converterStream.writeString(str);

    converterStream.close();
    fileStream.close();
  },
  bwrReload:function () { //読み込みボタンに対応
    var brw = $("my_browser");
    var str = $("actResult").value;

    var url = "/content/temp_html/hoge.html";
    //home
    var url_chrome = "chrome://webgrep/content/temp_html/hoge.html";
    fileOutput(str, url);
    if (brw.getAttribute("src") === url_chrome) {
      brw.reload();
    } else {
      brw.setAttribute("src", url_chrome);
    }
  }
};