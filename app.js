var newrelic = require('newrelic');
var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '1mb'}));  //body-parser 解析json格式数据
app.use(bodyParser.urlencoded({            //此项必须在 bodyParser.json 下面,为参数编码
  extended: true
}));

app.use(express.static(__dirname + '/public'));

var NodeCache = require("node-cache");
var myCache = new NodeCache();

var dTalkVerifyUtil = require('./modules/dTalkVerifyUtil');

app.post('/ddWebapp/verification', function(req, res) {
    
    var params = {
        nonce: req.query.nonce,
        timestamp: req.query.timestamp,
        signature: req.query.signature,
        url: decodeURIComponent(req.url),
        encrypt:req.body.encrypt
    };

    dTalkVerifyUtil.verification(params, {
        success: function(data) {
            res.send(data);
        },
        error: function(err) {
            res.send(err);
        }
    });
});



var weather = require('./api/weather');

app.get('/weather', function(req, res) {
    weather.getWeather(req, res, myCache);
});


var manifest = require('./modules/manifest');
app.get('/manifest', manifest.getManifest);


var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');


var FileMd5Util = require('./modules/fileMd5Util');

app.get('/', function(req, res) {

    res.render('home', { resMd5Info: FileMd5Util.getMd5Info('home'), title: '天气预报' });
});
app.get('/:cityId', function(req, res) {

    res.render('home', { resMd5Info: FileMd5Util.getMd5Info('home'), title: '天气预报' });
});

// 创建服务端
http.createServer(app).listen(8080, function() {
    console.log('Server listen http://localhost:8080');
});
