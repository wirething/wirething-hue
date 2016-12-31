const EventEmitter = require("events").EventEmitter,
      debugLog = require("debug")("WirethingHue");


const Api = require("./api.js");


class Light extends EventEmitter {


    constructor (id, uuid, name, deviceType, state, config = {}) {
        super();
        this._config = config;

        this._id = id;
        this.uuid = uuid;
        this.name = name;
        this.deviceType = deviceType;
        this._state = state;

        this.connected = false;

    }


    connect () {
        this.connected = true;
        this.emit("connect");
    }


    disconnect () {
        this.connected = false;
        this.emit("disconnected")
    }


    getState () {
        return this._state;
    }


    setState (state, update = true) {
        this._state = Object.assign(this._state, state);
        if (update) {
            return Api.put(`/lights/${this._id}/state`, this._config, state);
        } else {
            return Promise.resolve();
        }
    }


    turnOn () {
        return this.setState({
            on: true
        });
    }


    turnOff () {
        return this.setState({
            on: false
        });
    }


    setBrightness (bri) {
        return this.setState({
            bri: bri
        });
    }


    setHueAndSaturation (hue, sat) {
        return this.setState({
            hue: hue,
            sat: sat
        });
    }


    setCIEColor (x, y) {
        return this.setState({
            xy: [x, y]
        });
    }


    setColorTemperature (ct) {
        return this.setState({
            ct: ct
        });
    }


    setRGBColor (r, g, b) {
        let X = 0.4124 * r + 0.3576 * g + 0.1805 * b,
            Y = 0.2126 * r + 0.7152 * g + 0.0722 * b,
            Z = 0.0193 * r + 0.1192 * g + 0.9505 * b,
            x = X / (X + Y + Z),
            y = Y / (X + Y + Z);
        return this.setCIEColor(x, y);
    }


}


module.exports = Light;