import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.017;
parameters.radius = 5;
parameters.length = 5;
parameters.strings = 3;
parameters.curl = 1;
parameters.randomness = 0.2;
parameters.randomnessPower = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";
parameters.func1;
parameters.func2;

let geometry = null;
let material = null;
let points = null;
let positions = null;
let positions2 = null;
let defaultPositions = null;

const generateGalaxy = () => {
  // Destroy old galaxy
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  /**
   * Geometry
   */
  geometry = new THREE.BufferGeometry();

  defaultPositions = function defaultPositions() {
    positions = new Float32Array(parameters.count * 3);

    for (let i = 0; i < parameters.count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
  };

  defaultPositions();

  positions2 = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const curlAngle = radius * parameters.curl;
    const stringAngle =
      ((i % parameters.strings) / parameters.strings) * Math.PI * 2;

    positions2[i3] = parameters.length * radius;
    positions2[i3 + 1] = Math.sin(stringAngle + curlAngle) * radius;
    positions2[i3 + 2] = 0;
  }

  const colors = new Float32Array(parameters.count * 3);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count * 3; i++) {
    const i3 = i * 3;

    const radius = Math.random() * parameters.radius;
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: true,
    blending: THREE.CustomBlending,
    vertexColors: true,
  });

  /**
   * Points
   */
  points = new THREE.Points(geometry, material);
  points.position.x = 15;
  scene.add(points);
};
generateGalaxy();

parameters.func1 = function chGeometry1() {
  if (points) {
    gsap.to(points.position, {
      x: 0,
      duration: 3,
      ease: "power3",
    });
    gsap.to(points.geometry.attributes.position.array, {
      endArray: positions2,
      duration: 3,
      ease: "power3",
      // Make sure to tell it to update if not using the tick function
      onUpdate: () => {
        points.geometry.attributes.position.needsUpdate = true;
        // controls.update() -- only works while it's updating
        //camera.lookAt(points.position);
        renderer.render(scene, camera);
      },
    });
  }
};

parameters.func2 = function chGeometry2() {
  defaultPositions();
  if (points) {
    gsap.to(points.position, {
      x: 15,
      duration: 4,
      ease: "power1",
    });
    gsap.to(points.geometry.attributes.position.array, {
      endArray: positions,
      duration: 4,
      ease: "power1",
      // Make sure to tell it to update if not using the tick function
      onUpdate: () => {
        points.geometry.attributes.position.needsUpdate = true;
        // controls.update() -- only works while it's updating
        //camera.lookAt(points.position);
        renderer.render(scene, camera);
      },
    });
  }
};

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "length")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "strings")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "curl")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomnessPower")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);
gui.add(parameters, "func1");
gui.add(parameters, "func2");

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(14.4996885384049, 2.3786581046481694, 10.974029820250149);
camera.lookAt(14.5, 0, 0);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  //controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
