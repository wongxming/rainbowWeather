var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

function getMd5(p){
	var str = fs.readFileSync(p,'utf-8');
	var md5um = crypto.createHash('md5');
	md5um.update(str);
	return md5um.digest('hex');
}


exports.getMd5Info = function(pageId){  

var jsPath = path.resolve("./public/js/"+pageId+".js");
var cssPath = path.resolve("./public/css/"+pageId+".css");

var zeptoPath = path.resolve("./public/js/zepto.js");
var mainCssPath = path.resolve("./public/css/main.css");

var hbsPath = path.resolve("./views/"+pageId+".hbs");


var md5Info = {};

md5Info.jsVersion = "js/"+pageId+".js?v="+getMd5(jsPath);
md5Info.cssVersion = "css/"+pageId+".css?v="+getMd5(cssPath);
md5Info.zeptoVersion = "js/zepto.js?v="+getMd5(zeptoPath);
md5Info.mainCssVersion = "css/main.css?v="+getMd5(mainCssPath);
md5Info.pageId = pageId;
md5Info.pageVersion = getMd5(hbsPath);;

return md5Info;
};  