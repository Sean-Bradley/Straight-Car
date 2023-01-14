import {
    Scene,
    Mesh,
    Group,
    Vector3,
    Object3D,
    MeshStandardMaterial,
    Color,
    AudioListener,
    PositionalAudio,
    AudioLoader,
    Audio,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import {
    World,
    Body,
    HingeConstraint,
    Sphere,
    Vec3,
    Quaternion,
    ContactEquation,
} from 'cannon-es'
import UI from './ui'
import Explosion from './explosion'
import { Socket } from 'socket.io-client'

export default class Car {
    enabled: Boolean
    frameMesh = new Mesh()
    wheelLFMesh = new Group()
    wheelRFMesh = new Group()
    wheelLBMesh = new Group()
    wheelRBMesh = new Group()
    frameBody: Body
    private wheelLFBody: Body
    private wheelRFBody: Body
    private wheelLBBody: Body
    private wheelRBBody: Body
    private constraintLF: HingeConstraint
    private constraintRF: HingeConstraint
    private constraintLB: HingeConstraint
    private constraintRB: HingeConstraint
    private thrusting = false
    forwardVelocity = 0

    private explosions: { [id: string]: Explosion } = {}
    //hasWon = false
    explosionCounter = 0
    winnerAnimationInterval?: NodeJS.Timer

    private v = new Vector3()
    private cameraPivot = new Object3D()

    private scene: Scene
    private world: World
    private socket: Socket

    private startEngineSound?: Audio
    private carEngineSound?: PositionalAudio
    private rattleSound: PositionalAudio[] = []

    private KeyRHeldDown = false

    private upsideDownCounter = -1
    private bodyUp = new Vector3()
    private down = new Vector3(0, -1, 0)
    private respawnMessage: HTMLDivElement

    constructor(
        scene: Scene,
        world: World,
        loader: GLTFLoader,
        socket: Socket
    ) {
        //, completeCB: (id: number) => void) {
        this.enabled = false
        this.scene = scene
        this.world = world
        this.socket = socket

        const explosions: { [id: string]: Explosion } = {}
        explosions[0] = new Explosion(new Color(0xff0000), scene)
        explosions[1] = new Explosion(new Color(0x00ff00), scene)
        explosions[2] = new Explosion(new Color(0x0000ff), scene)
        explosions[3] = new Explosion(new Color(0xffff00), scene)
        this.explosions = explosions

        const pipesMaterial = new MeshStandardMaterial()
        pipesMaterial.color = new Color('#ffffff')
        pipesMaterial.roughness = 0.2
        pipesMaterial.metalness = 1

        loader.load('./models/frame.glb', (gltf) => {
            this.frameMesh = gltf.scene.children[0] as THREE.Mesh
            this.frameMesh.material = pipesMaterial
            //this.frameMesh.castShadow = true

            this.cameraPivot.position.set(2.5, 2.5, 2.5)
            this.frameMesh.add(this.cameraPivot)

            scene.add(this.frameMesh)
        })
        loader.load(
            'models/tyre.glb',
            (gltf) => {
                this.wheelLFMesh = gltf.scene
                //this.wheelLFMesh.children[0].castShadow = true
                this.wheelRFMesh = this.wheelLFMesh.clone()
                this.wheelLBMesh = this.wheelLFMesh.clone()
                this.wheelRBMesh = this.wheelLFMesh.clone()
                this.wheelLFMesh.scale.setScalar(0.87)
                this.wheelRFMesh.scale.setScalar(0.87)
                scene.add(this.wheelLFMesh)
                scene.add(this.wheelRFMesh)
                scene.add(this.wheelLBMesh)
                scene.add(this.wheelRBMesh)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )

        this.frameBody = new Body({ mass: 1 })
        this.frameBody.addShape(new Sphere(0.5), new Vec3(0, 0.3, 0.2))
        this.frameBody.addShape(new Sphere(0.25), new Vec3(0, 0.1, 1.2))
        this.frameBody.addShape(new Sphere(0.25), new Vec3(0, 0.1, -1.2))
        this.frameBody.angularFactor.set(1, 0, 0)
        this.frameBody.position.set(0, 0, 0)

        this.frameBody.addEventListener('collide', (e: any) => {
            const r = Math.round(Math.random()) // 1 or 0
            if (this.rattleSound[r] !== undefined) {
                this.rattleSound[r].setVolume(
                    Math.abs(e.contact.getImpactVelocityAlongNormal()) / 25
                )
                if (this.rattleSound[r].isPlaying) this.rattleSound[r].stop()
                this.rattleSound[r].play()
            }
        })

        const wheelLFShape = new Sphere(0.35)
        this.wheelLFBody = new Body({
            mass: 1,
        })
        this.wheelLFBody.addShape(wheelLFShape)
        this.wheelLFBody.position.set(-1, 0, -1)

        const wheelRFShape = new Sphere(0.35)
        this.wheelRFBody = new Body({
            mass: 1,
        })
        this.wheelRFBody.addShape(wheelRFShape)
        this.wheelRFBody.position.set(1, 0, -1)

        const wheelLBShape = new Sphere(0.4)
        this.wheelLBBody = new Body({
            mass: 1,
        })
        this.wheelLBBody.addShape(wheelLBShape)
        this.wheelLBBody.position.set(-1, 0, 1)

        const wheelRBShape = new Sphere(0.4)
        this.wheelRBBody = new Body({
            mass: 1,
        })
        this.wheelRBBody.addShape(wheelRBShape)
        this.wheelRBBody.position.set(1, 0, 1)

        this.constraintLF = new HingeConstraint(
            this.frameBody,
            this.wheelLFBody,
            {
                pivotA: new Vec3(-1, 0, -1),
                axisA: new Vec3(1, -0.25, 0),
            }
        )
        world.addConstraint(this.constraintLF)
        this.constraintRF = new HingeConstraint(
            this.frameBody,
            this.wheelRFBody,
            {
                pivotA: new Vec3(1, 0, -1),
                axisA: new Vec3(1, 0.25, 0),
            }
        )
        world.addConstraint(this.constraintRF)
        this.constraintLB = new HingeConstraint(
            this.frameBody,
            this.wheelLBBody,
            {
                pivotA: new Vec3(-1, 0, 1),
                axisA: new Vec3(1, -0.25, 0),
            }
        )
        world.addConstraint(this.constraintLB)
        this.constraintRB = new HingeConstraint(
            this.frameBody,
            this.wheelRBBody,
            {
                pivotA: new Vec3(1, 0, 1),
                axisA: new Vec3(1, 0.25, 0),
            }
        )
        world.addConstraint(this.constraintRB)

        // //rear wheel drive
        this.constraintLB.enableMotor()
        this.constraintRB.enableMotor()

        this.respawnMessage = document.getElementById(
            'respawnMessage'
        ) as HTMLDivElement
        setInterval(() => {
            if (this.enabled) {
                if (this.isUpsideDown()) {
                    this.upsideDownCounter += 1
                    if (this.upsideDownCounter > 3) {
                        console.log('show respawn message')
                        this.respawnMessage.style.display = 'block'
                    } else {
                        this.respawnMessage.style.display = 'none'
                    }
                } else {
                    this.upsideDownCounter = 0
                }
            }
        }, 1000)
    }

    isUpsideDown() {
        this.bodyUp
            .copy(this.frameMesh.up)
            .applyQuaternion(this.frameMesh.quaternion)
        //console.log(this.down.dot(bodyUp))
        if (this.down.dot(this.bodyUp) > 0) {
            return true
        } else {
            return false
        }
    }

    playCarSounds(listener?: AudioListener, audioLoader?: AudioLoader) {
        if (this.carEngineSound === undefined) {
            console.log('loading all car related audios')

            this.startEngineSound = new Audio(listener as AudioListener)
            audioLoader?.load('./sounds/enginestart.wav', (buffer) => {
                this.startEngineSound?.setBuffer(buffer)
                this.startEngineSound?.setLoop(false)
                this.startEngineSound?.setVolume(0.25)
                this.startEngineSound?.play()
            })

            this.carEngineSound = new PositionalAudio(listener as AudioListener)
            audioLoader?.load('./sounds/engine.wav', (buffer) => {
                this.carEngineSound?.setBuffer(buffer)
                this.carEngineSound?.setLoop(true)
                this.carEngineSound?.play()
            })

            this.frameMesh.add(this.carEngineSound as PositionalAudio)

            this.rattleSound.push(
                new PositionalAudio(listener as AudioListener)
            )
            audioLoader?.load('./sounds/crash.wav', (buffer) => {
                this.rattleSound[0].setBuffer(buffer)
                this.rattleSound[0].setLoop(false)
            })
            this.frameMesh.add(this.rattleSound[0] as PositionalAudio)

            this.rattleSound.push(
                new PositionalAudio(listener as AudioListener)
            )
            audioLoader?.load('./sounds/crash2.wav', (buffer) => {
                this.rattleSound[1].setBuffer(buffer)
                this.rattleSound[1].setLoop(false)
            })
            this.frameMesh.add(this.rattleSound[1] as PositionalAudio)
        } else {
            if (this.startEngineSound?.isPlaying) this.startEngineSound?.stop()
            this.startEngineSound?.play()
            if (this.carEngineSound?.isPlaying) this.carEngineSound?.stop()
            this.carEngineSound?.play()
            this.respawnMessage.style.display = 'none'
        }
    }

    stopCarSound() {
        if (this.carEngineSound?.isPlaying) this.carEngineSound?.stop()
        this.respawnMessage.style.display = 'none'
    }

    update(delta: number, camera: THREE.PerspectiveCamera, ui: UI) {
        if (this.enabled) {
            this.thrusting = false
            if (ui.keyMap['KeyW'] || ui.keyMap['ArrowUp']) {
                if (this.forwardVelocity < 100.0) this.forwardVelocity += 1
                this.thrusting = true
            }
            if (ui.keyMap['KeyS'] || ui.keyMap['ArrowDown']) {
                if (this.forwardVelocity > -100.0) this.forwardVelocity -= 1
                this.thrusting = true
            }

            if (ui.keyMap['Space']) {
                if (this.forwardVelocity > 0) {
                    this.forwardVelocity -= 1
                }
                if (this.forwardVelocity < 0) {
                    this.forwardVelocity += 1
                }
            }

            if (ui.keyMap['KeyR']) {
                if (!this.KeyRHeldDown) {
                    this.KeyRHeldDown = true
                    this.spawn(new Vector3(0, 10, 780))
                    this.playCarSounds()
                    ui.resetTimer()
                }
            } else {
                this.KeyRHeldDown = false
            }

            if (ui.keyMap['Escape']) {
                ui.closeGame()
            }

            if (!this.thrusting) {
                //not going forward or backwards so gradually slow down
                if (this.forwardVelocity > 0) {
                    this.forwardVelocity -= 0.25
                }
                if (this.forwardVelocity < 0) {
                    this.forwardVelocity += 0.25
                }
            }

            this.constraintLB.setMotorSpeed(this.forwardVelocity)
            this.constraintRB.setMotorSpeed(this.forwardVelocity)

            this.frameBody.force.x = 0
            this.wheelLFBody.force.x = 0
            this.wheelRFBody.force.x = 0
            this.wheelLBBody.force.x = 0
            this.wheelRBBody.force.x = 0
            this.frameBody.position.x = 0
            this.wheelLFBody.position.x = -1
            this.wheelRFBody.position.x = 1
            this.wheelLBBody.position.x = -1
            this.wheelRBBody.position.x = 1
            //this.frameBody.angularVelocity.y = 0
            // this.wheelLFBody.angularVelocity.y = 0
            // this.wheelRFBody.angularVelocity.y = 0
            // this.wheelLBBody.angularVelocity.y = 0
            // this.wheelRBBody.angularVelocity.y = 0

            this.frameMesh.position.x = this.frameBody.position.x
            this.frameMesh.position.y = this.frameBody.position.y
            this.frameMesh.position.z = this.frameBody.position.z
            this.frameMesh.quaternion.x = this.frameBody.quaternion.x
            this.frameMesh.quaternion.y = this.frameBody.quaternion.y
            this.frameMesh.quaternion.z = this.frameBody.quaternion.z
            this.frameMesh.quaternion.w = this.frameBody.quaternion.w
            this.wheelLFMesh.position.x = this.wheelLFBody.position.x
            this.wheelLFMesh.position.y = this.wheelLFBody.position.y
            this.wheelLFMesh.position.z = this.wheelLFBody.position.z
            this.wheelLFMesh.quaternion.x = this.wheelLFBody.quaternion.x
            this.wheelLFMesh.quaternion.y = this.wheelLFBody.quaternion.y
            this.wheelLFMesh.quaternion.z = this.wheelLFBody.quaternion.z
            this.wheelLFMesh.quaternion.w = this.wheelLFBody.quaternion.w

            this.wheelRFMesh.position.x = this.wheelRFBody.position.x
            this.wheelRFMesh.position.y = this.wheelRFBody.position.y
            this.wheelRFMesh.position.z = this.wheelRFBody.position.z
            this.wheelRFMesh.quaternion.x = this.wheelRFBody.quaternion.x
            this.wheelRFMesh.quaternion.y = this.wheelRFBody.quaternion.y
            this.wheelRFMesh.quaternion.z = this.wheelRFBody.quaternion.z
            this.wheelRFMesh.quaternion.w = this.wheelRFBody.quaternion.w

            this.wheelLBMesh.position.x = this.wheelLBBody.position.x
            this.wheelLBMesh.position.y = this.wheelLBBody.position.y
            this.wheelLBMesh.position.z = this.wheelLBBody.position.z
            this.wheelLBMesh.quaternion.x = this.wheelLBBody.quaternion.x
            this.wheelLBMesh.quaternion.y = this.wheelLBBody.quaternion.y
            this.wheelLBMesh.quaternion.z = this.wheelLBBody.quaternion.z
            this.wheelLBMesh.quaternion.w = this.wheelLBBody.quaternion.w

            this.wheelRBMesh.position.x = this.wheelRBBody.position.x
            this.wheelRBMesh.position.y = this.wheelRBBody.position.y
            this.wheelRBMesh.position.z = this.wheelRBBody.position.z
            this.wheelRBMesh.quaternion.x = this.wheelRBBody.quaternion.x
            this.wheelRBMesh.quaternion.y = this.wheelRBBody.quaternion.y
            this.wheelRBMesh.quaternion.z = this.wheelRBBody.quaternion.z
            this.wheelRBMesh.quaternion.w = this.wheelRBBody.quaternion.w

            this.constraintLB.setMotorSpeed(this.forwardVelocity)
            this.constraintRB.setMotorSpeed(this.forwardVelocity)

            this.cameraPivot.getWorldPosition(this.v)
            this.v.y = Math.max(this.frameMesh.position.y + 2.5, this.v.y)
            camera.position.lerp(this.v, delta * 3)
            camera.lookAt(this.frameMesh.position)

            Object.keys(this.explosions).forEach((o) => {
                this.explosions[o].update()
            })
            ;(this.carEngineSound as PositionalAudio).setPlaybackRate(
                Math.abs(this.forwardVelocity / 35) + Math.random() / 9
            )
        }
    }

    spawn(startPosition: Vector3) {
        this.socket.emit('spawn', {})

        this.enabled = false
        //this.hasWon = false
        this.explosionCounter = 0

        this.world.removeBody(this.frameBody)
        this.world.removeBody(this.wheelLFBody)
        this.world.removeBody(this.wheelRFBody)
        this.world.removeBody(this.wheelLBBody)
        this.world.removeBody(this.wheelRBBody)

        this.forwardVelocity = 0

        const o = new Object3D()
        o.position.copy(startPosition)
        const q = new Quaternion().set(
            o.quaternion.x,
            o.quaternion.y,
            o.quaternion.z,
            o.quaternion.w
        )

        this.frameBody.velocity.set(0, 0, 0)
        this.frameBody.angularVelocity.set(0, 0, 0)
        this.frameBody.position.set(
            startPosition.x,
            startPosition.y,
            startPosition.z
        )
        this.frameBody.quaternion.copy(q)

        this.wheelLFBody.velocity.set(0, 0, 0)
        this.wheelLFBody.angularVelocity.set(0, 0, 0)
        this.wheelLFBody.position.set(
            startPosition.x - 1,
            startPosition.y,
            startPosition.z - 1
        )
        this.wheelLFBody.quaternion.copy(q)

        this.wheelRFBody.velocity.set(0, 0, 0)
        this.wheelRFBody.angularVelocity.set(0, 0, 0)
        this.wheelRFBody.position.set(
            startPosition.x + 1,
            startPosition.y,
            startPosition.z - 1
        )
        this.wheelRFBody.quaternion.copy(q)

        this.wheelLBBody.velocity.set(0, 0, 0)
        this.wheelLBBody.angularVelocity.set(0, 0, 0)
        this.wheelLBBody.position.set(
            startPosition.x - 1,
            startPosition.y,
            startPosition.z + 1
        )
        this.wheelLBBody.quaternion.copy(q)

        this.wheelRBBody.velocity.set(0, 0, 0)
        this.wheelRBBody.angularVelocity.set(0, 0, 0)
        this.wheelRBBody.position.set(
            startPosition.x + 1,
            startPosition.y,
            startPosition.z + 1
        )
        this.wheelRBBody.quaternion.copy(q)

        this.world.step(0.001) //apply above changes

        this.world.addBody(this.frameBody)
        this.world.addBody(this.wheelLFBody)
        this.world.addBody(this.wheelRFBody)
        this.world.addBody(this.wheelLBBody)
        this.world.addBody(this.wheelRBBody)

        this.fix()

        this.enabled = true

        //this.carSound.play()
    }

    explode() {
        //removes all constraints for this car so that parts separate
        //this.enabled = false
        console.log('in explode')

        this.world.removeConstraint(this.constraintLF)
        this.world.removeConstraint(this.constraintRF)
        this.world.removeConstraint(this.constraintLB)
        this.world.removeConstraint(this.constraintRB)

        const v = this.frameBody.velocity
        v.y *= 3
        this.wheelLFBody.velocity = v.scale(Math.random())
        this.wheelRFBody.velocity = v.scale(Math.random())
        this.wheelLBBody.velocity = v.scale(Math.random())
        this.wheelRBBody.velocity = v.scale(Math.random())
        this.frameBody.velocity = v.scale(Math.random())

        this.explosions[this.explosionCounter].explode(this.frameMesh.position)
        this.explosionCounter += 1
        this.winnerAnimationInterval === undefined &&
            (this.winnerAnimationInterval = setInterval(() => {
                //console.log("winnerAnimationInterval setInterval")
                this.explosions[this.explosionCounter].explode(
                    this.frameMesh.position
                )
                this.explosionCounter += 1
                if (this.explosionCounter > 3) {
                    this.explosionCounter = 0
                }
            }, 250))
    }

    fix() {
        clearInterval(this.winnerAnimationInterval)
        this.winnerAnimationInterval = undefined
        if (this.world.constraints.length === 0) {
            console.log('fixing')
            this.world.addConstraint(this.constraintLF)
            this.world.addConstraint(this.constraintRF)
            this.world.addConstraint(this.constraintLB)
            this.world.addConstraint(this.constraintRB)
        }
    }
}
