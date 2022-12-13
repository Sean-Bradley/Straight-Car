import { Scene, Vector3, Raycaster } from 'three'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Unicorn {
    constructor(scene: Scene, terrain: Terrain, gltfLoader: GLTFLoader, raycaster: Raycaster) {
        const down = new Vector3(0, -1, 0)

        // "Unicorn Low Poly Cartoon" Model
        // (https://sketchfab.com/3d-models/unicorn-low-poly-cartoon-0e189bc803054a1e83310a8e98cd92e3) by Akshat (https://sketchfab.com/shooter24994) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)

        gltfLoader.load('./models/unicorn.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            mesh.position.set(-10, 0, 505)
            raycaster.set(new Vector3(mesh.position.x, 100, mesh.position.z), down)
            const intersects = raycaster.intersectObject(terrain.mesh, false)
            intersects.length && (mesh.position.y = intersects[0].point.y)
            scene.add(mesh)
        })
    }
}
