import socketIO from 'socket.io'
import Player from './player'

export default class Game {
    io: socketIO.Server

    recentWinners = {}

    winnersCalculated = false

    players: { [id: string]: Player } = {}
    playerCount = 367

    constructor(io: socketIO.Server) {
        this.recentWinners['track0'] = [
            { screenName: 'seanwasere', score: 90.3 },
            { screenName: 'seanwasere', score: 91.5 }
        ]
        this.recentWinners['track1'] = [
            { screenName: 'sbcode', score: 232.5 },
            { screenName: 'cosmo', score: 251.3 },
            { screenName: 'emmy', score: 267.1 },
            { screenName: 'ball-vr', score: 275.2 },
            { screenName: 'fcs', score: 293.8 },
        ]
        this.recentWinners['track2'] = [
            { screenName: 'NewKrok', score: 106.2 },
            { screenName: 'seanwasere', score: 147.2 },
            { screenName: 'seanwasere', score: 147.4 },
            { screenName: 'seanwasere', score: 153.7 },
            { screenName: 'seanwasere', score: 157.7 },
            { screenName: 'sbcode', score: 232.5 },
            { screenName: 'cosmo', score: 251.3 },
            { screenName: 'emmy', score: 267.1 },
            { screenName: 'ball-vr', score: 275.2 },
            { screenName: 'fcs', score: 293.8 },
        ]

        this.io = io

        this.io.on('connection', (socket: any) => {
            this.players[socket.id] = new Player()
            this.players[socket.id].sn = 'Guest' + this.playerCount++

            console.log('a user connected : ' + socket.id)
            this.recalcWinnersTable()
            socket.emit('joined', socket.id, this.players[socket.id].sn)

            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id)
                if (this.players && this.players[socket.id]) {
                    console.log('deleting ' + socket.id)
                    delete this.players[socket.id]
                    io.emit('removePlayer', socket.id)
                }
            })

            socket.on('update', (message: any) => {
                if (this.players[socket.id]) {
                    this.players[socket.id].e = message.e
                    this.players[socket.id].t = message.t
                    this.players[socket.id].p = message.p
                    this.players[socket.id].q = message.q
                    this.players[socket.id].v = message.v
                    this.players[socket.id].w[0].p = message.w[0].p
                    //this.players[socket.id].w[0].q = message.w[0].q
                    this.players[socket.id].w[1].p = message.w[1].p
                    //this.players[socket.id].w[1].q = message.w[1].q
                    this.players[socket.id].w[2].p = message.w[2].p
                    //this.players[socket.id].w[2].q = message.w[2].q
                    this.players[socket.id].w[3].p = message.w[3].p
                    //this.players[socket.id].w[3].q = message.w[3].q
                    this.players[socket.id].at = message.at

                    if (this.players[socket.id].e && this.players[socket.id].s > 0) {
                        if (!this.players[socket.id].f) {
                            const totalTime = Math.round(((Date.now() - this.players[socket.id].s) / 1000) * 10) / 10
                            this.players[socket.id].r = totalTime // race time
                            if (this.players[socket.id].p.z < -750) { //-750
                                this.players[socket.id].f = true // at finish line
                                this.recalcWinnersTable()
                                socket.emit('winner', totalTime)
                                this.io.emit('winnersTable', this.recentWinners)
                            }
                        }
                    } else {
                        this.players[socket.id].r = 0
                    }
                }
            })

            socket.on('spawn', () => {
                console.log(Date.now() + ' spawned')
                this.players[socket.id].r = 0
                this.players[socket.id].s = 0
                this.players[socket.id].f = false
                socket.emit('winnersTable', this.recentWinners)
            })

            socket.on('startTimer', () => {
                this.players[socket.id].s = Date.now()
            })

            socket.on('updateScreenName', (screenName: string) => {
                console.log(screenName)
                if (screenName.match(/^[0-9a-zA-Z]+$/) && screenName.length <= 12) {
                    this.players[socket.id].sn = screenName
                }
            })

            socket.on('enable', () => {
                this.players[socket.id].e = true
            })
        })

        setInterval(() => {
            this.io.emit('gameData', {
                players: this.players,
            })
        }, 50)

        // setInterval(() => {
        //     //do somethin here if it only needs slower updates
        // }, 1000)
    }

    recalcWinnersTable = () => {
        let lowestScore = 0
        let lowestScoreScreenName = ''

        //add all players with score > 0
        Object.keys(this.players).forEach((p) => {
            if (this.players[p].r > 60 && this.players[p].f) { // > 60
                this.recentWinners[this.players[p].at].push({
                    screenName: this.players[p].sn,
                    score: this.players[p].r, // race time
                })
            }
            if (this.players[p].r < lowestScore) {
                lowestScore = this.players[p].r
                lowestScoreScreenName = this.players[p].sn
            }
        })

        //sort
        Object.keys(this.recentWinners).forEach((t) => {
            this.recentWinners[t].sort((a: any, b: any) => (a.score > b.score ? 1 : b.score > a.score ? -1 : 0))
            //keep top scores
            while (this.recentWinners[t].length > 9) {
                this.recentWinners[t].pop()
            }
        })

        this.winnersCalculated = true
    }
}
