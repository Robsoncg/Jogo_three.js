import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

const container = document.querySelector(".container3d");
if (!container) {
  throw new Error("Container .container3d nao encontrado");
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 12, 45);

const skyFaces = [
  "/img/sky.png",
  "/img/sky.png",
  "/img/sky.png",
  "/img/sky.png",
  "/img/sky.png",
  "/img/sky.png",
];
scene.background = new THREE.CubeTextureLoader().load(skyFaces);

const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(10, 30, 20);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x2b2b2b }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -6;
ground.receiveShadow = true;
scene.add(ground);

let modelo = null;

const centerAndScale = (object) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = 20 / maxDim;

  object.scale.setScalar(scale);
  object.position.sub(center);
  object.position.y -= 6;
};

const addModel = (object) => {
  modelo = object;
  centerAndScale(modelo);
  modelo.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });
  scene.add(modelo);
};

const loadObjFallback = () => {
  const objLoader = new OBJLoader();
  objLoader.load(
    "/models/f15c/f15c.obj",
    (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x7bd3ff,
            metalness: 0.2,
            roughness: 0.6,
          });
        }
      });
      addModel(object);
    },
    undefined,
    (error) => {
      console.error("Erro ao carregar OBJ:", error);
    },
  );
};

const mtlLoader = new MTLLoader();
mtlLoader.load(
  "/models/f15c/f15c.mtl",
  (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(
      "/models/f15c/f15c.obj",
      (object) => {
        addModel(object);
      },
      undefined,
      (error) => {
        console.error("Erro ao carregar OBJ com MTL:", error);
        loadObjFallback();
      },
    );
  },
  undefined,
  (error) => {
    console.error("Erro ao carregar MTL:", error);
    loadObjFallback();
  },
);

const keys = new Set();
const onKeyDown = (event) => keys.add(event.code);
const onKeyUp = (event) => keys.delete(event.code);
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

let isDragging = false;
let lastX = 0;
let lastY = 0;
renderer.domElement.addEventListener("pointerdown", (event) => {
  isDragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
});
renderer.domElement.addEventListener("pointerup", () => {
  isDragging = false;
});
renderer.domElement.addEventListener("pointerleave", () => {
  isDragging = false;
});
renderer.domElement.addEventListener("pointermove", (event) => {
  if (!isDragging || !modelo) return;
  const deltaX = event.clientX - lastX;
  const deltaY = event.clientY - lastY;
  modelo.rotation.y += deltaX * 0.005;
  modelo.rotation.x += deltaY * 0.005;
  lastX = event.clientX;
  lastY = event.clientY;
});

renderer.domElement.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const nextZ = camera.position.z + event.deltaY * 0.02;
    camera.position.z = THREE.MathUtils.clamp(nextZ, 20, 90);
  },
  { passive: false },
);

const clock = new THREE.Clock();
const animate = () => {
  const delta = clock.getDelta();

  if (modelo) {
    const moveSpeed = 18 * delta;
    const turnSpeed = 1.8 * delta;

    if (keys.has("KeyW")) modelo.position.z -= moveSpeed;
    if (keys.has("KeyS")) modelo.position.z += moveSpeed;
    if (keys.has("KeyA")) modelo.position.x -= moveSpeed;
    if (keys.has("KeyD")) modelo.position.x += moveSpeed;

    if (keys.has("ArrowLeft")) modelo.rotation.y += turnSpeed;
    if (keys.has("ArrowRight")) modelo.rotation.y -= turnSpeed;
    if (keys.has("ArrowUp")) modelo.rotation.x += turnSpeed;
    if (keys.has("ArrowDown")) modelo.rotation.x -= turnSpeed;
  }

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

const onResize = () => {
  const { width, height } = container.getBoundingClientRect();
  const nextWidth = Math.max(1, width);
  const nextHeight = Math.max(1, height);
  camera.aspect = nextWidth / nextHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(nextWidth, nextHeight, false);
};
window.addEventListener("resize", onResize);
onResize();
animate();
