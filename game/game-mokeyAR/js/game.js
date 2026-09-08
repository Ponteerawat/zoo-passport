const TARGET_SCORE = 100;
const INITIAL_TIME = 60;

let score = 0;
let timeLeft = INITIAL_TIME;
let speedMultiplier = 1.0;
let isGameOver = false;
let gameStarted = false;
let controlMode = 'camera'; // 'camera' หรือ 'touch'

let targetX = 0;
let spawnInterval = null;
let timerInterval = null;

let faceMesh = null;
let cameraUtilsInstance = null;

// ตั้งค่าระบบเสียง Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'banana') {
    // เสียงเก็บกล้วย: เสียงใส โน้ตสูงขึ้น
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'poison') {
    // เสียงโดนพิษ: เสียงทุ้มต่ำ
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.15);
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('game-container');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const blinkStatusEl = document.getElementById('blink-status');
const overlayEl = document.getElementById('overlay');
const btnRestart = document.getElementById('btn-restart');
const btnViewCollection = document.getElementById('btn-view-collection');
const webcamElement = document.getElementById('webcam-preview');
const modeSelectScreen = document.getElementById('mode-select-screen');

const player = {
  x: 0,
  y: 0,
  width: 70,
  height: 60,
  emoji: '🐒'
};

const items = [];
const floatingTexts = []; // อาเรย์เก็บข้อมูลตัวเลขคะแนนที่ลอยขึ้นมา
const ITEM_TYPES = {
  BANANA: { type: 'normal', score: 10 },
  POISON: { type: 'poison', score: -5 }
};

// ฟังก์ชันเพิ่มตัวเลขลอยเมื่อเก็บไอเทม
function addFloatingText(text, x, y, isPositive) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    alpha: 1.0, 
    color: isPositive ? '#facc15' : '#ef4444', // สีเหลืองสำหรับบวก, สีแดงสำหรับลบ
    vy: -1.5 
  });
}

function resizeCanvas() {
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  player.y = canvas.height - 50;
  player.width = Math.max(70, canvas.width * 0.12);
  if (targetX === 0) targetX = canvas.width / 2;
}

window.addEventListener('resize', resizeCanvas);
if (btnRestart) btnRestart.addEventListener('click', restartGame);

// เชื่อมโยงปุ่มพาสปอร์ต/ดูแสตมป์ ให้ลิงก์ไปหน้า 06-stamp-received ของโซนลิง
if (btnViewCollection) {
  btnViewCollection.addEventListener('click', () => {
    window.location.href = `../../../app/web/06-stamp-received/index.html?zone=monkey&points=${score}`;
  });
}

resizeCanvas();

// ดักจับปุ่มเลือกโหมดจากหน้าจอ HTML
const selectCameraBtn = document.getElementById('select-camera');
const selectTouchBtn = document.getElementById('select-touch');

if (selectCameraBtn) {
  selectCameraBtn.addEventListener('click', () => {
    controlMode = 'camera';
    if (modeSelectScreen) modeSelectScreen.style.display = 'none';
    startGameFlow();
    initMediaPipeCamera();
  });
}

if (selectTouchBtn) {
  selectTouchBtn.addEventListener('click', () => {
    controlMode = 'touch';
    if (modeSelectScreen) modeSelectScreen.style.display = 'none';
    container.classList.add('touch-mode');
    startGameFlow();
    if (statusEl) statusEl.innerText = "โหมดลาก: ใช้เมาส์หรือใช้นิ้วเลื่อนซ้าย-ขวาเพื่อบังคับลิง";
  });
}

function startGameFlow() {
  gameStarted = true;
  startTimers();
  requestAnimationFrame(gameLoop);
}

// ตั้งค่าและเปิดใช้งาน MediaPipe Face Mesh สำหรับตรวจจับใบหน้า
function initMediaPipeCamera() {
  if (typeof FaceMesh === 'undefined') {
    if (statusEl) statusEl.innerText = "ไม่พบไลบรารีกล้อง สลับมาใช้โหมดลากแทนอัตโนมัติ";
    controlMode = 'touch';
    container.classList.add('touch-mode');
    return;
  }

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onFaceResults);

  if (webcamElement && typeof Camera !== 'undefined') {
    cameraUtilsInstance = new Camera(webcamElement, {
      onFrame: async () => {
        if (gameStarted && controlMode === 'camera') {
          await faceMesh.send({ image: webcamElement });
        }
      },
      width: 320,
      height: 240
    });
    cameraUtilsInstance.start().then(() => {
      if (statusEl) statusEl.innerText = "กล้องพร้อมแล้ว! ขยับใบหน้าซ้าย-ขวาเพื่อบังคับลิง";
    }).catch(err => {
      console.error("Camera start error:", err);
      if (statusEl) statusEl.innerText = "เปิดกล้องไม่สำเร็จ สลับมาใช้โหมดลากแทน";
      controlMode = 'touch';
      container.classList.add('touch-mode');
    });
  }
}

function onFaceResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    if (blinkStatusEl) blinkStatusEl.innerText = "ตา: ไม่พบใบหน้า";
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];
  const nose = landmarks[1]; 
  const normalizedX = 1 - nose.x; 
  targetX = normalizedX * canvas.width;

  if (blinkStatusEl) blinkStatusEl.innerText = "ตา: ปกติ (จับหน้าได้)";
}

// ควบคุมผ่านเมาส์หรือนิ้วลาก
container.addEventListener('mousemove', (e) => {
  if (!gameStarted || controlMode !== 'touch') return;
  const rect = container.getBoundingClientRect();
  targetX = e.clientX - rect.left;
});

