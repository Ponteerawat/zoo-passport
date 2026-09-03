/* ==================================================================
   🐘 เกมป้อนอาหารช้าง 3D — Realistic Model & Pokémon GO UI
   ================================================================== */

const CONFIG = {
  WIN_SCORE: 20,
  SWIPE_THRESHOLD: 50,
  SPAWN_DELAY: 350,
  FOOD_ITEMS: [
    { emoji: '🍉', name: 'แตงโมฉ่ำๆ' },
    { emoji: '🍌', name: 'กล้วยหอม' },
    { emoji: '🍎', name: 'แอปเปิ้ลสด' },
    { emoji: '🎋', name: 'อ้อยหวาน' },
  ],
  NONFOOD_ITEMS: [
    { emoji: '👞', name: 'รองเท้าเก่า' },
    { emoji: '🍾', name: 'ขวดพลาสติก' },
    { emoji: '🪨', name: 'ก้อนหิน' },
    { emoji: '🗑️', name: 'ถังขยะ' },
  ],
  FOOD_CHANCE: 0.5,
};

// -------------------- State --------------------
let score = 0;
let gameActive = false;
let isAnimating = false;
let startTime = 0;
let timerInterval = null;

// -------------------- DOM References --------------------
const $ = (id) => document.getElementById(id);
const cameraFeed = $('camera-feed');
const cameraBtn = $('camera-btn');
const scoreValEl = $('score-val');
const timerValEl = $('timer-val');
const itemLabelEl = $('item-label');
const targetRing = $('target-ring');
const itemsLayer = $('items-layer');
const feedbackLayer = $('feedback-layer');
const tutorialOverlay = $('tutorial-overlay');
const winOverlay = $('win-overlay');
const startBtn = $('start-btn');
const replayBtn = $('replay-btn');
const passportBtn = $('passport-btn');
const finalScoreValEl = $('final-score-val');
const toastEl = $('toast');

function setAppHeight() {
  document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
}
window.addEventListener('resize', setAppHeight);
setAppHeight();

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

/* ==================================================================
   🎨 Three.js — โหลดโมเดลช้างสมจริง (FBX) หรือสร้างช้างสมจริง 3D
   ================================================================== */
let scene, camera, renderer;
let elephantGroup, headGroup, trunkGroup, leftEar, rightEar;
let clock = new THREE.Clock();
let elephantAnimState = 'idle';
let animTimer = 0;

function init3D() {
  const container = $('webgl-container');
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0.2, 7.8);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xdde5ed, 0.85);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffb07c, 1.2);
  sunLight.position.set(6, 12, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x768ca3, 0.5);
  fillLight.position.set(-6, 5, -5);
  scene.add(fillLight);

  createEnvironment();
  loadElephantModel();

  window.addEventListener('resize', onWindowResize);
  animate3D();
}

function loadElephantModel() {
  const fbxLoader = new THREE.FBXLoader();
  fbxLoader.load(
    'model_elephant.fbx',
    (fbx) => {
      elephantGroup = fbx;

      const box = new THREE.Box3().setFromObject(fbx);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3.2 / maxDim;
      fbx.scale.set(scale, scale, scale);

      const center = new THREE.Vector3();
      box.getCenter(center);
      fbx.position.sub(center.multiplyScalar(scale));
      fbx.position.y = -0.8;
      fbx.rotation.y = Math.PI;

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (!child.material || child.material.name === 'Default') {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x60656c,
              roughness: 0.85,
              metalness: 0.05
            });
          }
        }
      });

      scene.add(elephantGroup);
      console.log('✅ โหลด model_elephant.fbx สำเร็จ!');
    },
    undefined,
    (error) => {
      console.warn('⚠️ ไม่สามารถดึง model_elephant.fbx ได้ (กำลังสร้างโมเดลช้าง 3D สมจริงทดแทน):', error);
      createRealisticProceduralElephant();
    }
  );
}

