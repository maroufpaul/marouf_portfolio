/*******************************************************
 * 3d-animation.js
 *
 * A more exciting, interactive 3D scene that includes:
 *   - A fractal sphere (custom shader) with dynamic distortion
 *   - Neural network of glowing nodes & pulsating lines
 *   - Advanced mouse interactivity (color shift, sphere displacement)
 *   - Smooth camera controls via OrbitControls
 *   - Simplex noise for subtle line pulses & fractal changes
 *
 * Setup:
 *   1) <script type="module" src="./3d-animation.js">
 *   2) A local patched OrbitControls in ./libs/OrbitControls.js
 *   3) <div id="hero-3d-bg"></div> in your hero section
 ******************************************************/

import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { createNoise3D } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

// We'll create a 3D noise function for CPU side effects:
const noise3D = createNoise3D(Math.random);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 1) GLOBALS & CONFIG
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let scene, camera, renderer, controls;
let fractalSphere, fractalMaterial; 
let neuralNetGroup, lineGroup;
let nodeMeshes = [], nodePositions = [];
let raycaster, mouse;

let time = 0; // global animation time

// Scene
const BG_COLOR = 0x000000; // black background
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;

// Fractal Sphere Config
const SPHERE_RADIUS = 10;
const SPHERE_DETAIL = 128;
const BASE_DISPLACEMENT = 1.2;  // base push along normals
const NOISE_SCALE = 0.4;        // fractal noise scale
const COLOR_SHIFT_SPEED = 0.5;  // how quickly color changes on mouse movement

// Mouse Interactivity
let mouseX = 0, mouseY = 0; // track normalized mouse coords for color shift

// Neural Network
const NODE_COUNT = 40;
const NODE_SPREAD = 50;
const CONNECTION_DISTANCE = 12;
const NODE_BASE_COLOR = new THREE.Color(0xffffff);
const NODE_EMISSIVE = new THREE.Color(0x1abc9c); // teal
const LINE_COLOR = 0x00ffcc; 
const LINE_BASE_OPACITY = 0.4;

