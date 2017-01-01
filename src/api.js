const request = require("request"),
      debugLog = require("debug")("WirethingHue");


class Api {

    static get (endpoint, config) {
        return new Promise((resolve, reject) => {

            let startTime = +(new Date());
            request(`http://${config.bridge}/api/${config.secret}${endpoint}`, (err, res, body) => {
                let endTime = +(new Date());
                //debugLog(`Api GET returned in ${endTime - startTime}ms`);
                if (!err && res.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(err);
                }
            });

        });
    }

    static put (endpoint, config, json) {
        return new Promise((resolve, reject) => {

            request.put(`http://${config.bridge}/api/${config.secret}${endpoint}`, {
                json: json
            }, (err, res, body) => {
                if (!err && res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        try {
                            resolve(eval(body));
                        } catch (e) {
                            reject("Could not parse JSON");
                        }
                    }
                } else {
                    reject(err);
                }
            });

        });
    }

}


module.exports = Api;