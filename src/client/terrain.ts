import { World, Vec3, Body, Heightfield } from 'cannon-es'
import { Scene, Mesh, Vector3, TextureLoader, RepeatWrapping, Raycaster } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Game from './game'

export default class Terrain {
    mesh: Mesh = new Mesh()
    tracks: { [id: string]: Mesh } = {}
    game: Game

    constructor(game: Game, completeCB: () => void) {
        this.game = game
        const map = game.textureLoader.load('./img/aerial_grass_rock_diff_1k.jpg')
        const normalMap = game.textureLoader.load('./img/aerial_grass_rock_nor_dx_1k.jpg')
        game.gltfLoader.load('./models/terrains-transformed.glb', (gltf) => {
            gltf.scene.children.forEach((c, i) => {
                this.tracks[c.name] = c as THREE.Mesh
                ;(c as THREE.Mesh).geometry.scale(100, 100, 100)
                const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial
                m.map = map
                m.map.wrapS = m.map.wrapT = RepeatWrapping
                m.map.repeat.set(16, 16)
                m.normalMap = normalMap
                m.normalMap.wrapS = m.normalMap.wrapT = RepeatWrapping
                m.normalMap.repeat.set(16, 16)

                c.visible = false
            })
            game.scene.add(gltf.scene)

            this.setupTrack('track0')

            completeCB()
        })
    }

    setupTrack(track: string) {
        Object.keys(this.tracks).forEach((t) => (this.tracks[t].visible = false))
        this.mesh = this.tracks[track]
        this.tracks[track].visible = true
        this.calculateHeightfields()
    }

    calculateHeightfields() {
        // rebuild Heightfields in case we changed level
        const bodiesToRemove: Body[] = []
        this.game.world.bodies.forEach((b) => {
            if (b.shapes[0] instanceof Heightfield) {
                bodiesToRemove.push(b)
            }
        })
        bodiesToRemove.forEach((b) => {
            this.game.world.removeBody(b)
        })

        const down = new Vector3(0, -1, 0)
        const elementSize = 6

        for (let offsetZ = -130; offsetZ <= 130; offsetZ += 10) {
            // creating cannon Heightfield tiles (2x5) of the main terrain geomoetry so that cannon will manage it faster
            const matrix: number[][] = []
            for (let x = -1; x <= 1; x++) {
                matrix.push([])
                for (let z = -5 - offsetZ; z <= 5 - offsetZ; z++) {
                    this.game.raycaster.set(new Vector3(x * elementSize, 1000, -z * elementSize), down)
                    const intersects = this.game.raycaster.intersectObject(this.mesh, false)
                    matrix[x + 1][z + 5 + offsetZ] = intersects.length
                        ? intersects[0].point.y //* 8
                        : 0
                }
            }
            const terrainShape = new Heightfield(matrix, {
                elementSize: elementSize,
            })
            const terrainBody = new Body({ mass: 0 })
            terrainBody.addShape(terrainShape)
            terrainBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
            terrainBody.position.x = -1 * elementSize
            //terrainBody.position.y = 0.1
            terrainBody.position.z = 5 * elementSize + offsetZ * elementSize
            this.game.world.addBody(terrainBody)
        }
    }
}