// Shaders for the fractal sphere
const fractalVertexShader = `
  uniform float uTime;
  uniform float uDisplacement;
  uniform float uNoiseScale;
  uniform float uMouseX;
  uniform float uMouseY;

  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vWave; // pass wave magnitude to fragment

  void main() {
    vNormal = normal;
    vPos = position;

    // We'll make the displacement vary with a sin wave 
    // plus some influence from mouse coords
    float offset = sin((position.x + position.y + position.z) * uNoiseScale 
                       + uTime) 
                   * (uDisplacement + uMouseX * 0.5 + uMouseY * 0.5);

    vWave = offset; 
    vec3 newPosition = position + normal * offset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fractalFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;

  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vWave;

  void main() {
    float intensity = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    intensity = clamp(intensity, 0.0, 1.0);

    // We shift color based on vWave 
    // so parts with bigger wave offset glow differently
    float waveFactor = 0.5 + 0.5 * sin(uTime + vWave * 2.0);

    // Combine intensity with waveFactor
    float glow = intensity * waveFactor;

    vec3 color = uBaseColor * glow;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 2) INIT FUNCTION
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

export function init() {
  // 1) Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);

  // 2) Camera
  camera = new THREE.PerspectiveCamera(
    CAMERA_FOV,
    getHeroAspect(),
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.set(0, 0, 30);

  // 3) Renderer
  const container = document.getElementById('hero-3d-bg');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // 4) OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  // 5) Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(30, 50, 40);
  scene.add(dirLight);

  // 6) Raycaster & Mouse
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 7) Create fractal sphere
  fractalSphere = createFractalSphere();
  scene.add(fractalSphere);

  // 8) Create neural network
  neuralNetGroup = new THREE.Group();
  lineGroup = new THREE.Group();
  scene.add(neuralNetGroup, lineGroup);

  createNeuralNetwork();

  // 9) Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);

  // Start animation
  animate();
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 3) HELPER FUNCTIONS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function getHeroAspect() {
  const hero = document.getElementById('hero');
  const w = hero.clientWidth || window.innerWidth;
  const h = hero.clientHeight || window.innerHeight;
  return w / h;
}

function onWindowResize() {
  const container = document.getElementById('hero-3d-bg');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// On mouse move, we'll also track normalized X/Y for fractal color shift
function onMouseMove(e) {
  const container = document.getElementById('hero-3d-bg');
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  mouse.x = (x / container.clientWidth) * 2 - 1;
  mouse.y = -(y / container.clientHeight) * 2 + 1;

  // Convert x,y to a 0..1 range for color shifting
  mouseX = x / container.clientWidth;  
  mouseY = y / container.clientHeight; 

  // Raycasting for node hover
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(neuralNetGroup.children, true);

  // Reset node scales
  nodeMeshes.forEach(node => {
    node.scale.setScalar(1.0);
    node.material.emissive.set(node.userData.emissiveBase);
  });

  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    if (hovered.userData.isNode) {
      hovered.scale.setScalar(1.5);
      hovered.material.emissive.set(0xffffff); // highlight hovered node
    }
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 4) FRACTAL SPHERE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createFractalSphere() {
  fractalMaterial = new THREE.ShaderMaterial({
    vertexShader: fractalVertexShader,
    fragmentShader: fractalFragmentShader,
    uniforms: {
      uTime:        { value: 0.0 },
      uDisplacement:{ value: BASE_DISPLACEMENT },
      uNoiseScale:  { value: NOISE_SCALE },
      uBaseColor:   { value: new THREE.Color(0x1abc9c) }, // base teal
      uMouseX:      { value: 0.0 },
      uMouseY:      { value: 0.0 }
    },
    side: THREE.DoubleSide,
    transparent: false
  });

  const geo = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_DETAIL, SPHERE_DETAIL);

  const mesh = new THREE.Mesh(geo, fractalMaterial);
  mesh.name = 'FractalSphere';
  return mesh;
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 5) NEURAL NETWORK
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createNeuralNetwork() {
  for (let i = 0; i < NODE_COUNT; i++) {
    const nodeGeom = new THREE.SphereGeometry(0.5, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: NODE_BASE_COLOR,
      emissive: NODE_EMISSIVE.clone(),
      metalness: 0.2,
      roughness: 0.3
    });
    const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);

    nodeMesh.userData.isNode = true;
    nodeMesh.userData.emissiveBase = NODE_EMISSIVE.clone();

    // random positions
    nodeMesh.position.set(
      THREE.MathUtils.randFloatSpread(NODE_SPREAD),
      THREE.MathUtils.randFloatSpread(NODE_SPREAD),
      THREE.MathUtils.randFloatSpread(NODE_SPREAD)
    );

    neuralNetGroup.add(nodeMesh);
    nodeMeshes.push(nodeMesh);
    nodePositions.push(nodeMesh.position);
  }

  lineGroup.name = 'NetworkLines';
  updateConnections();
}

function updateConnections() {
  while (lineGroup.children.length > 0) {
    lineGroup.remove(lineGroup.children[0]);
  }

  for (let i = 0; i < nodeMeshes.length; i++) {
    for (let j = i + 1; j < nodeMeshes.length; j++) {
      const dist = nodeMeshes[i].position.distanceTo(nodeMeshes[j].position);
      if (dist < CONNECTION_DISTANCE) {
        const points = [
          nodeMeshes[i].position.clone(),
          nodeMeshes[j].position.clone()
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: LINE_COLOR,
          transparent: true,
          opacity: LINE_BASE_OPACITY
        });
        const line = new THREE.Line(geo, mat);
        lineGroup.add(line);
      }
    }
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 6) ANIMATION LOOP
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function animate() {
  requestAnimationFrame(animate);

  time += 0.01;  // slower time step => calmer motion

  // Update fractal's uniforms
  fractalMaterial.uniforms.uTime.value = time * 2.0; 
  // We'll shift color based on mouseX, mouseY
  let newColor = new THREE.Color().setHSL(
    (mouseX * COLOR_SHIFT_SPEED + 0.4) % 1.0, 
    0.7, 
    0.5 + mouseY * 0.2 
  );
  fractalMaterial.uniforms.uBaseColor.value = newColor;

  // Animate lines with 3D noise
  lineGroup.children.forEach(line => {
    let mat = line.material;
    // Use line.id + time for unique offsets
    let nVal = noise3D(line.id * 0.1, time * 0.2, 0);
    let pulse = 0.3 + 0.3 * Math.sin(time * 3.0 + nVal * 5.0);
    mat.opacity = Math.min(1.0, Math.max(0.0, LINE_BASE_OPACITY + pulse));
  });

  controls.update();
  renderer.render(scene, camera);
}

/* Optionally, if you want CPU-based fractal updates, 
   you could add a function that loops over sphere geometry 
   each frame, reading noise3D(...) and pushing vertices. 
   But we do a GPU-based approach for now. */

// Immediately init
init();
