import { Scene, Mesh, Group, MeshStandardMaterial, Color, Vector3, Quaternion, PositionalAudio, AudioListener, AudioLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'

export default class Player {
    private scene: Scene
    private frameMesh = new Mesh()
    private wheelLFMesh = new Group()
    private wheelRFMesh = new Group()
    private wheelLBMesh = new Group()
    private wheelRBMesh = new Group()
    enabled = false
    private screenName = ''
    private lastScreenName = ''
    private annotationDiv = document.createElement('div')
    private targetPosFrame = new Vector3()
    private targetQuatFrame = new Quaternion()
    private targetPosWheelLF = new Vector3()
    private targetPosWheelRF = new Vector3()
    private targetPosWheelLB = new Vector3()
    private targetPosWheelRB = new Vector3()

    carSound?: PositionalAudio

    constructor(scene: THREE.Scene, gltfLoader: GLTFLoader) {
        this.scene = scene

        const pipesMaterial = new MeshStandardMaterial()
        pipesMaterial.color = new Color('#ffffff')
        pipesMaterial.roughness = 0.2
        pipesMaterial.metalness = 1
        pipesMaterial.transparent = true
        pipesMaterial.opacity = 0.5

        gltfLoader.load('./models/frame.glb', (gltf) => {
            this.frameMesh = gltf.scene.children[0] as THREE.Mesh
            this.frameMesh.material = pipesMaterial
            //this.frameMesh.castShadow = true
            this.scene.add(this.frameMesh)

            gltfLoader.load('./models/tyre.glb', (gltf) => {
                this.wheelLFMesh = gltf.scene
                //this.wheelLFMesh.children[0].castShadow = true
                ;((this.wheelLFMesh.children[0] as Mesh).material as MeshStandardMaterial).transparent = true
                ;((this.wheelLFMesh.children[0] as Mesh).material as MeshStandardMaterial).opacity = 0.5
                this.wheelRFMesh = this.wheelLFMesh.clone()
                this.wheelLBMesh = this.wheelLFMesh.clone()
                this.wheelRBMesh = this.wheelLFMesh.clone()
                this.wheelLFMesh.scale.setScalar(0.85)
                this.wheelRFMesh.scale.setScalar(0.85)
                scene.add(this.wheelLFMesh)
                scene.add(this.wheelRFMesh)
                scene.add(this.wheelLBMesh)
                scene.add(this.wheelRBMesh)
            })

            this.annotationDiv.className = 'annotationLabel'
            this.annotationDiv.innerHTML = this.screenName
            const annotationLabel = new CSS2DObject(this.annotationDiv)
            annotationLabel.position.copy(this.frameMesh.position)
            annotationLabel.position.y += 1
            this.frameMesh.add(annotationLabel)
        })
    }

    playCarSound(listener: AudioListener, audioLoader: AudioLoader) {
        console.log('setting up players carSound')
        if (this.carSound === undefined) {
            this.carSound = new PositionalAudio(listener)
            audioLoader.load('./sounds/engine.wav', (buffer) => {
                this.carSound?.setBuffer(buffer)
                this.carSound?.setLoop(true)
                this.carSound?.setVolume(0.5)
                this.carSound?.play()
                console.log("playing players audio")
            })
            this.frameMesh.add(this.carSound as PositionalAudio)
        }
    }
    stopCarSound() {
        this.carSound?.stop()
    }

    updateTargets(data: any) {
        this.screenName = data.sn
        if (this.lastScreenName !== this.screenName) {
            //changed
            this.annotationDiv.innerHTML = this.screenName
            this.lastScreenName = this.screenName
        }

        this.targetPosFrame.set(data.p.x, data.p.y, data.p.z)
        this.targetQuatFrame.set(data.q._x, data.q._y, data.q._z, data.q._w).normalize()
        this.targetPosWheelLF.set(data.w[0].p.x, data.w[0].p.y, data.w[0].p.z)
        this.targetPosWheelRF.set(data.w[1].p.x, data.w[1].p.y, data.w[1].p.z)
        this.targetPosWheelLB.set(data.w[2].p.x, data.w[2].p.y, data.w[2].p.z)
        this.targetPosWheelRB.set(data.w[3].p.x, data.w[3].p.y, data.w[3].p.z)
        
        this.carSound !== undefined && (this.carSound as PositionalAudio).setPlaybackRate(Math.abs(data.v / 35) + Math.random() / 9)
  
    }

    update() {
        this.frameMesh.position.lerp(this.targetPosFrame, 0.2)
        this.frameMesh.quaternion.slerp(this.targetQuatFrame, 0.2)
        this.wheelLFMesh.position.lerp(this.targetPosWheelLF, 0.2)
        this.wheelRFMesh.position.lerp(this.targetPosWheelRF, 0.2)
        this.wheelLBMesh.position.lerp(this.targetPosWheelLB, 0.2)
        this.wheelRBMesh.position.lerp(this.targetPosWheelRB, 0.2)
    }

    dispose() {
        this.scene.remove(this.frameMesh)
        this.scene.remove(this.wheelLFMesh)
        this.scene.remove(this.wheelRFMesh)
        this.scene.remove(this.wheelLBMesh)
        this.scene.remove(this.wheelRBMesh)
        this.annotationDiv.remove()
    }
}
