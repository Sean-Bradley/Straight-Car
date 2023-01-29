import { Group, Mesh, MeshStandardMaterial, Scene, Vector3 } from 'three'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Rainbow {
    constructor(scene: Scene, terrain: Terrain, gltfLoader: GLTFLoader) {
        gltfLoader.load('./models/rainbow.glb', (gltf) => {
            const mesh = gltf.scene as Group
            mesh.scale.setScalar(200)
            console.log(mesh.children[0])
            ;(
                (mesh.children[0] as Mesh).material as MeshStandardMaterial
            ).transparent = true
            ;(
                (mesh.children[0] as Mesh).material as MeshStandardMaterial
            ).opacity = 0.5
            scene.add(mesh)

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