container.addEventListener('touchmove', (e) => {
  if (!gameStarted || controlMode !== 'touch') return;
  const rect = container.getBoundingClientRect();
  if (e.touches.length > 0) {
    targetX = e.touches[0].clientX - rect.left;
  }
}, { passive: true });

function spawnItem() {
  if (isGameOver || !gameStarted) return;

  const isPoison = Math.random() < 0.18;
  const itemSize = Math.max(34, canvas.width * 0.055);
  
  items.push({
    x: Math.random() * (canvas.width - 60) + 30,
    y: -30,
    size: itemSize,
    type: isPoison ? ITEM_TYPES.POISON : ITEM_TYPES.BANANA,
    speed: (1.2 + Math.random() * 1.2) * (canvas.height / 500) * speedMultiplier
  });
}

function startTimers() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  spawnInterval = setInterval(spawnItem, 1000);

  timerInterval = setInterval(() => {
    if (isGameOver || !gameStarted) return;
    timeLeft--;
    if (timerEl) timerEl.innerText = timeLeft;
    speedMultiplier += 0.015;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function updateGame() {
  if (isGameOver || !gameStarted) return;

  player.x += (targetX - player.x) * 0.2;
  player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.y += item.speed;

    const distX = Math.abs(item.x - player.x);
    const distY = Math.abs(item.y - (player.y - 10));

    if (distX < player.width / 2 + item.size / 2 && distY < player.height / 2 + item.size / 2) {
      if (item.type.type === 'normal') {
        score += item.type.score;
        playSound('banana'); // เสียงเมื่อเก็บกล้วย
        addFloatingText('+10', item.x, item.y, true); // แสดงตัวเลข +10
        if (score >= TARGET_SCORE) {
          score = TARGET_SCORE;
          endGame(true);
        }
      } else {
        score = Math.max(0, score + item.type.score);
        playSound('poison'); // เสียงเมื่อโดนพิษ
        addFloatingText('-5', item.x, item.y, false); // แสดงตัวเลข -5
      }
      if (scoreEl) scoreEl.innerText = score;
      items.splice(i, 1);
      continue;
    }

    if (item.y > canvas.height + 40) {
      items.splice(i, 1);
    }
  }
}

// --- โหลดรูปภาพพื้นหลังเกมจาก img/img/bggame.png ---
const bgImage = new Image();
bgImage.src = 'img/img/bggame.png';
let isBgLoaded = false;
bgImage.onload = () => {
  isBgLoaded = true;
};

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. วาดรูปพื้นหลังป่า ปรับสัดส่วนอัตโนมัติให้พอดีกับจอ (Cover) ไม่ให้ภาพยืดเบี้ยว
  if (isBgLoaded) {
    const hRatio = canvas.width / bgImage.width;
    const vRatio = canvas.height / bgImage.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (canvas.width - bgImage.width * ratio) / 2;
    const centerShiftY = (canvas.height - bgImage.height * ratio) / 2;
    
    ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height, 
                  centerShiftX, centerShiftY, bgImage.width * ratio, bgImage.height * ratio);
  } else {
    ctx.fillStyle = '#0f2614';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // วาดตัวลิง
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
  ctx.font = `${player.width * 1.1}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.emoji, player.x, player.y - 10);
  ctx.restore();

  // วาดไอเทม (กล้วย หรือ ไอเทมพิษ)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    ctx.save();
    ctx.shadowBlur = 14;
    
    if (item.type.type === 'normal') {
      // กล้วยปกติ
      ctx.shadowColor = '#facc15';
      ctx.font = `${item.size * 1.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍌', item.x, item.y);
    } else {
      // ไอเทมพิษ (รูปกะโหลก ☠️)
      ctx.shadowColor = '#ef4444';
      ctx.font = `${item.size * 1.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☠️', item.x, item.y);
    }
    ctx.restore();
  }

  // วาดและอัปเดตตัวเลขคะแนนที่ลอยขึ้นมา
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();

    ft.y += ft.vy;
    ft.alpha -= 0.03;

    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }
}

function gameLoop() {
  if (!gameStarted) return;
  updateGame();
  drawGame();
  if (!isGameOver) {
    requestAnimationFrame(gameLoop);
  }
}

function endGame(isWin = score >= TARGET_SCORE) {
  isGameOver = true;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  
  if (overlayEl) {
    overlayEl.classList.add('active');
    const endTitle = document.getElementById('end-title');
    const endDesc = document.getElementById('end-desc');
    const pointValue = document.getElementById('result-point-value');
    const resultCard = document.getElementById('result-card');
    
    if (endTitle) endTitle.innerText = isWin ? "🎉 ยอดเยี่ยม! ชนะแล้ว!" : "⏰ หมดเวลาแล้ว!";
    if (endDesc) endDesc.innerText = `คุณทำคะแนนได้ ${score} / ${TARGET_SCORE} คะแนน`;
    if (pointValue) pointValue.innerText = score;
    
    if (resultCard) {
      if (isWin) {
        resultCard.classList.remove('is-lose');
      } else {
        resultCard.classList.add('is-lose');
      }
    }
  }
}

function restartGame() {
  score = 0;
  timeLeft = INITIAL_TIME;
  speedMultiplier = 1.0;
  isGameOver = false;
  items.length = 0;
  floatingTexts.length = 0;
  
  if (scoreEl) scoreEl.innerText = score;
  if (timerEl) timerEl.innerText = timeLeft;
  if (overlayEl) overlayEl.classList.remove('active');

  targetX = canvas.width / 2;
  startTimers();
  requestAnimationFrame(gameLoop);
} 