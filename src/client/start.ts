import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { World, Body, Vec3, Box } from 'cannon-es'
import UI from './ui'
import { Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, TextureLoader, Texture } from 'three'
import { Socket } from 'socket.io-client'

export default class Start {
    texture: Texture = new Texture()
    constructor(scene: THREE.Scene, world: World, loader: GLTFLoader, textureLoader: TextureLoader, carBodyId: number, ui: UI, socket: Socket) {
        loader.load('./models/start.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            mesh.position.set(0, 0, 770)
            scene.add(mesh)

            const barrier = new Mesh(new PlaneGeometry(10, 1.5), new MeshBasicMaterial())
            this.texture = textureLoader.load('./img/start.jpg')
            this.texture.wrapS = RepeatWrapping
            barrier.material.map = this.texture
            barrier.material.transparent = true
            barrier.material.opacity = 0.5
            barrier.position.y = 1
            mesh.add(barrier)

            const trigger = new Body({ isTrigger: true })
            trigger.addShape(new Box(new Vec3(3, 1.5, 1)))
            trigger.position.x = mesh.position.x
            trigger.position.y = mesh.position.y + 2
            trigger.position.z = mesh.position.z

            trigger.addEventListener('collide', (e: any) => {
                if (e.contact.bi.id === carBodyId) {
                    ui.startTimer()
                    socket.emit('startTimer', {})
                }
            })

            world.addBody(trigger)

            this.update = (delta: number) => {
                this.texture.offset.x += delta % 1
                this.texture.needsUpdate = true
            }
        })
    }

    update(delta: number) {
        //do not edit this. The function body is created when object is activated
    }
}
