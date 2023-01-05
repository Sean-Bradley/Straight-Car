import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'

import Game from './game'

const scene = new THREE.Scene()

new RGBELoader().load(
    './img/kloppenheim_06_puresky_1k.hdr',
    function (texture: THREE.Texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping
        scene.background = texture
        scene.environment = texture
    }
)

const cameraStartPosition = new THREE.Vector3(20, 25, 20)
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.copy(cameraStartPosition)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
//renderer.shadowMap.enabled = true
//renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(0, 18, 0)
controls.autoRotate = true
// controls.keys = {
//     LEFT: 'ArrowLeft', //left arrow
//     UP: 'ArrowUp', // up arrow
//     RIGHT: 'ArrowRight', // right arrow
//     BOTTOM: 'ArrowDown', // down arrow
// }
// controls.keyPanSpeed = 50
// controls.listenToKeyEvents(document.documentElement)

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const worldCenter = new THREE.Object3D()

const light = new THREE.DirectionalLight()
// light.castShadow = true
// light.shadow.mapSize.width = 512
// light.shadow.mapSize.height = 512
// light.shadow.camera.near = 35
// light.shadow.camera.far = 1400
// light.shadow.camera.left = -600
// light.shadow.camera.right = 600
// light.shadow.camera.top = 200
// light.shadow.camera.bottom = -220
light.position.set(500, 250, 500)
light.target = worldCenter
scene.add(light)

const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
const raycaster = new THREE.Raycaster()

const game = new Game(
    scene,
    world,
    camera,
    controls,
    gltfLoader,
    textureLoader,
    raycaster
)

renderer.compile(scene, camera)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new THREE.Clock()

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

function animate() {
    controls.enabled && controls.update()

    let delta = Math.min(clock.getDelta(), 0.1)
    world.step(delta)
    // cannonDebugRenderer.update()

    game.update(delta)

    render()

    stats.update()

    requestAnimationFrame(animate)
}

function render() {
    renderer.render(scene, camera)
    labelRenderer.render(scene, camera)
}

animate()