function createRealisticProceduralElephant() {
  elephantGroup = new THREE.Group();
  elephantGroup.position.set(0, -0.7, 0);

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x5e636b,
    roughness: 0.88,
    metalness: 0.05
  });
  const innerEarMat = new THREE.MeshStandardMaterial({
    color: 0x8a7075,
    roughness: 0.9
  });
  const tuskMat = new THREE.MeshStandardMaterial({
    color: 0xf4f0e6,
    roughness: 0.3,
    metalness: 0.1
  });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0d1117 });

  const bodyGeo = new THREE.SphereGeometry(1.3, 32, 32);
  bodyGeo.scale(1, 0.92, 1.35);
  const bodyMesh = new THREE.Mesh(bodyGeo, skinMat);
  bodyMesh.position.set(0, 0.2, 0);
  bodyMesh.castShadow = true;
  elephantGroup.add(bodyMesh);

  const legGeo = new THREE.CylinderGeometry(0.32, 0.38, 1.2, 20);
  const legPositions = [
    [-0.65, -0.6, 0.75], [0.65, -0.6, 0.75],
    [-0.65, -0.6, -0.75], [0.65, -0.6, -0.75]
  ];
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    elephantGroup.add(leg);
  });

  headGroup = new THREE.Group();
  headGroup.position.set(0, 0.95, 0.9);

  const headGeo = new THREE.SphereGeometry(0.85, 32, 32);
  headGeo.scale(1, 1.05, 1.1);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  const earGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32);
  earGeo.scale(1.2, 1, 0.4);

  leftEar = new THREE.Group();
  const leftEarMesh = new THREE.Mesh(earGeo, skinMat);
  const leftEarInner = new THREE.Mesh(earGeo, innerEarMat);
  leftEarInner.scale.set(0.85, 0.85, 0.5);
  leftEarInner.position.z = 0.01;
  leftEar.add(leftEarMesh, leftEarInner);
  leftEar.position.set(-0.95, 0.15, -0.2);
  leftEar.rotation.set(0.1, 0.4, -0.15);

  rightEar = leftEar.clone();
  rightEar.position.set(0.95, 0.15, -0.2);
  rightEar.rotation.set(0.1, -0.4, 0.15);

  headGroup.add(leftEar, rightEar);

  const eyeGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.4, 0.18, 0.78);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.4, 0.18, 0.78);
  headGroup.add(leftEye, rightEye);

  const tuskCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.3, 0.3),
    new THREE.Vector3(0, -0.2, 0.65)
  ]);
  const tuskGeo = new THREE.TubeGeometry(tuskCurve, 20, 0.055, 12, false);

  const leftTusk = new THREE.Mesh(tuskGeo, tuskMat);
  leftTusk.position.set(-0.28, -0.25, 0.72);
  leftTusk.rotation.y = -0.15;

  const rightTusk = new THREE.Mesh(tuskGeo, tuskMat);
  rightTusk.position.set(0.28, -0.25, 0.72);
  rightTusk.rotation.y = 0.15;

  headGroup.add(leftTusk, rightTusk);

  trunkGroup = new THREE.Group();
  trunkGroup.position.set(0, -0.2, 0.85);

  const segCount = 7;
  let prevSeg = trunkGroup;
  for (let i = 0; i < segCount; i++) {
    const r = 0.15 * (1 - i * 0.09);
    const segGeo = new THREE.CylinderGeometry(r * 0.85, r, 0.2, 16);
    const seg = new THREE.Mesh(segGeo, skinMat);
    seg.position.set(0, -0.13, 0.05);
    seg.rotation.x = 0.22;
    prevSeg.add(seg);
    prevSeg = seg;
  }
  headGroup.add(trunkGroup);

  elephantGroup.add(headGroup);
  scene.add(elephantGroup);
}

function createEnvironment() {
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x3d4e38, roughness: 0.95 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.3;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadGeo = new THREE.PlaneGeometry(4.2, 40);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262b, roughness: 0.8 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, -1.29, 0);
  road.receiveShadow = true;
  scene.add(road);

  const lineGeo = new THREE.PlaneGeometry(0.15, 40);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffcb05 });
  const line = new THREE.Mesh(lineGeo, lineMat);
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, -1.28, 0);
  scene.add(line);
}

function animate3D() {
  requestAnimationFrame(animate3D);
  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  if (elephantGroup) {
    if (elephantAnimState === 'idle') {
      elephantGroup.position.y = -0.7 + Math.sin(time * 1.8) * 0.025;

      if (headGroup) {
        headGroup.rotation.x = Math.sin(time * 1.2) * 0.02;
        if (leftEar) leftEar.rotation.z = -0.15 + Math.sin(time * 2.2) * 0.05;
        if (rightEar) rightEar.rotation.z = 0.15 - Math.sin(time * 2.2) * 0.05;
        if (trunkGroup) trunkGroup.rotation.x = 0.2 + Math.sin(time * 2) * 0.12;
      }
    }
    else if (elephantAnimState === 'happy') {
      animTimer += dt * 6;
      elephantGroup.position.y = -0.7 + Math.abs(Math.sin(animTimer)) * 0.22;
      if (headGroup) {
        headGroup.rotation.x = -0.25;
        if (trunkGroup) trunkGroup.rotation.x = -0.75;
      }
      if (animTimer > Math.PI * 2) elephantAnimState = 'idle';
    }
    else if (elephantAnimState === 'sad') {
      animTimer += dt * 8;
      if (headGroup) {
        headGroup.rotation.y = Math.sin(animTimer) * 0.2;
        if (trunkGroup) trunkGroup.rotation.x = 0.45;
      }
      if (animTimer > Math.PI * 2) {
        if (headGroup) headGroup.rotation.y = 0;
        elephantAnimState = 'idle';
      }
    }
  }

  renderer.render(scene, camera);
}

