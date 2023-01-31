import { Vector3, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, TextureLoader, Texture, Object3D } from 'three'
import { Body, Vec3, Box } from 'cannon-es'
import Game from './game'

export default class Start {
    texture: Texture = new Texture()
    mesh = new Object3D()
    trigger = new Body()

    constructor(game: Game) {
        game.gltfLoader.load('./models/start.glb', (gltf) => {
            this.mesh = gltf.scene as THREE.Group

            game.scene.add(this.mesh)

            const barrier = new Mesh(new PlaneGeometry(10, 1.5), new MeshBasicMaterial())

            this.texture = game.textureLoader.load('./img/start.jpg', () => {
                // now texture is loaded, allow updating it on render
                this.update = (delta: number) => {
                    this.texture.offset.x += delta % 1
                    this.texture.needsUpdate = true
                }
            })
            this.texture.wrapS = RepeatWrapping
            barrier.material.map = this.texture
            barrier.material.transparent = true
            barrier.material.opacity = 0.5
            barrier.position.y = 1
            this.mesh.add(barrier)

            this.trigger = new Body({ isTrigger: true })
            this.trigger.addShape(new Box(new Vec3(3, 1.5, 1)))

            this.trigger.addEventListener('collide', (e: any) => {
                if (e.contact.bi.id === game.car.frameBody.id) {
                    game.ui.startTimer()
                    game.socket.emit('startTimer', {})
                }
            })

            game.world.addBody(this.trigger)
        })
    }

    configure(game: Game) {
        //mesh.traverse((m) => (m.castShadow = true))
        this.mesh.position.set(0, 1000, 770)
        const down = new Vector3(0, -1, 0)
        game.raycaster.set(this.mesh.position, down)
        const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
        intersects.length ? (this.mesh.position.y = intersects[0].point.y) : (this.mesh.position.y = 0)

        this.trigger.position.x = this.mesh.position.x
        this.trigger.position.y = this.mesh.position.y + 2
        this.trigger.position.z = this.mesh.position.z
    }

    update(delta: number) {
        // do not edit this. The function body is created after texture is setup
    }
}
