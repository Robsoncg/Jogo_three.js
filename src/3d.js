import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

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

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 5, 8);
camera.lookAt(0, 0, 0);

// Luzes
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Chão
/*const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x555555 }),
  );

floor.rotation.x = -Math.PI / 2;
scene.add(floor);*/

// Jogador
let player;

// Alvo
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0000 }),
);

scene.add(cube);
cube.position.set(2, 0.25, 2);

let target = new THREE.Vector3(
  (Math.random() - 0.5) * 18,
  0.25,
  (Math.random() - 0.5) * 18,
);

function novoDestino() {
  target.set((Math.random() - 0.5) * 18, 0.25, (Math.random() - 0.5) * 18);
}

// Pontuação
let score = 0;
const gameTime = 60; // segundos
const clock = new THREE.Clock();
let gameOver = false;

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

// Controles
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Carrega OBJ
const loader = new OBJLoader();

loader.load("/three/BASEmodel.obj", (object) => {
  object.scale.set(0.5, 0.5, 0.5);

  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());

  object.position.sub(center);

  object.position.y = 0;

  player = object;

  scene.add(player);
});

function randomCube() {
  cube.position.x = (Math.random() - 0.5) * 16;
  cube.position.z = (Math.random() - 0.5) * 16;
}

function animate() {
  if (gameOver) return;

  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const remaining = Math.max(0, Math.ceil(gameTime - elapsed));

  timerText.innerHTML = "Tempo: " + remaining;

  if (remaining <= 0 && !gameOver) {
    gameOver = true;
    alert("Fim de jogo!\n\nPontuação: " + score);
    location.reload();
    return;
  }

  if (player && !gameOver) {
    if (keys["w"] || keys["arrowup"]) player.position.z -= 0.08;
    if (keys["s"] || keys["arrowdown"]) player.position.z += 0.08;
    if (keys["a"] || keys["arrowleft"]) player.position.x -= 0.08;
    if (keys["d"] || keys["arrowright"]) player.position.x += 0.08;
    player.rotation.y += 0.01;

    // Colisão
    const d = player.position.distanceTo(cube.position);

    if (d < 1) {
      score++;
      scoreText.innerHTML = "Pontos: " + score;
      randomCube();
      novoDestino();
    }
  }
  cube.position.lerp(target, 0.06); //velocidade do cubo

  if (cube.position.distanceTo(target) < 0.3) {
    novoDestino();
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
