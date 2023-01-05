import { World } from 'cannon-es'
import { Scene, Raycaster, TextureLoader, PerspectiveCamera } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Terrain from './terrain'
import Car from './car'
import Boulders from './boulders'
import Logs from './logs'
import Trees from './trees'
import Start from './start'
import Finish from './finish'
import Unicorn from './unicorn'
import Mushroom from './mushroom'
import Pumpkin from './pumpkin'
import Duck from './duck'
import Chicken from './chicken'
import Shoebill from './shoebill'
import Spider from './spider'
import Leprechaun from './leprechaun'
import Coins from './coins'
import UI from './ui'
import { io } from 'socket.io-client'
import Player from './player'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Game {
    terrain: Terrain
    car: Car
    boulders?: Boulders
    logs?: Logs
    trees?: Trees

    ui: UI
    start?: Start
    finish?: Finish

    scene: Scene
    world: World
    camera: PerspectiveCamera
    controls: OrbitControls
    gltfLoader: GLTFLoader
    textureLoader: TextureLoader
    raycaster: Raycaster

    socket = io()
    myId = ''
    updateInterval?: NodeJS.Timer //used to update server
    timestamp = 0
    players: { [id: string]: Player } = {}

    constructor(
        scene: Scene,
        world: World,
        camera: PerspectiveCamera,
        controls: OrbitControls,
        gltfLoader: GLTFLoader,
        textureLoader: TextureLoader,
        raycaster: Raycaster
    ) {
        this.scene = scene
        this.world = world
        this.camera = camera
        this.controls = controls
        this.gltfLoader = gltfLoader
        this.textureLoader = textureLoader
        this.raycaster = raycaster

        this.car = new Car(this.scene, this.world, this.gltfLoader, this.socket)
        this.ui = new UI(
            this.controls,
            this.camera,
            this.car,
            this.players,
            this.socket
        )

        //sockets
        this.socket.on('connect', function () {
            console.log('connected')
        })
        this.socket.on('disconnect', (message: any) => {
            console.log('disconnected ' + message)
            clearInterval(this.updateInterval)
            Object.keys(this.players).forEach((p) => {
                this.players[p].dispose()
            })
        })
        this.socket.on(
            'joined',
            (id: string, screenName: string, recentWinners: []) => {
                this.myId = id
                this.ui.screenNameInput.value = screenName
                this.ui.menuPanel.style.display = 'block'

                this.updateInterval = setInterval(() => {
                    this.socket.emit('update', {
                        t: Date.now(),
                        e: this.car.enabled,
                        p: this.car.frameMesh.position,
                        q: this.car.frameMesh.quaternion,
                        v: this.car.forwardVelocity,
                        w: [
                            {
                                p: this.car.wheelLFMesh.position,
                            },
                            {
                                p: this.car.wheelRFMesh.position,
                            },
                            {
                                p: this.car.wheelLBMesh.position,
                            },
                            {
                                p: this.car.wheelRBMesh.position,
                            },
                        ],
                    })
                }, 50)

                this.ui.updateScoreBoard(recentWinners)
            }
        )
        this.socket.on('removePlayer', (p: string) => {
            console.log('deleting player ' + p)
            this.players[p].dispose()
            delete this.players[p]
        })

        this.socket.on('winner', (time) => {
            this.car.explode()
            ;(
                document.getElementById('winnerPanel') as HTMLDivElement
            ).style.display = 'block'
            ;(
                document.getElementById('winnerScreenName') as HTMLDivElement
            ).innerHTML = (
                document.getElementById('screenNameInput') as HTMLInputElement
            ).value
            ;(
                document.getElementById('winnerTime') as HTMLDivElement
            ).innerHTML = time + ' sec'
        })

        this.socket.on('winnersTable', (recentWinners: []) => {
            this.ui.updateScoreBoard(recentWinners)
        })

        this.socket.on('gameData', (gameData: any) => {
            let pingStatsHtml = 'Socket Ping Stats<br/><br/>'
            Object.keys(gameData.players).forEach((p) => {
                this.timestamp = Date.now()
                pingStatsHtml +=
                    gameData.players[p].sn +
                    ' ' +
                    gameData.players[p].r +
                    ' ' +
                    (this.timestamp - gameData.players[p].t) +
                    'ms<br/>'
                if (p !== this.myId) {
                    if (!this.players[p]) {
                        console.log('adding player ' + p)
                        this.players[p] = new Player(scene, gltfLoader)
                        this.ui.listener !== undefined &&
                            this.players[p].playCarSound(
                                this.ui.listener as THREE.AudioListener,
                                this.ui.audioLoader
                            )
                        //console.log(ui.listener)
                    }
                    this.players[p].updateTargets(gameData.players[p])
                }
            })
            ;(
                document.getElementById('pingStats') as HTMLDivElement
            ).innerHTML = pingStatsHtml
        })

        const terrainLoaded = () => {
            this.start = new Start(
                this.scene,
                this.world,
                this.gltfLoader,
                this.textureLoader,
                this.car.frameBody.id,
                this.ui,
                this.socket
            )
            this.finish = new Finish(
                this.scene,
                this.gltfLoader,
                this.textureLoader
            )

            //load obstacles now that terrain height calculated

            // a seedable RNG. https://gist.github.com/blixt/f17b47c62508be59987b
            // so that obstacles are positioned the same each game.
            const LCG = (s: number) => (_: number) =>
                (s = Math.imul(741103597, s) >>> 0) / 2 ** 32
            const nextRandom = LCG(3816034944)

            this.boulders = new Boulders(
                this.scene,
                this.world,
                this.terrain,
                25,
                this.textureLoader,
                this.raycaster,
                nextRandom
            )

            this.logs = new Logs(
                this.scene,
                this.world,
                this.terrain,
                25,
                this.gltfLoader,
                this.textureLoader,
                this.raycaster,
                nextRandom
            )

            new Trees(
                this.scene,
                this.terrain,
                [50, 50, 50],
                this.gltfLoader,
                this.raycaster,
                nextRandom
            )

            new Unicorn(this.scene, this.terrain, gltfLoader, raycaster)

            new Mushroom(this.scene, this.terrain, gltfLoader, raycaster)

            new Pumpkin(this.scene, this.terrain, gltfLoader, raycaster)

            new Duck(this.scene, this.terrain, gltfLoader, raycaster)

            new Chicken(this.scene, this.terrain, gltfLoader, raycaster)

            new Shoebill(this.scene, this.terrain, gltfLoader, raycaster)

            new Spider(this.scene, this.terrain, gltfLoader, raycaster)

            new Leprechaun(this.scene, this.terrain, gltfLoader, raycaster)

            new Coins(this.scene, this.terrain, gltfLoader, raycaster)

            this.update = (delta: number) => {
                this.car.update(delta, this.camera, this.ui),
                    this.boulders?.update(),
                    this.logs?.update(),
                    this.start?.update(delta),
                    this.finish?.update(delta),
                    Object.keys(this.players).forEach((p) => {
                        this.players[p].update()
                    })
            }
        }

        this.terrain = new Terrain(
            scene,
            world,
            gltfLoader,
            textureLoader,
            raycaster,
            terrainLoaded
        )
    }

    update(delta: number) {
        // do not edit this. The function body is created after trrrain is loaded
    }
}
