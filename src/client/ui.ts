import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Vector3, PerspectiveCamera, AudioListener, Audio, AudioLoader } from 'three'
import Car from './car'
import { Socket } from 'socket.io-client'
import Player from './player'

export default class UI {
    keyMap: { [id: string]: boolean } = {}
    timerValue = 0
    timerInterval?: NodeJS.Timer
    startButton = document.getElementById('startButton') as HTMLButtonElement
    menuPanel = document.getElementById('menuPanel') as HTMLDivElement
    gameClock = document.getElementById('gameClock') as HTMLDivElement
    winnerPanel = document.getElementById('winnerPanel') as HTMLDivElement
    screenNameInput = document.getElementById('screenNameInput') as HTMLInputElement
    controls: OrbitControls
    camera: PerspectiveCamera
    car: Car
    cameraStartPosition = new Vector3()
    private recentWinnersTable: HTMLTableElement
    listener?: AudioListener
    audioLoader = new AudioLoader()

    constructor(controls: OrbitControls, camera: PerspectiveCamera, car: Car, players: { [id: string]: Player }, socket: Socket) {
        this.controls = controls
        this.camera = camera
        this.car = car
        this.cameraStartPosition.copy(camera.position)
        this.recentWinnersTable = document.getElementById('recentWinnersTable') as HTMLTableElement

        this.startButton.addEventListener(
            'click',
            () => {
                this.menuPanel.style.display = 'none'
                this.gameClock.innerText = this.timerValue.toString()
                this.gameClock.style.display = 'block'
                this.recentWinnersTable.style.display = 'block'
                this.controls.enabled = false
                this.car.spawn(new Vector3(0, 10, 780))
                this.car.enabled = true
                if (this.listener === undefined) {
                    this.listener = new AudioListener()
                    camera.add(this.listener)
                }
                car.playCarSounds(this.listener, this.audioLoader)
                Object.keys(players).forEach((p) => {
                    players[p].playCarSound(this.listener as AudioListener, this.audioLoader)
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
                socket.emit('updateScreenName', (e.target as HTMLFormElement).value)
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
        this.car.stopCarSound()
        this.resetTimer()
        this.menuPanel.style.display = 'block'
        this.gameClock.style.display = 'none'
        this.recentWinnersTable.style.display = 'none'
        this.car.enabled = false
        this.camera.position.copy(this.cameraStartPosition)
        this.controls.enabled = true
    }

    atFinishLine() {
        console.log('finished')
        clearInterval(this.timerInterval)
        this.timerInterval = undefined
    }

    updateScoreBoard = (recentWinners: []) => {
        const rows = this.recentWinnersTable.rows
        var i = rows.length
        while (--i) {
            this.recentWinnersTable.deleteRow(i)
        }

        recentWinners.forEach((w: any) => {
            const row = this.recentWinnersTable.insertRow()
            const cell0 = row.insertCell(0)
            cell0.appendChild(document.createTextNode(w.screenName))
            const cell1 = row.insertCell(1)
            cell1.appendChild(document.createTextNode(w.score))
        })
    }
}
