// 3d-animation.js

import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import { SimplexNoise as Noise } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

/* 
   ^ This ensures that OrbitControls references the same 
   version of Three (r152) as your main import, 
   and we have a valid ES module for SimplexNoise.
*/

// ----- GLOBAL VARIABLES -----
let scene, camera, renderer, controls;
let fractalMesh;
let neuronGroup, lineGroup;
let raycaster, mouse;
let nodeSpheres = [];
let simplex; // noise generator


// Adjust these to taste
const NUM_NODES = 30;
const MAX_CONNECTION_DISTANCE = 15; // how close neurons must be to connect
const NODE_RADIUS = 0.3; // size of each neuron sphere

// For fractal sphere
const SPHERE_RADIUS = 10;
const DETAIL_LEVEL = 180; // number of segments
const NOISE_SCALE = 0.5;
const NOISE_SPEED = 0.0005; // how fast the noise evolves

// Time tracker for noise evolution
let timeOffset = 0;

function init() {
  // 1. Scene, Camera, Renderer
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 35);

  // The renderer will be appended to #three-bg
  const container = document.getElementById('three-bg');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // (Optional) OrbitControls for interactive rotation
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  // 2. Noise generator
  simplex = new SimplexNoise(Math.random);

  // 3. Create fractal-like sphere
  fractalMesh = createFractalSphere();
  scene.add(fractalMesh);

  // 4. Create neural network
  neuronGroup = new THREE.Group();
  lineGroup = new THREE.Group();
  scene.add(neuronGroup);
  scene.add(lineGroup);
  createNeuralNetwork();

  // 5. Raycaster setup for hover detection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 6. Window resize handling
  window.addEventListener('resize', onWindowResize, false);

  // 7. Mouse move for hover
  window.addEventListener('mousemove', onMouseMove, false);

  // Start animation
  animate();
}

// Create a sphere with noise-based displacement
function createFractalSphere() {
  const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, DETAIL_LEVEL, DETAIL_LEVEL);
  const material = new THREE.MeshPhongMaterial({
    color: 0x222222,
    emissive: 0x111111,
    shininess: 50,
    wireframe: false
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Add a soft light to highlight fractal
  const pointLight = new THREE.PointLight(0xffffff, 1.2);
  pointLight.position.set(25, 25, 50);
  scene.add(pointLight);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  return mesh;
}

// Distort sphere vertices with noise
function updateFractalSphere() {
  const position = fractalMesh.geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);

    // Convert each vertex's position to spherical coordinate
    // Then displace them based on noise
    const noiseVal = simplex.noise4D(
      x * NOISE_SCALE,
      y * NOISE_SCALE,
      z * NOISE_SCALE,
      timeOffset
    );

    // Original sphere radius is about SPHERE_RADIUS
    // We'll add some displacement
    const displacement = 1 + noiseVal * 1.2; // amplitude of displacement
    const len = Math.sqrt(x * x + y * y + z * z);

    // Move vertex outward
    const newX = (x / len) * (SPHERE_RADIUS * displacement);
    const newY = (y / len) * (SPHERE_RADIUS * displacement);
    const newZ = (z / len) * (SPHERE_RADIUS * displacement);

    position.setXYZ(i, newX, newY, newZ);
  }
  position.needsUpdate = true;
  fractalMesh.geometry.computeVertexNormals();
}

// Create neural network group with randomly placed nodes
function createNeuralNetwork() {
  // Generate nodes (spheres)
  for (let i = 0; i < NUM_NODES; i++) {
    const geometry = new THREE.SphereGeometry(NODE_RADIUS, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1abc9c,
      emissive: 0x006064, // subdued teal
      metalness: 0.3,
      roughness: 0.5
    });
    const sphere = new THREE.Mesh(geometry, material);

    // Random position (slightly inside the camera area, e.g. -20..20)
    sphere.position.set(
      THREE.MathUtils.randFloatSpread(40),
      THREE.MathUtils.randFloatSpread(40),
      THREE.MathUtils.randFloatSpread(40)
    );
    sphere.userData.originalScale = 1;

    neuronGroup.add(sphere);
    nodeSpheres.push(sphere);
  }
  // Create lines
  updateConnections();
}

// Connect nearby nodes with lines
function updateConnections() {
  // Clear old lines
  while (lineGroup.children.length) {
    lineGroup.remove(lineGroup.children[0]);
  }
  // For each pair, if distance < threshold, connect
  for (let i = 0; i < nodeSpheres.length; i++) {
    for (let j = i + 1; j < nodeSpheres.length; j++) {
      const dist = nodeSpheres[i].position.distanceTo(nodeSpheres[j].position);
      if (dist < MAX_CONNECTION_DISTANCE) {
        const material = new THREE.LineBasicMaterial({
          color: 0x17b890,
          transparent: true,
          opacity: 0.6
        });
        const points = [
          nodeSpheres[i].position.clone(),
          nodeSpheres[j].position.clone()
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        lineGroup.add(line);
      }
    }
  }
}

// Animate the fractal sphere & nodes
function animate() {
  requestAnimationFrame(animate);

  // Optionally rotate fractal sphere
  fractalMesh.rotation.y += 0.001;

  // Update fractal with noise
  timeOffset += NOISE_SPEED;
  updateFractalSphere();

  // Pulse lines (e.g., slight opacity modulations)
  lineGroup.children.forEach(line => {
    const material = line.material;
    // Simple pulse between 0.4 and 0.8
    material.opacity = 0.4 + 0.4 * Math.sin(performance.now() * 0.001);
  });

  // OrbitControls update
  controls.update();

  // Render
  renderer.render(scene, camera);
}

// Raycasting for hover detection
function onMouseMove(event) {
  // Convert mouse position to normalized device coords
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  // Check intersection with nodes
  const intersects = raycaster.intersectObjects(neuronGroup.children);

  // Reset all node scales
  nodeSpheres.forEach(node => {
    node.scale.setScalar(node.userData.originalScale);
  });

  // If we have an intersection, enlarge the node slightly
  if (intersects.length > 0) {
    const hovered = intersects[0].object;
    hovered.scale.setScalar(1.5);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the scene
init();