function triggerElephantAnim(mood) {
  elephantAnimState = mood;
  animTimer = 0;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ==================================================================
   📷 ระบบกล้อง AR
   ================================================================== */
async function initCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast('เปิดใช้ฉาก 3D สะวันนายามเย็น 🌅');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    cameraFeed.srcObject = stream;
    cameraFeed.style.display = 'block';
    showToast('เปิดกล้อง AR สำเร็จ! 📷');
  } catch (err) {
    cameraFeed.style.display = 'none';
    showToast('สลับใช้ฉาก 3D จำลองแทนกล้อง 🌳');
  }
}

cameraBtn.addEventListener('click', initCamera);

/* ==================================================================
   🔊 เสียงสังเคราะห์เอฟเฟกต์ Web Audio API
   ================================================================== */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'good') {
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'bad') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } else if (type === 'win') {
    [523, 659, 784, 1046].forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
      o.start(ctx.currentTime + idx * 0.1);
      o.stop(ctx.currentTime + idx * 0.1 + 0.3);
    });
  }
}

/* ==================================================================
   🎮 การควบคุมการปัด / ลากไอเทม (Flick Physics)
   ================================================================== */
function pickRandomItem() {
  const isFood = Math.random() < CONFIG.FOOD_CHANCE;
  const pool = isFood ? CONFIG.FOOD_ITEMS : CONFIG.NONFOOD_ITEMS;
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { ...item, type: isFood ? 'food' : 'nonfood' };
}

function spawnItem() {
  if (!gameActive) return;

  const data = pickRandomItem();
  const el = document.createElement('div');
  el.className = 'item';
  el.textContent = data.emoji;
  el.dataset.type = data.type;

  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.88;
  el.style.left = startX + 'px';
  el.style.top = startY + 'px';
  el.style.transform = 'translate(-50%, -50%)';

  itemsLayer.appendChild(el);

  if (data.type === 'food') {
    targetRing.classList.remove('bad');
  } else {
    targetRing.classList.add('bad');
  }

  itemLabelEl.textContent = `${data.emoji} ${data.name}`;
  itemLabelEl.classList.add('show');

  attachFlickControls(el, startX, startY);
}

function attachFlickControls(item, anchorX, anchorY) {
  let startX = 0, startY = 0;
  let curDx = 0, curDy = 0;
  let dragging = false;

  function onPointerDown(e) {
    if (isAnimating) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    item.setPointerCapture(e.pointerId);
    item.style.transition = 'none';
  }

  function onPointerMove(e) {
    if (!dragging) return;
    curDx = e.clientX - startX;
    curDy = e.clientY - startY;
    item.style.transform = `translate(-50%, -50%) translate(${curDx}px, ${curDy}px) rotate(${curDx * 0.1}deg)`;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;

    const dist = Math.hypot(curDx, curDy);
    const isSwipeUp = (-curDy > CONFIG.SWIPE_THRESHOLD) && (-curDy > Math.abs(curDx));

    if (isSwipeUp) {
      throwToElephant(item, anchorX, anchorY);
    } else if (dist > CONFIG.SWIPE_THRESHOLD) {
      discardItem(item, curDx, curDy);
    } else {
      item.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      item.style.transform = 'translate(-50%, -50%)';
    }
  }

  item.addEventListener('pointerdown', onPointerDown);
  item.addEventListener('pointermove', onPointerMove);
  item.addEventListener('pointerup', onPointerUp);
  item.addEventListener('pointercancel', onPointerUp);
}

