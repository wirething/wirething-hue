const EventEmitter = require("events").EventEmitter,
    debugLog = require("debug")("WirethingHue");


const Api = require("./api.js");


class Switch extends EventEmitter {


    constructor (id, uuid, name, deviceType, state, config = {}) {
        super();
        this._config = config;

        this._id = id;
        this.uuid = uuid;
        this.name = name;
        this.deviceType = deviceType;
        this._state = state;
        this._buttonPresses = {};

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


    setState (state) {

        let newDate = +(new Date(state.lastupdated));

        if (["ZGPSwitch", "ZLLSwitch"].indexOf(this.deviceType) >= 0) {
            if (this._buttonPresses[state.buttonevent] && newDate > this._buttonPresses[state.buttonevent]) {
                if (this.deviceType === "ZGPSwitch") {
                    this._handleTapSwitchEvent(state.buttonevent);
                } else if (this.deviceType === "ZLLSwitch") {
                    this._handleDimmerSwitchEvent(state.buttonevent);
                }
            }

            this._buttonPresses[state.buttonevent] = newDate;
        }

        this._state = Object.assign(this._state, state);
        return Promise.resolve();
    }


    _handleTapSwitchEvent (cmd) {
        switch (cmd) {
            case 34:
                this.emit("press", 1);
                break;
            case 16:
                this.emit("press", 2);
                break;
            case 17:
                this.emit("press", 3);
                break;
            case 18:
                this.emit("press", 4);
                break;
        }
    }


    _handleDimmerSwitchEvent (cmd) {
        let button = Math.floor(cmd / 1000),
            event = cmd % 1000;

        switch (event) {
            case 0:
                this.emit("press", button);
                break;
            case 1:
                this.emit("hold", button);
                break;
            case 2:
                this.emit("release", button, 0);
                break;
            case 3:
                this.emit("release", button, 1);
                break;
        }
    }


}


module.exports = Switch;