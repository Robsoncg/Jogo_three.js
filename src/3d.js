import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();
textureLoader.load("/three/tabuleiro.jpeg", (texture) => {
  scene.background = texture;
});

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(0, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
light.castShadow = true;
scene.add(light);

let player;

const mtlLoader = new MTLLoader();

mtlLoader.load("/models/f15c/F-15C_Eagle.mtl", (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load("/models/f15c/F-15C_Eagle.obj", (object) => {
    object.scale.set(0.2, 0.2, 0.2);

    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());

    object.position.sub(center);
    object.position.y = 0;

    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    player = object;
    scene.add(player);
  });
});

const circulo = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);
scene.add(circulo);

circulo.position.set(2, 0.25, 2);

// destino aleatório
const target = new THREE.Vector3();

function novoDestino() {
  target.set((Math.random() - 0.5) * 18, 0.25, (Math.random() - 0.5) * 18);
}

novoDestino();

const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

let score = 0;
let gameOver = false;
const gameTime = 60;
const clock = new THREE.Clock();

const scoreText = document.createElement("div");
scoreText.style.position = "absolute";
scoreText.style.top = "10px";
scoreText.style.left = "10px";
scoreText.style.color = "white";
scoreText.style.fontSize = "30px";
scoreText.innerHTML = "Pontos: 0";
document.body.appendChild(scoreText);

const timerText = document.createElement("div");
timerText.style.position = "absolute";
timerText.style.top = "50px";
timerText.style.left = "10px";
timerText.style.color = "white";
timerText.style.fontSize = "30px";
timerText.innerHTML = "Tempo: 60";
document.body.appendChild(timerText);

function animate() {
  if (gameOver) return;

  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const remaining = Math.max(0, Math.ceil(gameTime - elapsed));

  timerText.innerHTML = "Tempo: " + remaining;

  if (remaining <= 0) {
    gameOver = true;
    alert("Fim de jogo!\nPontuação: " + score);
    location.reload();
    return;
  }

  if (player) {
    const speed = 0.2;
    if (keys["KeyW"] || keys["ArrowUp"]) player.position.z -= speed;
    if (keys["KeyS"] || keys["ArrowDown"]) player.position.z += speed;
    if (keys["KeyA"] || keys["ArrowLeft"]) player.position.x -= speed;
    if (keys["KeyD"] || keys["ArrowRight"]) player.position.x += speed;

    player.rotation.y += 0.01;

    const d = player.position.distanceTo(circulo.position);

    if (d < 1) {
      {
        score++;
        scoreText.innerHTML = "Pontos: " + score;
        novoDestino();
      }
    }
    if (score === 0) {
      if (circulo.position.distanceTo(target) < 0.01) {
        novoDestino();
      }
    }

    if (score === 1) {
      if (circulo.position.distanceTo(target) < 0.02) {
        novoDestino();
      }
    }
    if (score === 2) {
      if (circulo.position.distanceTo(target) < 0.03) {
        novoDestino();
      }
    }
    if (score === 3) {
      if (circulo.position.distanceTo(target) < 0.04) {
        novoDestino();
      }
    }
    if (score === 4) {
      if (circulo.position.distanceTo(target) < 0.05) {
        novoDestino();
      }
    }
    if (score === 5) {
      if (circulo.position.distanceTo(target) < 0.06) {
        novoDestino();
      }
    }
    if (score === 6) {
      if (circulo.position.distanceTo(target) < 0.07) {
        novoDestino();
      }
    }
    if (score === 7) {
      if (circulo.position.distanceTo(target) < 0.08) {
        novoDestino();
      }
    }
    if (score === 8) {
      if (circulo.position.distanceTo(target) < 0.09) {
        novoDestino();
      }
    }
    if (score === 9) {
      if (circulo.position.distanceTo(target) < 0.1) {
        novoDestino();
      }
    }
    if (score === 10) {
      if (circulo.position.distanceTo(target) < 0.2) {
        novoDestino();
      }
    }
    if (score >= 11) {
      if (circulo.position.distanceTo(target) < 0.3) {
        novoDestino();
      }
    }
    circulo.position.lerp(target, 0.1);
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
