import { World, Vec3, Body, Heightfield } from 'cannon-es'
import { Scene, Mesh, Vector3, TextureLoader, RepeatWrapping, Raycaster } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Terrain {
    mesh: Mesh = new Mesh()

    constructor(
        scene: Scene,
        world: World,
        loader: GLTFLoader,
        textureLoader: TextureLoader,
        raycaster: Raycaster,
        completeCB: () => void
    ) {
        loader.load('./models/terrain.glb', (gltf) => {
            this.mesh = gltf.scene.children[0] as THREE.Mesh
            //this.mesh.receiveShadow = true
            this.mesh.geometry.scale(100, 50, 100)
            const m = this.mesh.material as THREE.MeshStandardMaterial
            //m.wireframe = true
            m.map = textureLoader.load('./img/aerial_grass_rock_diff_1k.jpg')
            m.map.wrapS = m.map.wrapT = RepeatWrapping
            m.map.repeat.set(16, 16)
            m.normalMap = textureLoader.load('./img/aerial_grass_rock_nor_dx_1k.jpg')
            m.normalMap.wrapS = m.normalMap.wrapT = RepeatWrapping
            m.normalMap.repeat.set(16, 16)

            const down = new Vector3(0, -1, 0)
            const elementSize = 6

            for (let offsetZ = -130; offsetZ <= 130; offsetZ += 10) {
                // creating cannon Heightfield tiles (2x5) of the main terrain geomoetry so that cannon will manage it faster
                const matrix: number[][] = []
                for (let x = -1; x <= 1; x++) {
                    matrix.push([])
                    for (let z = -5 - offsetZ; z <= 5 - offsetZ; z++) {
                        raycaster.set(new Vector3(x * elementSize, 100, -z * elementSize), down)
                        const intersects = raycaster.intersectObject(this.mesh, false)
                        matrix[x + 1][z + 5 + offsetZ] = intersects.length
                            ? intersects[0].point.y
                            : -100
                    }
                }
                const terrainShape = new Heightfield(matrix, { elementSize: elementSize })
                const terrainBody = new Body({ mass: 0 })
                terrainBody.addShape(terrainShape)
                terrainBody.quaternion.setFromAxisAngle(new Vec3(1, 0, 0), -Math.PI / 2)
                terrainBody.position.x = -1 * elementSize
                //terrainBody.position.y = 0.1
                terrainBody.position.z = 5 * elementSize + offsetZ * elementSize
                world.addBody(terrainBody)
            }

            scene.add(this.mesh)

            completeCB()
        })
    }
}
