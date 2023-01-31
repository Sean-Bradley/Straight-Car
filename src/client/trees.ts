import { Scene, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Game from './game'

export default class Trees {
    count: [number, number, number]
    trees: Array<Group>

    constructor(game: Game, count: [number, number, number], completeCB: () => void) {
        this.count = count
        this.trees = Array<Group>(this.count[0] + this.count[1] + this.count[2])

        // "Low Poly Tree Pack" (https://skfb.ly/6REnq) by louieoliva is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

        game.gltfLoader.load('./models/tree1.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            for (let i = 0; i < count[0]; i++) {
                this.trees[i] = mesh.clone()
                game.scene.add(this.trees[i])
            }
            game.gltfLoader.load('./models/tree2.glb', (gltf) => {
                const mesh = gltf.scene as THREE.Group
                //mesh.traverse((m) => (m.castShadow = true))
                for (let i = count[0]; i < count[0] + count[1]; i++) {
                    this.trees[i] = mesh.clone()
                    game.scene.add(this.trees[i])
                }
                game.gltfLoader.load('./models/tree3.glb', (gltf) => {
                    const mesh = gltf.scene as THREE.Group
                    //mesh.traverse((m) => (m.castShadow = true))
                    for (let i = count[0] + count[1]; i < count[0] + count[1] + count[2]; i++) {
                        this.trees[i] = mesh.clone()
                        game.scene.add(this.trees[i])
                    }
                    completeCB()
                })
            })
        })
    }

    configure(game: Game) {
        const down = new Vector3(0, -1, 0)
        for (let i = 0; i < this.count[0]; i++) {
            this.trees[i].position.set((Number(game.nextRandom(1)) + 0.1) * 100 * ((Number(game.nextRandom(1)) * 2) | 0 || -1), 1000, (Number(game.nextRandom(1)) - 0.5) * 1600)
            game.raycaster.set(new Vector3(this.trees[i].position.x, 1000, this.trees[i].position.z), down)
            const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
            intersects.length ? (this.trees[i].position.y = intersects[0].point.y - 0.5) : (this.trees[i].position.y = -0.5)
            this.trees[i].scale.setScalar(1 + Number(game.nextRandom(1)) * 10)
            //trees[i].castShadow = true
        }

        for (let i = this.count[0]; i < this.count[0] + this.count[1]; i++) {
            this.trees[i].position.set((Number(game.nextRandom(1)) + 0.1) * 200 * ((Number(game.nextRandom(1)) * 2) | 0 || -1), 1000, (Number(game.nextRandom(1)) - 0.5) * 1600)
            game.raycaster.set(new Vector3(this.trees[i].position.x, 1000, this.trees[i].position.z), down)
            const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
            intersects.length ? (this.trees[i].position.y = intersects[0].point.y - 0.5) : (this.trees[i].position.y = -0.5)
            this.trees[i].scale.setScalar(1 + Number(game.nextRandom(1)) * 10)
            //trees[i].castShadow = true
        }

        for (let i = this.count[0] + this.count[1]; i < this.count[0] + this.count[1] + this.count[2]; i++) {
            this.trees[i].position.set((Number(game.nextRandom(1)) + 0.1) * 200 * ((Number(game.nextRandom(1)) * 2) | 0 || -1), 1000, (Number(game.nextRandom(1)) - 0.5) * 1600)
            game.raycaster.set(new Vector3(this.trees[i].position.x, 1000, this.trees[i].position.z), down)
            const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
            intersects.length ? (this.trees[i].position.y = intersects[0].point.y - 0.5) : (this.trees[i].position.y = -0.5)
            this.trees[i].scale.setScalar(1 + Number(game.nextRandom(1)) * 10)
            //trees[i].castShadow = true
        }
    }
}
