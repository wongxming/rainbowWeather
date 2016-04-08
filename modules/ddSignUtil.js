var crypto = require('crypto');
var DTalkMsgCrypt = require('./dTalkMsgCrypt');
var ddAuthUtil = require('./ddAuthUtil');
var fs = require('fs');

var config = {
    token: 'today8weather',
    encodingAESKey: 'tneaaerppmdarj97z43vs5wd75mht47xt1k4v5aeces',
    suiteid: 'suite3ameqjpytd5vnnrg', //第一次验证没有不用填 
    suitesecret: 'Mw5YrZ2_XxKzmxemIhY3vwtTkku8jAB1ZUVCqTQQOJ7YZ65I_lGS2Lfs_TIcnxfe',

    getTicket: function(callback) {
        //从数据库中取出Tikcet，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
        //ticket从 dingtalk_suite_callback 处获得
        fs.readFile(this.suiteid + '_ticket.json', function(err, data) {
            if (err) {
                return callback(err);
            }
            data = JSON.parse(data.toString());
            callback(null, data);
        });
    },

    getToken: function(callback) {
        //从数据库中取出Token，返回的data样式为：{value: 'xxxxxxx', expires:1452735301543}
        fs.readFile(this.suiteid + '_token.json', function(err, data) {
            if (err) {
                return callback(err);
            }
            data = JSON.parse(data.toString());
            callback(null, data);
        });
    },

    saveToken: function(data, callback) {
        //存储Token到数据库中，data样式为：{value: 'xxxxxxx', expires:1452735301543//过期时间}
        fs.writeFile(this.suiteid + '_token.json', JSON.stringify(data), callback);
    }

}

function getJsapiSign(params) {


    var plain = 'jsapi_ticket=' + params.ticket + '&noncestr=' + params.nonceStr +
        '&timestamp=' + params.timeStamp + '&url=' + params.url;

    var sha1 = crypto.createHash('sha1');
    sha1.update(plain, 'utf8');
    return sha1.digest('hex');
};

var sign = {


    verification: function(params, cb) {
        console.log(params);
        /*
                { nonce: 'beoX0mcQ',
          timestamp: '1459480970197',
          signature: '5e99e6776f0175bb46e2be2fe9a86451a7cfed39',
          url: '/ddWebapp/verification?signature=5e99e6776f0175bb46e2be2fe9a86451a7cfed39&timestamp=1459480970197&nonce=beoX0mcQ',
          encrypt: 'EyLLPYREzxteWl2T3BQ==' }
          */

        var dTalkCrypt = new DTalkMsgCrypt(config.token, config.encodingAESKey, config.suiteid || 'suite4xxxxxxxxxxxxxxx');
        var TICKET_EXPIRES_IN = config.ticket_expires_in || 1000 * 60 * 20 //20分钟

        var signature = params.signature;
        var timestamp = params.timestamp;
        var nonce = params.nonce;
        var encrypt = params.encrypt;

        if (signature !== dTalkCrypt.getSignature(timestamp, nonce, encrypt)) {
            res.writeHead(401);
            res.end('Invalid signature');
            return;
        }

        var result = dTalkCrypt.decrypt(encrypt);
        console.log('message:' + result.message);
        var message = JSON.parse(result.message);

        if (message.EventType === 'check_update_suite_url' || message.EventType === 'check_create_suite_url') { //创建套件第一步，验证有效性。

            /*"check_create_suite_url"事件将在创建套件的时候推送
             * {
                  "EventType":"check_create_suite_url",
                  "Random":"brdkKLMW",
                  "TestSuiteKey":"suite4xxxxxxxxxxxxxxx"
                }
             */
            /* "check_update_suite_url"事件将在更新套件的时候推送
             * {
                  "EventType":"check_update_suite_url",
                  "Random":"Aedr5LMW",
                  "TestSuiteKey":"suited6db0pze8yao1b1y"
                
                }
             */


            var Random = message.Random;
            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt(Random);
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;


            cb.success(returnData);

        } else if (message.EventType === 'suite_ticket') {
            /*"suite_ticket"事件每二十分钟推送一次,数据格式如下
             * {
                  "SuiteKey": "suitexxxxxx",
                  "EventType": "suite_ticket",
                  "TimeStamp": 1234456,
                  "SuiteTicket": "adsadsad"
                }
             */

            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt('success');
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;

            console.log("SuiteTicket " + message.SuiteTicket);
            cb.success(returnData);

        } else if (message.EventType === 'tmp_auth_code') {
            /*"tmp_auth_code"事件将企业对套件发起授权的时候推送,数据格式如下
            {
              "SuiteKey": "suitexxxxxx",
              "EventType": " tmp_auth_code",
              "TimeStamp": 1234456,
              "AuthCode": "adads"
            }            
            */
            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt('success');
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;

            console.log("SuiteTicket " + message.SuiteTicket);
            cb.success(returnData);

        } else if (message.EventType === 'change_auth') {
            /*"change_auth"事件将在企业授权变更消息发生时推送,数据格式如下
            {
              "SuiteKey": "suitexxxxxx",
              "EventType": " change_auth",
              "TimeStamp": 1234456,
              "AuthCorpId": "xxxxx"
            }
            */
            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt('success');
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;

            console.log("SuiteTicket " + message.SuiteTicket);
            cb.success(returnData);

        } else if (message.EventType === 'change_auth') {
            /*"change_auth"事件将在企业授权变更消息发生时推送,数据格式如下
            {
              "SuiteKey": "suitexxxxxx",
              "EventType": " change_auth",
              "TimeStamp": 1234456,
              "AuthCorpId": "xxxxx"
            }
            */
            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt('success');
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce;

            console.log("SuiteTicket " + message.SuiteTicket);
            cb.success(returnData);

        }
    }

};

module.exports = sign;
