import { Vector3, AudioListener, AudioLoader } from 'three'
import Game from './game'

export default class UI {
    keyMap: { [id: string]: boolean } = {}
    timerValue = 0
    timerInterval?: NodeJS.Timeout | undefined
    startButton0 = document.getElementById('startButton0') as HTMLButtonElement
    startButton1 = document.getElementById('startButton1') as HTMLButtonElement
    startButton2 = document.getElementById('startButton2') as HTMLButtonElement
    fwdButton = document.getElementById('fwdButton') as HTMLButtonElement
    bwdButton = document.getElementById('bwdButton') as HTMLButtonElement
    respawnButton = document.getElementById('respawnButton') as HTMLButtonElement
    brakeButton = document.getElementById('brakeButton') as HTMLButtonElement   
    menuPanel = document.getElementById('menuPanel') as HTMLDivElement
    loading = document.getElementById('loading') as HTMLDivElement
    buttons = document.getElementById('buttons') as HTMLDivElement
    gameClock = document.getElementById('gameClock') as HTMLDivElement
    winnerPanel = document.getElementById('winnerPanel') as HTMLDivElement
    screenNameInput = document.getElementById('screenNameInput') as HTMLInputElement
    game: Game
    cameraStartPosition = new Vector3()
    private recentWinnersTable: HTMLTableElement
    listener?: AudioListener
    audioLoader = new AudioLoader()
    isMobile = false
    constructor(game: Game) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.isMobile = true
            this.fwdButton.addEventListener('pointerdown', () => {
                this.keyMap['KeyW'] = true
            })
            this.fwdButton.addEventListener('pointerup', (e) => {
                this.keyMap['KeyW'] = false
            })
            this.bwdButton.addEventListener('pointerdown', () => {
                this.keyMap['KeyS'] = true
            })
            this.bwdButton.addEventListener('pointerup', () => {
                this.keyMap['KeyS'] = false
            })
            this.respawnButton.addEventListener('pointerdown', () => {
                this.keyMap['KeyR'] = true
            })
            this.respawnButton.addEventListener('pointerup', () => {
                this.keyMap['KeyR'] = false
            })
            this.brakeButton.addEventListener('pointerdown', () => {
                this.keyMap['Space'] = true
            })
            this.brakeButton.addEventListener('pointerup', () => {
                this.keyMap['Space'] = false
            })
        }

        this.game = game
        this.cameraStartPosition.copy(game.camera.position)
        this.recentWinnersTable = document.getElementById('recentWinnersTable') as HTMLTableElement

        this.startButton0.addEventListener(
            'click',
            () => {
                // EASY level
                this.menuPanel.style.display = 'none'
                this.gameClock.innerText = this.timerValue.toString()
                this.gameClock.style.display = 'block'
                this.recentWinnersTable.style.display = 'block'
                this.isMobile &&
                    ((this.fwdButton.style.display = 'block'),
                    ((this.bwdButton.style.display = 'block'), (this.respawnButton.style.display = 'block'), (this.brakeButton.style.display = 'block')))
                this.game.controls.enabled = false

                this.game.setupTrack('track0')
                this.game.setupCar()

                if (this.listener === undefined) {
                    this.listener = new AudioListener()
                    game.camera.add(this.listener)
                }
                game.car.playCarSounds(this.listener, this.audioLoader)
                Object.keys(game.players).forEach((p) => {
                    game.players[p].playCarSound(this.listener as AudioListener, this.audioLoader)
                })
            },
            false
        )
        this.startButton1.addEventListener(
            'click',
            () => {
                // HARD level
                this.menuPanel.style.display = 'none'
                this.gameClock.innerText = this.timerValue.toString()
                this.gameClock.style.display = 'block'
                this.recentWinnersTable.style.display = 'block'
                this.isMobile &&
                    ((this.fwdButton.style.display = 'block'),
                    ((this.bwdButton.style.display = 'block'), (this.respawnButton.style.display = 'block'), (this.brakeButton.style.display = 'block')))
                this.game.controls.enabled = false

                this.game.setupTrack('track1')
                this.game.setupCar()

                if (this.listener === undefined) {
                    this.listener = new AudioListener()
                    game.camera.add(this.listener)
                }
                game.car.playCarSounds(this.listener, this.audioLoader)
                Object.keys(game.players).forEach((p) => {
                    game.players[p].playCarSound(this.listener as AudioListener, this.audioLoader)
                })
            },
            false
        )
        this.startButton2.addEventListener(
            'click',
            () => {
                // IMPOSSIBLE level
                this.menuPanel.style.display = 'none'
                this.gameClock.innerText = this.timerValue.toString()
                this.gameClock.style.display = 'block'
                this.recentWinnersTable.style.display = 'block'
                this.isMobile &&
                    ((this.fwdButton.style.display = 'block'),
                    ((this.bwdButton.style.display = 'block'), (this.respawnButton.style.display = 'block'), (this.brakeButton.style.display = 'block')))
                this.game.controls.enabled = false

                this.game.setupTrack('track2')
                this.game.setupCar()

                if (this.listener === undefined) {
                    this.listener = new AudioListener()
                    game.camera.add(this.listener)
                }
                game.car.playCarSounds(this.listener, this.audioLoader)
                Object.keys(game.players).forEach((p) => {
                    game.players[p].playCarSound(this.listener as AudioListener, this.audioLoader)
                })
            },
            false
        )

        document.addEventListener('keydown', this.onDocumentKey, false)
        document.addEventListener('keyup', this.onDocumentKey, false)

        this.screenNameInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') blur()
        })
        this.screenNameInput.addEventListener('change', (e) => {
            var letterNumber = /^[0-9a-zA-Z]+$/
            var value = (e.target as HTMLFormElement).value
            if (value.match(letterNumber) && value.length <= 12) {
                game.socket.emit('updateScreenName', (e.target as HTMLFormElement).value)
            } else {
                alert('Alphanumeric and no spaces for player names. Max length 12')
            }
        })
    }

    dispose() {
        clearInterval(this.timerInterval)
        document.removeEventListener('keydown', this.onDocumentKey, false)
        document.removeEventListener('keyup', this.onDocumentKey, false)
    }

    onDocumentKey = (e: KeyboardEvent) => {
        this.keyMap[e.code] = e.type === 'keydown'
    }

    startTimer() {
        //console.log("startTimer")
        this.timerInterval === undefined &&
            (this.timerInterval = setInterval(() => {
                this.timerValue += 1
                this.gameClock.innerText = this.timerValue.toString()
            }, 1000))
    }

    resetTimer() {
        clearInterval(this.timerInterval)
        this.timerInterval = undefined
        this.timerValue = 0
        this.gameClock.innerText = '0'
        this.winnerPanel.style.display = 'none'
    }

    closeGame() {
        this.game.car.stopCarSound()
        this.resetTimer()
        this.menuPanel.style.display = 'block'
        this.gameClock.style.display = 'none'
        this.isMobile && (this.fwdButton.style.display = 'none')
        this.recentWinnersTable.style.display = 'none'
        this.game.car.enabled = false
        this.game.camera.position.copy(this.cameraStartPosition)
        this.game.controls.enabled = true
        this.game.setupTrack('track0')
    }

    atFinishLine() {
        console.log('finished')
        clearInterval(this.timerInterval)
        this.timerInterval = undefined
    }

    updateScoreBoard = (recentWinners: { [key: string]: [] }) => {
        const rows = this.recentWinnersTable.rows
        var i = rows.length
        while (--i) {
            this.recentWinnersTable.deleteRow(i)
        }

        Object.keys(recentWinners).forEach((t) => {
            //console.log(this.game.activeTrack)
            if (t === this.game.activeTrack) {
                recentWinners[t].forEach((w: any) => {
                    const row = this.recentWinnersTable.insertRow()
                    const cell0 = row.insertCell(0)
                    cell0.appendChild(document.createTextNode(w.screenName))
                    const cell1 = row.insertCell(1)
                    cell1.appendChild(document.createTextNode(w.score))
                })
            }
        })
    }

    loaded() {
        this.loading.style.display = 'none'
        this.buttons.style.display = 'block'
    }
}
