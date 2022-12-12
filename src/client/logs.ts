import { Scene, Group, Vector3, TextureLoader, Raycaster } from 'three'
import { World, Body, Sphere, Cylinder, Vec3, Quaternion } from 'cannon-es'
import Terrain from './terrain'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Logs {
    shape: Sphere
    mesh: Group[]
    body: Body[]

    constructor(scene: Scene, world: World, terrain: Terrain, count: number, gltfLoader: GLTFLoader, textureLoader: TextureLoader, raycaster: Raycaster, nextRandom: (_: number) => void) {
        this.shape = new Sphere(1.0)
        this.mesh = Array<Group>(count)
        this.body = Array<Body>(count)
        const down = new Vector3(0, -1, 0)

        gltfLoader.load('./models/log.glb', (gltf) => {
            const logMesh = gltf.scene as THREE.Group
            //logMesh.traverse((m) => (m.castShadow = true))
            const material = (logMesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
            material.normalMap = textureLoader.load('./img/bark_willow_nor_dx_1k.jpg')
            for (let i = 0; i < count; i++) {
                this.mesh[i] = logMesh.clone()
                this.mesh[i].position.set(0, 0, (Number(nextRandom(1)) - 0.5) * 800)
                raycaster.set(new Vector3(this.mesh[i].position.x, 100, this.mesh[i].position.z), down)
                const intersects = raycaster.intersectObject(terrain.mesh, false)
                intersects.length ? (this.mesh[i].position.y = intersects[0].point.y + 5 + i) : (this.mesh[i].position.y = 5 + i)
                //this.mesh[i].castShadow = true
                scene.add(this.mesh[i])
                this.body[i] = new Body({ mass: 1 })
                this.body[i].angularFactor.set(0, 0, 1)
                const logShape = new Cylinder(0.25, 0.25, 8, 6)
                const q = new Quaternion()
                q.setFromAxisAngle(new Vec3(0, 0, 1), Math.PI / 2)
                this.body[i].addShape(logShape, new Vec3(), q)
                this.body[i].position.x = this.mesh[i].position.x
                this.body[i].position.y = this.mesh[i].position.y
                this.body[i].position.z = this.mesh[i].position.z
                this.body[i].allowSleep = true
                world.addBody(this.body[i])
            }
        })
    }

    update() {
        this.mesh.forEach((_, i) => {
            this.body[i].position.x = 0
            this.body[i].force.x = 0
            this.mesh[i].position.set(this.body[i].position.x, this.body[i].position.y, this.body[i].position.z)
            this.mesh[i].quaternion.set(this.body[i].quaternion.x, this.body[i].quaternion.y, this.body[i].quaternion.z, this.body[i].quaternion.w)
        })
    }
}
