import { Group, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import Game from './game'

export default class Rainbow {
    constructor(game: Game) {
        game.gltfLoader.load('./models/rainbow.glb', (gltf) => {
            const mesh = gltf.scene as Group
            mesh.scale.setScalar(200)
            ;((mesh.children[0] as Mesh).material as MeshStandardMaterial).transparent = true
            ;((mesh.children[0] as Mesh).material as MeshStandardMaterial).opacity = 0.5
            game.scene.add(mesh)

            this.update = (position: Vector3) => {
                mesh.position.x = position.x - 75
                mesh.position.y = position.y
                mesh.position.z = position.z - 200
            }
        })
    }

    update(position: Vector3) {
        // do not edit this. The function body is created after texture is setup
    }
}
