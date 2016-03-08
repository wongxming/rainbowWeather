
var FileMd5Util = require('./fileMd5Util');


exports.getManifest = function(req, res){  

var pageId = req.query.pageId;
var md5Info = FileMd5Util.getMd5Info(pageId);

res.writeHead(200, {'Content-Type': 'text/cache-manifest'});
    
 	res.write('CACHE MANIFEST');
 	res.write('\r\n');
	res.write('# PAGEID '+pageId+':'+ md5Info.pageVersion);
	res.write('\r\n');
	res.write('\r\n');
	res.write('CACHE:');
	res.write('\r\n');
	res.write(md5Info.jsVersion);
	res.write('\r\n');
	res.write(md5Info.cssVersion);
	res.write('\r\n');
	res.write(md5Info.zeptoVersion);
	res.write('\r\n');
	res.write(md5Info.mainCssVersion);

for(var i=0; i<20; i++){
  	res.write('\r\n');
	res.write("imgs/day"+i+".png");
  };
	res.write('\r\n');
	//res.write('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js');
	res.write('\r\n');
	res.write('\r\n');

res.write('\r\n');
    res.write('NETWORK:');
    res.write('\r\n');
    res.write('*');
    res.write('\r\n');
res.write('\r\n');
    res.write('FALLBACK:');
    res.write('\r\n');
    
	res.end();

};  