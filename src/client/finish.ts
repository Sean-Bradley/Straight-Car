import { Vector3, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, Texture, Object3D } from 'three'
import Game from './game'

export default class Finish {
    texture: Texture = new Texture()
    mesh = new Object3D()

    constructor(game: Game) {
        game.gltfLoader.load('./models/finish.glb', (gltf) => {
            this.mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))

            game.scene.add(this.mesh)

            const barrier = new Mesh(new PlaneGeometry(10, 1.5), new MeshBasicMaterial())
            this.texture = game.textureLoader.load('./img/finish.jpg', () => {
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
        })
    }

    configure(game: Game) {
        this.mesh.position.set(0, 1000, -750)
        const down = new Vector3(0, -1, 0)
        game.raycaster.set(this.mesh.position, down)
        const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
        intersects.length ? (this.mesh.position.y = intersects[0].point.y) : (this.mesh.position.y = 5)
    }

    update(delta: number) {
        // do not edit this. The function body is created after texture is setup
    }
}
