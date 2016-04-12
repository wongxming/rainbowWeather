var request = require('request');

var oapiHost = 'https://oapi.dingtalk.com';

module.exports = {
    get: function(path, data, cb) {
        var options = {
            method: 'GET',
            url: oapiHost + path,
            json: data
        };

        request(options, function(err, response, body) {
            if (!err) {

                if (body && 0 === body.errcode) {
                    cb.success(body);
                } else {
                    cb.error(body);
                }

            } else {
                cb.error(err);
            }

        });

    },
    post: function(path, data, cb) {
        var options = {
            method: 'POST',
            url: oapiHost + path,
            json: data
        };

        request(options, function(err, response, body) {
            if (!err) {

                if (body && 0 === body.errcode) {
                    cb.success(body);
                } else {
                    cb.error(body);
                }
                
            } else {
                cb.error(err);
            }

        });

    }
}
