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

                var result = JSON.parse(body);

                if (result && 0 === result.errcode) {
                    cb.success(result);
                } else {
                    cb.error(result);
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

                var result = JSON.parse(body);

                if (result && 0 === result.errcode) {
                    cb.success(result);
                } else {
                    cb.error(result);
                }
                
            } else {
                cb.error(err);
            }

        });

    }
}