function throwToElephant(item, anchorX, anchorY) {
  isAnimating = true;
  const targetX = window.innerWidth / 2;
  const targetY = window.innerHeight * 0.48;

  const dx = targetX - anchorX;
  const dy = targetY - anchorY;

  item.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease';
  item.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.3) rotate(360deg)`;
  item.style.opacity = '0';

  const type = item.dataset.type;
  setTimeout(() => {
    if (type === 'food') {
      updateScore(+1);
      triggerElephantAnim('happy');
      showPopup('EXCELLENT! 🎉', 'excellent');
      playSound('good');
    } else {
      updateScore(-1);
      triggerElephantAnim('sad');
      showPopup('NOT FOOD! ❌', 'bad');
      playSound('bad');
    }
    item.remove();
    isAnimating = false;
    scheduleNext();
  }, 450);
}

function discardItem(item, dx, dy) {
  isAnimating = true;
  const len = Math.hypot(dx, dy) || 1;
  const throwX = (dx / len) * 600;
  const throwY = (dy / len) * 600;

  item.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
  item.style.transform = `translate(-50%, -50%) translate(${throwX}px, ${throwY}px) rotate(540deg)`;
  item.style.opacity = '0';

  const type = item.dataset.type;
  setTimeout(() => {
    if (type === 'nonfood') {
      updateScore(+1);
      showPopup('DISCARDED! 👍', 'excellent');
      playSound('good');
    } else {
      updateScore(-1);
      showPopup('MISSED! 😢', 'bad');
      playSound('bad');
    }
    item.remove();
    isAnimating = false;
    scheduleNext();
  }, 400);
}

function scheduleNext() {
  itemLabelEl.classList.remove('show');
  if (gameActive) setTimeout(spawnItem, CONFIG.SPAWN_DELAY);
}

function updateScore(delta) {
  score = Math.max(0, score + delta);
  scoreValEl.textContent = score;

  if (navigator.vibrate) {
    try { navigator.vibrate(delta > 0 ? 40 : [30, 50, 30]); } catch(e){}
  }

  if (score >= CONFIG.WIN_SCORE) {
    triggerWin();
  }
}

function showPopup(text, type) {
  const pop = document.createElement('div');
  pop.className = `poke-popup ${type}`;
  pop.textContent = text;
  feedbackLayer.appendChild(pop);
  setTimeout(() => pop.remove(), 950);
}

/* ==================================================================
   ⏱ เวลา & การบันทึกสถิติ
   ================================================================== */
function startTimer() {
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    timerValEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

function getBestTime() {
  try {
    const b = localStorage.getItem('elephant_game_best_time');
    return b ? parseInt(b, 10) : null;
  } catch (e) { return null; }
}

function saveBestTime(t) {
  try { localStorage.setItem('elephant_game_best_time', String(t)); } catch (e) {}
}

function updateBestTimeDisplay(finalSec) {
  const best = getBestTime();
  let statsText = `เวลาที่ใช้: ${finalSec} วินาที`;

  if (best === null || finalSec < best) {
    saveBestTime(finalSec);
    statsText += ' — สถิติใหม่! 🏆';
  } else {
    statsText += ` (สถิติที่ดีที่สุด: ${best} วินาที)`;
  }
  $('win-stats').textContent = statsText;
}

/* ==================================================================
   ▶️ เริ่มเกม / ชนะเกม / เล่นใหม่ — ★ ส่วนที่เพิ่มเข้ามาใหม่ ★
   ================================================================== */
function startGame() {
  score = 0;
  gameActive = true;
  scoreValEl.textContent = score;

  tutorialOverlay.classList.add('hidden');
  winOverlay.classList.add('hidden');

  if (!renderer) {
    init3D();
  }

  startTimer();
  spawnItem();
}

function triggerWin() {
  gameActive = false;
  clearInterval(timerInterval);

  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  finalScoreValEl.textContent = score;
  updateBestTimeDisplay(elapsedSec);

  winOverlay.classList.remove('hidden');
  playSound('win');
}

function resetGame() {
  startGame();
}

/* ==================================================================
   🎁 กลับไปหน้าพาสปอร์ต — pattern เดียวกันทุกเกม
   ================================================================== */
function goToPassport() {
  const base = window.ZOO_APP_BASE_URL || window.location.origin;
  const url = `${base}/app/web/06-stamp-received/index.html?zone=elephant&points=${encodeURIComponent(score)}`;
  window.location.href = url;
}

/* ==================================================================
   🔘 ผูกปุ่มทั้งหมดเข้ากับฟังก์ชัน
   ================================================================== */
if (startBtn) {
  startBtn.addEventListener('click', startGame);
}

if (replayBtn) {
  replayBtn.addEventListener('click', resetGame);
}

if (passportBtn) {
  passportBtn.addEventListener('click', goToPassport);
}