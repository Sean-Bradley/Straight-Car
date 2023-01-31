import { Vector3, Object3D } from 'three'
import Game from './game'

export default class Leprechaun {
    mesh = new Object3D()

    constructor(game: Game) {
        // "Jetpack Leprechaun Test" Model
        // (https://skfb.ly/6Zz7B) by moonvalk is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

        game.gltfLoader.load('./models/leprechaun.glb', (gltf) => {
            this.mesh = gltf.scene as THREE.Group
            game.scene.add(this.mesh)
        })
    }

    configure(game: Game) {
        const down = new Vector3(0, -1, 0)
        this.mesh.position.set(-10, 0, -150)
        game.raycaster.set(new Vector3(this.mesh.position.x, 1000, this.mesh.position.z), down)
        const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
        intersects.length && (this.mesh.position.y = intersects[0].point.y)
    }
}
