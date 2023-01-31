export default class Player {
    sn = '' // screenName
    e = true // enabled
    s = 0 // starttime
    f = false // at finish line. set when player got set winner notifcation
    r = 0 // total race time
    v = 0 // velocity

    p = { x: 0, y: 0, z: 0 } // position
    q = { _x: 0, _y: 0, _z: 0, _w: 0 } // quaternion

    w = [
        { p: { x: 0, y: 0, z: 0 } }, //, q: { x: 0, y: 0, z: 0, w: 0 } },
        { p: { x: 0, y: 0, z: 0 } }, //, q: { x: 0, y: 0, z: 0, w: 0 } },
        { p: { x: 0, y: 0, z: 0 } }, //, q: { x: 0, y: 0, z: 0, w: 0 } },
        { p: { x: 0, y: 0, z: 0 } }, //, q: { x: 0, y: 0, z: 0, w: 0 } },
    ] // wheels

    t = -1 // ping timestamp

    at = "track0" // activeTrack

    constructor() {}
}
