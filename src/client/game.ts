import { World } from 'cannon-es'
import { Scene, Raycaster, TextureLoader, PerspectiveCamera, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Terrain from './terrain'
import Car from './car'
import Boulders from './boulders'
import Logs from './logs'
import Trees from './trees'
import Start from './start'
import Finish from './finish'
// import Unicorn from './unicorn'
// import Mushroom from './mushroom'
// import Pumpkin from './pumpkin'
// import Duck from './duck'
// import Chicken from './chicken'
// import Shoebill from './shoebill'
// import Spider from './spider'
// import Leprechaun from './leprechaun'
// import Coins from './coins'
import Rainbow from './rainbow'
import UI from './ui'
import { io } from 'socket.io-client'
import Player from './player'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// a seedable RNG. https://gist.github.com/blixt/f17b47c62508be59987b
// so that obstacles are positioned the same each game.
const LCG = (s: number) => (_: number) => (s = Math.imul(741103597, s) >>> 0) / 2 ** 32

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
    renderer: WebGLRenderer
    controls: OrbitControls
    gltfLoader: GLTFLoader
    textureLoader: TextureLoader
    raycaster: Raycaster

    // unicorn?: Unicorn
    // mushroom?: Mushroom
    // pumpkin?: Pumpkin
    // duck?: Duck
    // chicken?: Chicken
    // shoeBill?: Shoebill
    // spider?: Spider
    // leprechaun?: Leprechaun
    // coins?: Coins

    rainbow?: Rainbow

    socket = io()
    myId = ''
    updateInterval?:  NodeJS.Timeout | undefined //used to update server
    timestamp = 0
    players: { [id: string]: Player } = {}

    activeTrack = 'track0'
    seed = 3816034944
    nextRandom = LCG(this.seed)

    constructor(
        scene: Scene,
        world: World,
        camera: PerspectiveCamera,
        renderer: WebGLRenderer,
        controls: OrbitControls,
        gltfLoader: GLTFLoader,
        textureLoader: TextureLoader,
        raycaster: Raycaster
    ) {
        this.scene = scene
        this.world = world
        this.camera = camera
        this.renderer = renderer
        this.controls = controls
        this.gltfLoader = gltfLoader
        this.textureLoader = textureLoader
        this.raycaster = raycaster

        this.car = new Car(this)
        this.ui = new UI(this)

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
        this.socket.on('joined', (id: string, screenName: string) => {
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
                    at: this.activeTrack,
                })
            }, 50)
        })
        this.socket.on('removePlayer', (p: string) => {
            console.log('deleting player ' + p)
            this.players[p].dispose()
            delete this.players[p]
        })

        this.socket.on('winner', (time) => {
            this.car.explode()
            ;(document.getElementById('winnerPanel') as HTMLDivElement).style.display = 'block'
            ;(document.getElementById('winnerScreenName') as HTMLDivElement).innerHTML = (document.getElementById('screenNameInput') as HTMLInputElement).value
            ;(document.getElementById('winnerTime') as HTMLDivElement).innerHTML = time + ' sec'
        })

        this.socket.on('winnersTable', (recentWinners: { [key: string]: [] }) => {
            this.ui.updateScoreBoard(recentWinners)
        })

        this.socket.on('gameData', (gameData: any) => {
            let pingStatsHtml = 'Socket Ping Stats<br/><br/>'
            Object.keys(gameData.players).forEach((p) => {
                this.timestamp = Date.now()
                pingStatsHtml += gameData.players[p].sn + ' ' + gameData.players[p].r + ' ' + (this.timestamp - gameData.players[p].t) + 'ms<br/>'
                if (p !== this.myId) {
                    if (!this.players[p]) {
                        console.log('adding player ' + p)
                        this.players[p] = new Player(scene, gltfLoader)
                        this.ui.listener !== undefined && this.players[p].playCarSound(this.ui.listener as THREE.AudioListener, this.ui.audioLoader)
                        //console.log(ui.listener)
                    }
                    this.players[p].updateTargets(gameData.players[p])
                }
            })
            ;(document.getElementById('pingStats') as HTMLDivElement).innerHTML = pingStatsHtml
        })

        this.start = new Start(this)

        this.finish = new Finish(this)

        // this.unicorn = new Unicorn(this)

        // this.mushroom = new Mushroom(this)

        // this.pumpkin = new Pumpkin(this)

        // this.duck = new Duck(this)

        // this.chicken = new Chicken(this)

        // this.shoeBill = new Shoebill(this)

        // this.spider = new Spider(this)

        // this.leprechaun = new Leprechaun(this)

        // this.coins = new Coins(this)

        this.rainbow = new Rainbow(this)

        const terrainLoadedCallBack = () => {
            this.start?.configure(this)
            this.finish?.configure(this)
            // this.unicorn?.configure(this)
            // this.mushroom?.configure(this)
            // this.pumpkin?.configure(this)
            // this.duck?.configure(this)
            // this.chicken?.configure(this)
            // this.shoeBill?.configure(this)
            // this.spider?.configure(this)
            // this.leprechaun?.configure(this)
            // this.coins?.configure(this)

            const bouldersLoadedCallBack = () => {
                this.boulders?.configure(this)
            }
            this.boulders = new Boulders(this, 25, bouldersLoadedCallBack)

            const logsLoadedCallBack = () => {
                this.logs?.configure(this)
            }
            this.logs = new Logs(this, 25, logsLoadedCallBack)

            const treesLoadedCallBack = () => {
                this.trees?.configure(this)
            }
            this.trees = new Trees(this, [50, 50, 50], treesLoadedCallBack)

            this.renderer.compile(this.scene, this.camera)

            this.update = (delta: number) => {
                this.car.update(delta, this.camera, this.ui),
                    this.boulders?.update(),
                    this.logs?.update(),
                    this.start?.update(delta),
                    this.finish?.update(delta),
                    this.rainbow?.update(this.camera.position)
                Object.keys(this.players).forEach((p) => {
                    this.players[p].update()
                })
            }
            this.ui.loaded()
        }
        this.terrain = new Terrain(this, terrainLoadedCallBack)
    }

    setupTrack(track: string) {
        this.activeTrack = track
        this.terrain.setupTrack(track)
        this.start?.configure(this)
        this.finish?.configure(this)

        this.nextRandom = LCG(this.seed)

        this.boulders?.configure(this)
        this.logs?.configure(this)
        this.trees?.configure(this)
        // this.unicorn?.configure(this)
        // this.mushroom?.configure(this)
        // this.pumpkin?.configure(this)
        // this.duck?.configure(this)
        // this.chicken?.configure(this)
        // this.shoeBill?.configure(this)
        // this.spider?.configure(this)
        // this.leprechaun?.configure(this)
        // this.coins?.configure(this)
    }

    setupCar() {
        switch (this.activeTrack) {
            case 'track0':
                this.car.spawn(new Vector3(0, 506, 780))
                break
            case 'track1':
                this.car.spawn(new Vector3(0, 5, 780))
                break
            case 'track2':
                this.car.spawn(new Vector3(0, 5, 780))
                break
        }

        this.car.enabled = true
    }

    update(delta: number) {
        // do not edit this. The function body is created after trrrain is loaded
    }
}
