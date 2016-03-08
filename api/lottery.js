
var request = require('request')
  , jsdom = require('jsdom').jsdom
  , fs = require('fs')
  , path = require('path')
  , jquery = fs.readFileSync(path.resolve("./modules/jquery.js"), "utf-8");

var options = {
    url: 'http://www.woying.com/kaijiang/ssqls/200.html',
    headers: {
        'User-Agent': 'request'
    }
};

function makeDom(html, domCallback) {
  jsdom.env({
    html: html,
    src: [jquery],
    done: function (errors, window) {
      var $ = window.$;
      domCallback(errors, $);
      window.close();   // 释放window相关资源，否则将会占用很高的内存
    }
  });
};

function parseHtml(html, lotteryCallback) {
  makeDom(html, function (errors, $) {
    //
    var tbody = $('tbody').children().has('td');

    tbody.each(function() { 
		var tr = $(this).children();

		var msg = '';
		tr.each(function(key, value) { 
			if(key<4){
				var text = $(this).html().trim();
				if(text.indexOf('<a') < 0){
					msg += text.replace(/&nbsp;/g,' ').replace(' 21:30','')+' ';
				}
			}
		});
		console.log(msg);
		
	}); 
    
    // 执行回调，通知async本次抓取结束
    lotteryCallback();
  });
}


exports.getLottery = function(lotteryCallback){

	request(options, function callback(error, response, body) {
	    if (!error && response.statusCode == 200) {
	        
			parseHtml(body,lotteryCallback);
	    }
	});
};