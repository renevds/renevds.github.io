import '../css/style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons'
import statue from '../models/statue.gltf'

// Constants
const STATUE_SCALE = 0.2
const ROTATION_SPEED = 0.001

// Scene setup
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

if (window.innerWidth > window.innerHeight) {
  camera.position.z = 13 
  camera.position.x = 0
} else {
  camera.position.z = 15
  camera.position.x = 5
}

// Variable to store the statue
let statueObject

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)
const loader = new GLTFLoader()
loader.load(statue, function(gltf) {
  statueObject = gltf.scene
  statueObject.scale.set(STATUE_SCALE, STATUE_SCALE, STATUE_SCALE)
  statueObject.position.y = -50
  scene.add(gltf.scene)

  statueObject.traverse(function(child) {
    if (child.isMesh) {
      child.material = new THREE.MeshBasicMaterial({ color: 0x595959, wireframe: true, wireframeLinewidth: 0.1 })
    }
  })
}, undefined, function(error) {
  console.error(error)
})

// Animation loop
function animate() {
  if (statueObject) {
    statueObject.rotation.y -= ROTATION_SPEED
  }
  renderer.render(scene, camera)
}

// Resize event handler that updates the camera aspect ratio
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

window.addEventListener('resize', onWindowResize)

// Start the animation loop
renderer.setAnimationLoop(animate)