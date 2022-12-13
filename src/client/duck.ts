import { Scene, Vector3, Raycaster } from 'three'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Duck {
    constructor(scene: Scene, terrain: Terrain, gltfLoader: GLTFLoader, raycaster: Raycaster) {
        const down = new Vector3(0, -1, 0)

        // "Low poly duckling" Model
        // (https://skfb.ly/6TINK) by Tiberiu Uncu is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

        gltfLoader.load('./models/duck.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            mesh.position.set(-10, 0, 180)
            raycaster.set(new Vector3(mesh.position.x, 100, mesh.position.z), down)
            const intersects = raycaster.intersectObject(terrain.mesh, false)
            intersects.length && (mesh.position.y = intersects[0].point.y)
            scene.add(mesh)
        })
    }
}
