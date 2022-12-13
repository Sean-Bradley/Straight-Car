import { Scene, Group, Vector3, Raycaster } from 'three'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Trees {
    constructor(scene: Scene, terrain: Terrain, count: [number, number, number], gltfLoader: GLTFLoader, raycaster: Raycaster, nextRandom: (_: number) => void) {
        const trees = Array<Group>(count[0] + count[1] + count[2])
        const down = new Vector3(0, -1, 0)

        // "Low Poly Tree Pack" (https://skfb.ly/6REnq) by louieoliva is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

        gltfLoader.load('./models/tree1.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            for (let i = 0; i < count[0]; i++) {
                trees[i] = mesh.clone()
                trees[i].position.set((Number(nextRandom(1)) + 0.1) * 200 * ((Number(nextRandom(1)) * 2) | 0 || -1), 5, (Number(nextRandom(1)) - 0.5) * 1600)
                raycaster.set(new Vector3(trees[i].position.x, 100, trees[i].position.z), down)
                const intersects = raycaster.intersectObject(terrain.mesh, false)
                intersects.length ? (trees[i].position.y = intersects[0].point.y - 0.5) : (trees[i].position.y = -0.5)
                trees[i].scale.setScalar(1 + Number(nextRandom(1)) * 10)
                //trees[i].castShadow = true
                scene.add(trees[i])
            }
        })

        gltfLoader.load('./models/tree2.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            for (let i = count[0]; i < count[0] + count[1]; i++) {
                trees[i] = mesh.clone()
                trees[i].position.set((Number(nextRandom(1)) + 0.1) * 200 * ((Number(nextRandom(1)) * 2) | 0 || -1), 5, (Number(nextRandom(1)) - 0.5) * 1600)
                raycaster.set(new Vector3(trees[i].position.x, 100, trees[i].position.z), down)
                const intersects = raycaster.intersectObject(terrain.mesh, false)
                intersects.length ? (trees[i].position.y = intersects[0].point.y - 0.5) : (trees[i].position.y = -0.5)
                trees[i].scale.setScalar(1 + Number(nextRandom(1)) * 10)
                //trees[i].castShadow = true
                scene.add(trees[i])
            }
        })

        gltfLoader.load('./models/tree3.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            for (let i = count[0] + count[1]; i < count[0] + count[1] + count[2]; i++) {
                trees[i] = mesh.clone()
                trees[i].position.set((Number(nextRandom(1)) + 0.1) * 200 * ((Number(nextRandom(1)) * 2) | 0 || -1), 5, (Number(nextRandom(1)) - 0.5) * 1600)
                raycaster.set(new Vector3(trees[i].position.x, 100, trees[i].position.z), down)
                const intersects = raycaster.intersectObject(terrain.mesh, false)
                intersects.length ? (trees[i].position.y = intersects[0].point.y - 0.5) : (trees[i].position.y = -0.5)
                trees[i].scale.setScalar(1 + Number(nextRandom(1)) * 10)
                //trees[i].castShadow = true
                scene.add(trees[i])
            }
        })
    }
}
