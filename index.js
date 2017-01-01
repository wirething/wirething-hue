const EventEmitter = require("events").EventEmitter,
      debugLog = require("debug")("WirethingHue"),
      fs = require("fs");


const Light = require("./src/light.js"),
      Switch = require("./src/switch.js"),
      Api = require("./src/api.js");


const KnownSensors = ["ZGPSwitch", "ZLLSwitch"],
      KnownLights = ["Color light", "Extended color light"];


class WirethingHue extends EventEmitter {


    constructor (config) {

        super();
        this._config = config || {};
        this._devices = [];

    }


    wirethingInit () {
        setInterval(() => {
            this._discoverLights();
            this._discoverSwitches();
        }, 500);
    }


    _checkForExistingDevice (uuid) {
        for (let i = 0; i < this._devices.length; i++) {
            let device = this._devices[i];
            if (uuid === device.uuid) {
                return device;
            }
        }
        return false;
    }


    _discoverLights () {
        return new Promise((resolve, reject) => {

            Api.get("/lights/", this._config).then((json) => {
                let deviceIds = Object.keys(json);

                deviceIds.forEach((id) => {
                    let device = json[id],
                        existingDevice = this._checkForExistingDevice(device.uniqueid);

                    if (!existingDevice) {
                        if (KnownLights.indexOf(device.type) >= 0) {
                            let light = new Light(id, device.uniqueid, device.name, device.type, device.state, this._config);

                            this._devices.push(light);
                            this.emit("discover", light);
                        }
                    } else {
                        existingDevice.setState(device.state, false);
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
                    let device = json[id],
                        existingDevice = this._checkForExistingDevice(device.uniqueid);

                    if (!existingDevice) {
                        if (KnownSensors.indexOf(device.type) >= 0) {
                            let swi = new Switch(id, device.uniqueid, device.name, device.type, device.state, this._config);

                            this._devices.push(swi);
                            this.emit("discover", swi);
                        }
                    } else {
                        existingDevice.setState(device.state, false);
                    }
                });

                resolve();

            });

            resolve();

        });
    }


    static get wirething () {
        return JSON.parse(fs.readFileSync(`${__dirname}/Wirefile`));
    }


}


module.exports = WirethingHue;