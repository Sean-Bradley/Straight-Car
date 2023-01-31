"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor() {
        this.sn = ''; // screenName
        this.e = true; // enabled
        this.s = 0; // starttime
        this.f = false; // at finish line. set when player got set winner notifcation
        this.r = 0; // total race time
        this.v = 0; // velocity
        this.p = { x: 0, y: 0, z: 0 }; // position
        this.q = { _x: 0, _y: 0, _z: 0, _w: 0 }; // quaternion
        this.w = [
            { p: { x: 0, y: 0, z: 0 } },
            { p: { x: 0, y: 0, z: 0 } },
            { p: { x: 0, y: 0, z: 0 } },
            { p: { x: 0, y: 0, z: 0 } }, //, q: { x: 0, y: 0, z: 0, w: 0 } },
        ]; // wheels
        this.t = -1; // ping timestamp
        this.at = "track0"; // activeTrack
    }
}
exports.default = Player;
