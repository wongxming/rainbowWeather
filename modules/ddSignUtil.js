var crypto = require('crypto');
var WXBizMsgCrypt = require('wechat-crypto');
var ddAuthUtil = require('./ddAuthUtil');


var sign = {

    getJsapiSign: function(params) {


        var plain = 'jsapi_ticket=' + params.ticket + '&noncestr=' + params.nonceStr +
            '&timestamp=' + params.timeStamp + '&url=' + params.url;
        console.log(plain);
        var sha1 = crypto.createHash('sha1');
        sha1.update(plain, 'utf8');
        return sha1.digest('hex');
    },
    verification: function(params, cb) {
        console.log(params);
        /*
                { nonce: 'beoX0mcQ',
          timestamp: '1459480970197',
          signature: '5e99e6776f0175bb46e2be2fe9a86451a7cfed39',
          url: '/ddWebapp/verification?signature=5e99e6776f0175bb46e2be2fe9a86451a7cfed39&timestamp=1459480970197&nonce=beoX0mcQ',
          encrypt: 'EyLLPYREzxteWl2T3BQ==' }
          */
        var config = {
            token: 'today8weather',
            encodingAESKey: 'tneaaerppmdarj97z43vs5wd75mht47xt1k4v5aeces',
            suiteid: 'suite3ameqjpytd5vnnrg', //第一次验证没有不用填 
            suitesecret: 'Mw5YrZ2_XxKzmxemIhY3vwtTkku8jAB1ZUVCqTQQOJ7YZ65I_lGS2Lfs_TIcnxfe'

        }
        var newCrypt = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.suiteid || 'suite4xxxxxxxxxxxxxxx');
        var TICKET_EXPIRES_IN = config.ticket_expires_in || 1000 * 60 * 20 //20分钟

        var signature = params.signature;
        var timestamp = params.timestamp;
        var nonce = params.nonce;
        var encrypt = params.encrypt;

        if (signature !== newCrypt.getSignature(timestamp, nonce, encrypt)) {
            res.writeHead(401);
            res.end('Invalid signature');
            return;
        }

        var result = newCrypt.decrypt(encrypt);
        console.log('message:'+result.message);
        var message = JSON.parse(result.message);
        if (message.EventType === 'check_update_suite_url' || message.EventType === 'check_create_suite_url') { //创建套件第一步，验证有效性。
            var Random = message.Random;
            var returnData = {};

            returnData.encrypt = newCrypt.encrypt(Random);
            returnData.msg_signature = newCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;


            cb.success(returnData);

        }
    },

    getSign: function(params, cb) {
        console.log(params);
        /*
                { nonce: 'beoX0mcQ',
          timestamp: '1459480970197',
          signature: '5e99e6776f0175bb46e2be2fe9a86451a7cfed39',
          url: '/ddWebapp/verification?signature=5e99e6776f0175bb46e2be2fe9a86451a7cfed39&timestamp=1459480970197&nonce=beoX0mcQ',
          encrypt: 'EyLLPYREzxteWl2T3BQ==' }
          */
        ddAuthUtil.getAccessToken({
            success: function(data) {
                if (data && data.access_token) {
                    accessToken = data.access_token;
                    console.log('sign accessToken: ' + accessToken);
                    ddAuthUtil.getTicket(accessToken, {
                        success: function(data) {
                            if (data && data.ticket) {
                                jsapiTicket = data.ticket;
                                console.log('sign ticket: ' + jsapiTicket);
                                params.ticket = jsapiTicket;
                                var signature = sign.getJsapiSign(params);
                                console.log('sign signature:' + signature);
                                cb.success(signature);
                            } else {
                                error('cannot get jsapi_ticket');
                            }
                        },
                        error: cb.error
                    });
                } else {
                    error('cannot get access_token');
                }
            },
            error: cb.error
        });
    }
};

module.exports = sign;
