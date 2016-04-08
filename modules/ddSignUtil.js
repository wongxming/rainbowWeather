var crypto = require('crypto');
var DTalkMsgCrypt = require('./dTalkMsgCrypt');
var ddAuthUtil = require('./ddAuthUtil');
var fs = require('fs');

var config = {
    token: 'today8weather',
    encodingAESKey: 'tneaaerppmdarj97z43vs5wd75mht47xt1k4v5aeces',
    suiteid: 'suite3ameqjpytd5vnnrg', //第一次验证没有不用填 
    suitesecret: 'Mw5YrZ2_XxKzmxemIhY3vwtTkku8jAB1ZUVCqTQQOJ7YZ65I_lGS2Lfs_TIcnxfe',

    /*"suite_ticket"事件每二十分钟推送一次,数据格式如下
                 * {
                      "SuiteKey": "suitexxxxxx",
                      "EventType": "suite_ticket",
                      "TimeStamp": 1234456,
                      "SuiteTicket": "adsadsad"
                    }
                 */
    getTicket: function() {

        fs.readFile(this.suiteid + '_ticket.json', function(err, data) {
            if (err) {
                return '';
            }
            return JSON.parse(data.toString());
        });
    },
    saveTicket: function(data) {

        fs.writeFile(this.suiteid + '_ticket.json', JSON.stringify(data));
    },
    /*"tmp_auth_code"事件将企业对套件发起授权的时候推送,数据格式如下
                {
                  "SuiteKey": "suitexxxxxx",
                  "EventType": " tmp_auth_code",
                  "TimeStamp": 1234456,
                  "AuthCode": "adads"
                }            
                */
    getToken: function() {

        fs.readFile(this.suiteid + '_token.json', function(err, data) {
            if (err) {
                return '';
            }

            return JSON.parse(data.toString());
        });
    },

    saveToken: function(data) {

        fs.writeFile(this.suiteid + '_token.json', JSON.stringify(data));
    }

}

function getJsapiSign(params) {


    var plain = 'jsapi_ticket=' + params.ticket + '&noncestr=' + params.nonceStr +
        '&timestamp=' + params.timeStamp + '&url=' + params.url;

    var sha1 = crypto.createHash('sha1');
    sha1.update(plain, 'utf8');
    return sha1.digest('hex');
};
var nonce_success ='success';

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

            var returnData = {};
            returnData.message = 'Invalid signature';
            cb.success(returnData);
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



            var returnData = {};

            returnData.encrypt = dTalkCrypt.encrypt(nonce_success);
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce_success;
            returnData.msg_signature = dTalkCrypt.getSignature(returnData.timestamp, returnData.nonce, returnData.encrypt); //新签名

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

            returnData.encrypt = dTalkCrypt.encrypt(nonce_success);
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce_success, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce_success;

            console.log("SuiteTicket " + message.SuiteTicket);
            cb.success(returnData);
            config.saveTicket(message);

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

            returnData.encrypt = dTalkCrypt.encrypt(nonce_success);
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce_success, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce_success;

            console.log("AuthCode " + message.AuthCode);
            cb.success(returnData);
            config.saveToken(message);

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

            returnData.encrypt = dTalkCrypt.encrypt(nonce_success);
            returnData.msg_signature = dTalkCrypt.getSignature(timestamp, nonce_success, returnData.encrypt); //新签名
            returnData.timeStamp = timestamp;
            returnData.nonce = nonce_success;

            console.log("AuthCorpId " + message.AuthCorpId);
            cb.success(returnData);

        }
    }

};

module.exports = sign;
