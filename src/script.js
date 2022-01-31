import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'

/**
 * Loaders
 */

const loadingBarElement = document.querySelector('.loading-bar')
const hideElement = document.querySelector('.hide-element')
const hideElement2 = document.querySelector('.hide-element2')

console.log(hideElement);

const loadingManager = new THREE.LoadingManager(
 
    // Loaded
    () =>{
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3, value:0})
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
            hideElement.style.opacity = '1'
            hideElement2.style.opacity = '1'
        }, 500)
    },
 
     // Progress
    (itemURL, itemLoaded, itemsTotal) =>{
        const progressRatio =  itemLoaded / itemsTotal
        loadingBarElement.style.transform = 'scale(' +progressRatio + ')'
    },
)

/**
 * Base
 */
// Debug
// const gui = new dat.GUI({
//     width: 400
// })

var conf = {
    color: "#121212"
}

var cameraCenter = new THREE.Vector3();
var mouse = new THREE.Vector2();
var cameraLimit = .1;

// gui.addColor(conf, 'color').onChange(function(colorValue){
//     scene.background.set(colorValue)
// })

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
 const overlayGeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
 const overlayMaterial = new THREE.ShaderMaterial({
     transparent: true,
     uniforms:
     {
         uAlpha: {value: 1}
     },
     vertexShader: 'void main(){ gl_Position = vec4(position, 1.0);}',
     fragmentShader: 'uniform float uAlpha; void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);}'
 })
 const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
 
 scene.add(overlay)

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Texture
 */

const bakedTexture = textureLoader.load('desk-baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

const groundBakedTexture = textureLoader.load('ground-baked.jpg')
groundBakedTexture.flipY = false
groundBakedTexture.encoding = THREE.sRGBEncoding

/**
 * Model
 */

const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

const bakedgroundMaterial = new THREE.MeshBasicMaterial({ map: groundBakedTexture })

gltfLoader.load('desk.glb', (gltf) => {
    gltf.scene.traverse((child) =>
    {
        child.material = bakedMaterial
    })
    scene.add(gltf.scene)
})

gltfLoader.load('desk-ground.glb', (gltf) => {
    gltf.scene.traverse((child) =>
    {
        child.material = bakedgroundMaterial
    })
    scene.add(gltf.scene)
})

/**
 * Screen
 */



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

document.addEventListener('mousemove', onDocumentMouseMove, false);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    
    if (camera.aspect < 1.4 ) {
        if (camera.aspect < 1.2){
            if(camera.aspect < 0.7){
                camera.fov = 90
            }else{camera.fov = 60}
        }else{camera.fov = 50}
    } else {
        camera.fov = 45
    }

    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)

if (camera.aspect < 1.4 ) {
    if (camera.aspect < 1.2){
        if(camera.aspect < 0.7){
            camera.fov = 90
        }else{camera.fov = 60}
    }else{camera.fov = 50}
} else {
    camera.fov = 45
}
camera.updateProjectionMatrix()

camera.position.x = 4
camera.position.y = 2
camera.position.z = 3
camera.lookAt(0,-0.2,0)
scene.add(camera)

cameraCenter.x = camera.position.x
cameraCenter.y = camera.position.y
cameraCenter.z = camera.position.z

function updateCamera() {
    //offset the camera x/y based on the mouse's position in the window
    camera.position.y = cameraCenter.y + (cameraLimit * mouse.y);
    camera.position.x = cameraCenter.x + (cameraLimit * mouse.x);

    // if(mouse.x <= 0){
    //     camera.position.x = cameraCenter.x + (cameraLimit * mouse.x);
    // }else{
    //     camera.position.z = cameraCenter.z - (cameraLimit * mouse.x);
    // }

    
    camera.lookAt(0,-0.2,0)
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Controls
//const controls = new OrbitControls(camera, canvas)
//controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

scene.background = new THREE.Color(0x121212)

renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    updateCamera()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()