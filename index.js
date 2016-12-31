const EventEmitter = require("events").EventEmitter,
      debugLog = require("debug")("WirethingHue"),
      fs = require("fs");


const Light = require("./src/light.js"),
      Api = require("./src/api.js");


class WirethingHue extends EventEmitter {


    constructor (config) {

        super();
        this._config = config || {};
        this._devices = [];

    }


    wirethingInit () {
        this._discoverLights();
        this._discoverSwitches();
    }


    _checkForExistingDevice (uuid) {
        this._devices.forEach((device) => {
            if (uuid === device._uuid) {
                return true;
            }
        });
        return false;
    }


    _discoverLights () {
        return new Promise((resolve, reject) => {

            Api.get("/lights/", this._config).then((json) => {

                let deviceIds = Object.keys(json);

                deviceIds.forEach((id) => {
                    let device = json[id];

                    if (!this._checkForExistingDevice(device.uniqueid)) {
                        let light = new Light(id, device.uniqueid, device.name, device.type, device.state, this._config);

                        this._devices.push(light);
                        this.emit("discover", light);
                    }
                });

                resolve();

            });

        });
    }


    _discoverSwitches () {
        return new Promise((resolve, reject) => {

            Api.get("/sensors/", this._config).then((json) => {
                let deviceIds = Object.keys(json);

                deviceIds.forEach((id) => {
                    //console.log(json[id]);
                });
            });

            resolve();

        });
    }


    static get wirething () {
        return JSON.parse(fs.readFileSync(`${__dirname}/Wirefile`));
    }


}


module.exports = WirethingHue;