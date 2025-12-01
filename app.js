import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

// === SCÈNE & RENDERER ===
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// === OUTLINE EFFECT ===
const effect = new OutlineEffect(renderer, {
  defaultThickness: 0.005,
  defaultColor: [0, 0, 0],
  defaultAlpha: 1,
  defaultKeepAlive: true
});

// === CAMÉRA ===
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

// === LUMIÈRES ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, -5, 5);
scene.add(light);
// === VARIABLES ===
let model;
let rotationSpeed = 0.015;
const baseRotationSpeed = 0.015;
let jumpVelocity = 0;
let isJumping = false;
let groundY = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === CHARGEMENT DU MODÈLE ===
new GLTFLoader().load(
  'dandatabeforbake.glb',
  (gltf) => {
    model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    groundY = model.position.y;

    model.traverse((child) => {
      if (child.isMesh) {
        child.material.userData.outlineParameters = {
          thickness: 0.01,
          color: new THREE.Color(0x7577BD).toArray(),
          alpha: 1,
          visible: true
        };
      }
    });

    scene.add(model);
  },
  undefined,
  (error) => console.error('Erreur chargement modèle :', error)
);

// === INTERACTION (clic pour saut) ===
window.addEventListener('click', (event) => {
  if (!model || isJumping) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (raycaster.intersectObject(model, true).length > 0) {
    isJumping = true;
    jumpVelocity = 0.09;
    rotationSpeed = 0.18;
  }
});

// === ANIMATION ===
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    model.rotation.y += rotationSpeed;

    if (isJumping) {
      model.position.y += jumpVelocity;
      jumpVelocity -= 0.003;


      if (jumpVelocity < 0) {
        const targetSpeed = baseRotationSpeed + 0.01;
        rotationSpeed += (targetSpeed - rotationSpeed) * 0.05;
      }

      
      if (model.position.y <= groundY) {
        model.position.y = groundY;
        if (Math.abs(jumpVelocity) > 0.01) {
          jumpVelocity = -jumpVelocity * 0.4; 
        } else {
          jumpVelocity = 0;
          isJumping = false;
          rotationSpeed = baseRotationSpeed;
        }
      }
    }
  }

  effect.render(scene, camera);
}

animate();

// === ADAPTATION FENÊTRE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
 