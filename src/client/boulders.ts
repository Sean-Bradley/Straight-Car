import { Scene, Mesh, SphereGeometry, Vector3, MeshStandardMaterial, TextureLoader, Raycaster } from 'three'
import { World, Body, Sphere } from 'cannon-es'
import Terrain from './terrain'

export default class Boulders {
    shape: Sphere
    mesh: Mesh[]
    body: Body[]

    constructor(scene: Scene, world: World, terrain: Terrain, count: number, textureLoader: TextureLoader, raycaster: Raycaster, nextRandom: (_: number) => void) {
        this.shape = new Sphere(1.0)
        this.mesh = Array<Mesh>(count)
        this.body = Array<Body>(count)
        const down = new Vector3(0, -1, 0)
        for (let i = 0; i < count; i++) {
            this.mesh[i] = new Mesh(new SphereGeometry(), new MeshStandardMaterial())
            ;(this.mesh[i].material as THREE.MeshStandardMaterial).map = textureLoader.load('./img/river_small_rocks_diff_1k.jpg')
            ;(this.mesh[i].material as THREE.MeshStandardMaterial).normalMap = textureLoader.load('./img/river_small_rocks_nor_dx_1k.jpg')
            this.mesh[i].position.set(0, 0, (Number(nextRandom(1)) - 0.5) * 1200)
            raycaster.set(new Vector3(this.mesh[i].position.x, 100, this.mesh[i].position.z), down)
            const intersects = raycaster.intersectObject(terrain.mesh, false)
            intersects.length ? (this.mesh[i].position.y = intersects[0].point.y + 5 + i) : (this.mesh[i].position.y = 5 + i)
            //this.mesh[i].castShadow = true
            scene.add(this.mesh[i])
            this.body[i] = new Body({ mass: 1 })
            this.body[i].angularFactor.set(1, 1, 0)
            this.body[i].addShape(this.shape)
            this.body[i].position.x = this.mesh[i].position.x
            this.body[i].position.y = this.mesh[i].position.y
            this.body[i].position.z = this.mesh[i].position.z
            world.addBody(this.body[i])
        }
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
