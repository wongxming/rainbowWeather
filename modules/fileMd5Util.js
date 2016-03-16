var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

function getMd5(p) {
    var str = fs.readFileSync(p, 'utf-8');
    var md5um = crypto.createHash('md5');
    md5um.update(str);
    return md5um.digest('hex');
}


exports.getMd5Info = function(pageId) {

    var jsPath = path.resolve("./public/js/" + pageId + ".js");
    var cssPath = path.resolve("./public/css/" + pageId + ".css");

    var utilPath = path.resolve("./public/js/utils.js");
    var zeptoPath = path.resolve("./public/js/jquery-2.1.4.min.js");
    var mainCssPath = path.resolve("./public/css/main.css");

    var hbsPath = path.resolve("./views/" + pageId + ".hbs");

    var muiJsVersion = path.resolve("./public/js/mui.min.js");
    var muiCssVersion = path.resolve("./public/css/mui.min.css");

    var md5Info = {};

    md5Info.jsVersion = "js/" + pageId + ".js?v=" + getMd5(jsPath);
    md5Info.cssVersion = "css/" + pageId + ".css?v=" + getMd5(cssPath);
    md5Info.zeptoVersion = "js/jquery-2.1.4.min.js?v=" + getMd5(zeptoPath);
    md5Info.mainCssVersion = "css/main.css?v=" + getMd5(mainCssPath);
    md5Info.pageId = pageId;
    md5Info.pageVersion = getMd5(hbsPath);


    md5Info.utilVersion = "js/utils.js?v=" + getMd5(utilPath);

    md5Info.muiJsVersion = "js/mui.min.js?v=" + getMd5(muiJsVersion);
    md5Info.muiCssVersion = "css/mui.min.css?v=" + getMd5(muiCssVersion);

    return md5Info;
};
