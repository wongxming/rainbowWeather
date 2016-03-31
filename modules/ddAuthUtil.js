var querystring = require("querystring");
var httpUtil = require('./ddHttpsUtil');
var AppInfo = {
    corpId: 'ding2db29c0ac72e6c06',
    secret: 'Pi7u3h7kk85oytqO5XymR6lLDNSWpxC3lluXOAEe2ak_8501ScheeLcT1ZhoOezA'
};


module.exports = {

    getAccessToken: function(cb) {
        var path = '/gettoken?' + querystring.stringify({
            corpid: AppInfo.corpId,
            corpsecret: AppInfo.secret
        });
        httpUtil.get(path, cb);
    },

    getTicket: function(accessToken, cb) {
        var path = '/get_jsapi_ticket?' + querystring.stringify({
            type: 'jsapi',
            access_token: accessToken
        });
        httpUtil.get(path, cb);
    },
};
