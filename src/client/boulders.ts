import { Mesh, SphereGeometry, Vector3, MeshStandardMaterial } from 'three'
import { Body, Sphere } from 'cannon-es'
import Game from './game'

export default class Boulders {
    shape: Sphere
    mesh: Mesh[]
    body: Body[]
    count: number

    constructor(game: Game, count: number, completeCB: () => void) {
        this.shape = new Sphere(1.0)
        this.count = count
        this.mesh = Array<Mesh>(this.count)
        this.body = Array<Body>(this.count)
        for (let i = 0; i < this.count; i++) {
            this.mesh[i] = new Mesh(new SphereGeometry(), new MeshStandardMaterial())
            ;(this.mesh[i].material as THREE.MeshStandardMaterial).map = game.textureLoader.load('./img/river_small_rocks_diff_1k.jpg')
            ;(this.mesh[i].material as THREE.MeshStandardMaterial).normalMap = game.textureLoader.load('./img/river_small_rocks_nor_dx_1k.jpg')

            game.scene.add(this.mesh[i])
            this.body[i] = new Body({ mass: 1 })
            this.body[i].angularFactor.set(1, 1, 0)
            this.body[i].addShape(this.shape)
            this.body[i].sleep()
            game.world.addBody(this.body[i])
        }
        completeCB()
    }

    configure(game: Game) {
        const down = new Vector3(0, -1, 0)
        for (let i = 0; i < this.count; i++) {
            this.mesh[i].position.set(0, 1000, (Number(game.nextRandom(1)) - 0.5) * 1200)
            game.raycaster.set(this.mesh[i].position, down)
            const intersects = game.raycaster.intersectObject(game.terrain.mesh, false)
            intersects.length ? (this.mesh[i].position.y = intersects[0].point.y + i) : (this.mesh[i].position.y = i)
            //this.mesh[i].castShadow = true

            this.body[i].sleep()
            this.body[i].angularVelocity.set(0, 0, 0)
            this.body[i].velocity.set(0, 0, 0)
            this.body[i].position.x = this.mesh[i].position.x
            this.body[i].position.y = this.mesh[i].position.y
            this.body[i].position.z = this.mesh[i].position.z
            this.body[i].wakeUp()
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
