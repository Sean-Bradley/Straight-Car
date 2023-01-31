import { Vector3, Object3D } from 'three'
import Game from './game'

export default class Unicorn {
    mesh = new Object3D()

    constructor(game:Game) {
        // "Unicorn Low Poly Cartoon" Model
        // (https://sketchfab.com/3d-models/unicorn-low-poly-cartoon-0e189bc803054a1e83310a8e98cd92e3) by Akshat (https://sketchfab.com/shooter24994) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)

        game.gltfLoader.load('./models/unicorn.glb', (gltf) => {
            this.mesh = gltf.scene as THREE.Group
            game.scene.add(this.mesh)
        })
    }

    configure(game: Game) {
        const down = new Vector3(0, -1, 0)
        this.mesh.position.set(-10, 0, 505)
        game.raycaster.set(new Vector3(this.mesh.position.x, 1000, this.mesh.position.z), down)
        const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
        intersects.length && (this.mesh.position.y = intersects[0].point.y)
    }
}
