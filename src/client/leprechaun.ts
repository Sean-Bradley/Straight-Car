import { Scene, Vector3, Raycaster } from 'three'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Leprechaun {
    constructor(scene: Scene, terrain: Terrain, gltfLoader: GLTFLoader, raycaster: Raycaster) {
        const down = new Vector3(0, -1, 0)

        // "Jetpack Leprechaun Test" Model
        // (https://skfb.ly/6Zz7B) by moonvalk is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

        gltfLoader.load('./models/leprechaun.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            mesh.position.set(-10, 0, -150)
            raycaster.set(new Vector3(mesh.position.x, 100, mesh.position.z), down)
            const intersects = raycaster.intersectObject(terrain.mesh, false)
            intersects.length && (mesh.position.y = intersects[0].point.y)
            scene.add(mesh)
        })
    }
}
