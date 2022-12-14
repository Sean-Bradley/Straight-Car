import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import UI from './ui'
import { Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, TextureLoader, Texture } from 'three'

export default class Finish {
    texture: Texture = new Texture()
    constructor(scene: THREE.Scene, loader: GLTFLoader, textureLoader: TextureLoader) {
        loader.load('./models/finish.glb', (gltf) => {
            const mesh = gltf.scene as THREE.Group
            //mesh.traverse((m) => (m.castShadow = true))
            mesh.position.set(0, 0, -750)
            scene.add(mesh)

            const barrier = new Mesh(new PlaneGeometry(10, 1.5), new MeshBasicMaterial())
            this.texture = textureLoader.load('./img/finish.jpg', () => {
                // now texture is loaded, allow updating it on render
                this.update = (delta: number) => {
                    this.texture.offset.x += delta % 1
                    this.texture.needsUpdate = true
                }
            })
            this.texture.wrapS = RepeatWrapping
            barrier.material.map = this.texture
            barrier.material.transparent = true
            barrier.material.opacity = 0.5
            barrier.position.y = 1
            mesh.add(barrier)
        })
    }

    update(delta: number) {
        // do not edit this. The function body is created after texture is setup
    }
}
