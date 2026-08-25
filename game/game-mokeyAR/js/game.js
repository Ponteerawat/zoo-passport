// ==========================================
// 1. DOM Elements & State Setup
// ==========================================
const container = document.getElementById('game-container');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const blinkStatusEl = document.getElementById('blink-status');
const statusText = document.getElementById('status');
const videoElement = document.getElementById('webcam-preview');

const overlay = document.getElementById('overlay');
const resultCard = document.getElementById('result-card');
const endTitle = document.getElementById('end-title');
const endDesc = document.getElementById('end-desc');
const resultRewardLabelEl = document.getElementById('result-reward-label');
const resultRewardNameEl = document.getElementById('result-reward-name');
const resultPointValueEl = document.getElementById('result-point-value');
const btnRestart = document.getElementById('btn-restart');
const btnViewCollection = document.getElementById('btn-view-collection');
const stampsCollectionWrap = document.getElementById('stamps-collection-wrap');
const stampsEarnedSection = document.getElementById('stamps-earned-section');
const stampsCollectionGrid = document.getElementById('stamps-collection-grid');
const stampsProgressEl = document.getElementById('stamps-progress');
const skillBtn = document.getElementById('btn-skill');

// ค่าคงที่และตัวแปรสถานะ
// ปรับสมดุลคะแนน: ลดคะแนนกล้วยลงประมาณ 50% (10 -> 5) และลดเป้าหมาย/บทลงโทษ
// กล้วยพิษลงตามสัดส่วนเดียวกัน เพื่อให้จำนวนกล้วยที่ต้องเก็บและความยากโดยรวมเท่าเดิม
const TARGET_SCORE = 100;
const INITIAL_TIME = 50;

let score = 0;
let timeLeft = INITIAL_TIME;
let speedMultiplier = 1.0;
let isGameOver = false;

// สถิติของรอบปัจจุบัน ใช้ประเมินแสตมป์ที่จะได้รับตอนจบเกม
let poisonHits = 0;
let skillUsedCount = 0;

let targetX = 0;
let isBlinking = false;
let blinkCooldown = false;

// โหมดควบคุม: 'camera' (ตามค่าเริ่มต้น) หรือ 'touch' (ลากนิ้ว/เมาส์ เมื่อกล้องใช้ไม่ได้)
let controlMode = 'camera';
let isDragging = false;

let spawnInterval = null;
let timerInterval = null;

// ==========================================
// 🐵 จุดที่ 1: กำหนดตัวละครน้องลิง (ตัวแปร player) 
// สามารถเปลี่ยนรูป emoji และขนาดได้ที่นี่ครับ
// ==========================================
const player = {
  x: 0,
  y: 0,
  width: 70,
  height: 60,
  emoji: '🐒' // <-- หากต้องการเปลี่ยนหน้าลิง แก้ตรงนี้ได้เลยครับ
};

// รายการกล้วย
const items = [];
const ITEM_TYPES = {
  BANANA: { type: 'normal', score: 5 },
  POISON: { type: 'poison', score: -8 }
};

// ==========================================
// 2. Responsive Canvas & Event Listeners
// ==========================================
function resizeCanvas() {
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  player.y = canvas.height - 45;
  player.width = Math.max(60, canvas.width * 0.12);
  if (targetX === 0) targetX = canvas.width / 2;
}

window.addEventListener('resize', resizeCanvas);
btnRestart.addEventListener('click', restartGame);

// กำหนดขนาดเริ่มต้น
resizeCanvas();

// ==========================================
// 3. Game Logic & Mechanics
// ==========================================
function spawnItem() {
  if (isGameOver) return;

  const isPoison = Math.random() < 0.38;
  const itemSize = Math.max(22, canvas.width * 0.035);
  
  items.push({
    x: Math.random() * (canvas.width - 60) + 30,
    y: -20,
    size: itemSize,
    type: isPoison ? ITEM_TYPES.POISON : ITEM_TYPES.BANANA,
    speed: (2 + Math.random() * 2) * (canvas.height / 500) * speedMultiplier
  });
}

function startTimers() {
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  spawnInterval = setInterval(spawnItem, 800);

  timerInterval = setInterval(() => {
    if (isGameOver) return;

    timeLeft--;
    timerEl.innerText = timeLeft;

    // เร่งความเร็วกล้วยตกเรื่อยๆ (+3% ทุกๆ 1 วินาที)
    speedMultiplier += 0.03;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  isGameOver = true;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);

  const isWin = score >= TARGET_SCORE;
  resultCard.classList.toggle('is-win', isWin);
  resultCard.classList.toggle('is-lose', !isWin);

  if (isWin) {
    endTitle.innerHTML = "ภารกิจสำเร็จ! 🎉";
    endDesc.innerHTML = `น้องลิงอิ่มแปล้ ได้กล้วยครบตามเป้าหมายแล้ว! 🐒🍌`;
    if (resultRewardLabelEl) resultRewardLabelEl.innerHTML = "🏅 ยินดีด้วย! คุณได้รับ";
  } else {
    endTitle.innerHTML = "หมดเวลาแล้ว! 🍌";
    endDesc.innerHTML = `น้องลิงยังหิวอยู่นะ ทำได้ ${score} / ${TARGET_SCORE} คะแนน ลองใหม่อีกรอบ!`;
    if (resultRewardLabelEl) resultRewardLabelEl.innerHTML = "😢 เสียใจด้วยนะ!";
  }

  resultPointValueEl.innerText = score;

  // ประเมินและแสดงผลแสตมป์สัตว์ที่ได้รับจากผลงานรอบนี้
  if (typeof StampSystem !== 'undefined') {
    const runStats = {
      finished: true,
      score: score,
      poisonHits: poisonHits,
      skillUsed: skillUsedCount
    };
    const { newlyEarned, owned } = StampSystem.evaluateRun(runStats);

    // การ์ดรางวัลหลัก: โชว์แสตมป์ที่ได้ใหม่ตัวที่โดดเด่นที่สุดของรอบนี้ (ตัวสุดท้ายใน STAMP_DEFS ที่ปลดล็อก)
    if (newlyEarned.length > 0) {
      const featured = newlyEarned[newlyEarned.length - 1];
      resultRewardNameEl.innerHTML = `${featured.emoji} Animal Stamp: ${featured.name}`;
      resultRewardNameEl.style.color = featured.color;
    } else {
      resultRewardNameEl.innerHTML = 'ยังไม่ได้แสตมป์ใหม่ในรอบนี้ ลองอีกครั้งนะ!';
      resultRewardNameEl.style.color = '#94a3b8';
    }

    StampSystem.renderNewlyEarnedBanner(stampsEarnedSection, newlyEarned);
    StampSystem.renderCollectionGrid(
      stampsCollectionGrid,
      owned,
      newlyEarned.map((s) => s.id)
    );
    if (stampsProgressEl) {
      stampsProgressEl.innerText = `สะสมแล้ว ${owned.length} / ${StampSystem.STAMP_DEFS.length} แสตมป์`;
    }
  }

  overlay.classList.add('active');
}

function restartGame() {
  score = 0;
  timeLeft = INITIAL_TIME;
  speedMultiplier = 1.0;
  isGameOver = false;
  items.length = 0;
  poisonHits = 0;
  skillUsedCount = 0;

  scoreEl.innerText = score;
  timerEl.innerText = timeLeft;
  overlay.classList.remove('active');

  // พับคอลเลกชันแสตมป์กลับก่อนเริ่มรอบใหม่
  if (stampsCollectionWrap && !stampsCollectionWrap.hasAttribute('hidden')) {
    stampsCollectionWrap.setAttribute('hidden', '');
    if (btnViewCollection) btnViewCollection.innerHTML = '📖 ดูคอลเลกชัน';
  }

  startTimers();
}

btnViewCollection.addEventListener('click', () => {
  const isHidden = stampsCollectionWrap.hasAttribute('hidden');
  if (isHidden) {
    stampsCollectionWrap.removeAttribute('hidden');
    btnViewCollection.innerHTML = '🙈 ซ่อนคอลเลกชัน';
  } else {
    stampsCollectionWrap.setAttribute('hidden', '');
    btnViewCollection.innerHTML = '📖 ดูคอลเลกชัน';
  }
});

function getIdleSkillLabel() {
  return controlMode === 'touch' ? '⚡ แตะปุ่มเพื่อใช้สกิล' : 'ตา: ปกติ';
}

function triggerPulseSkill() {
  if (blinkCooldown || isGameOver) return;
  blinkCooldown = true;
  skillUsedCount++;
  blinkStatusEl.innerText = "⚡ สกิลล้างกล้วยพิษ!";
  blinkStatusEl.style.color = "#a855f7";
  if (skillBtn) skillBtn.disabled = true;

  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].type === ITEM_TYPES.POISON) {
      items.splice(i, 1);
    }
  }

  setTimeout(() => {
    blinkCooldown = false;
    blinkStatusEl.innerText = getIdleSkillLabel();
    blinkStatusEl.style.color = "#4ade80";
    if (skillBtn) skillBtn.disabled = false;
  }, 2500);
}

// ==========================================
// 4. Game Loop (Render & Update)
// ==========================================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!isGameOver) {
    player.x += (targetX - player.x) * 0.18;
  }

  // วาดฐานรองรับน้องลิง
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 15, player.width / 2, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // ==========================================
  // 🐵 จุดที่ 2: โค้ดส่วนที่ใช้วาดลิงลงบนหน้าจอ
  // (ถ้าลิงในเครื่องคุณดูสีเขียวหรือมืดไป สามารถปรับ filter ตรงนี้ได้ครับ)
  // ==========================================
  ctx.save();
  // หากต้องการกลับไปใช้สีเดิม ให้ลบหรือ comment บรรทัด ctx.filter นี้ทิ้งครับ
  ctx.filter = 'brightness(0.7) saturate(1.5)'; // ปรับความสว่างและสี
  ctx.font = `${player.width}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(player.emoji, player.x, player.y - 10);
  ctx.restore();

  // อัปเดตและวาดกล้วย
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (!isGameOver) {
      item.y += item.speed;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (item.type === ITEM_TYPES.BANANA) {
      ctx.font = `${item.size * 1.8}px Arial`;
      ctx.fillText('🍌', item.x, item.y);
    } else {
      // กล้วยพิษ: เดิมใช้อีโมจิ 🍌 สีเหลืองตัวเดียวกับกล้วยปกติทุกประการ
      // ต่างกันแค่ไอคอน ☠️ เล็ก ๆ ที่มุม ทำให้แยกไม่ทันตอนเล่นเร็ว ๆ
      // แก้โดย 1) ใส่วงแสงสีม่วงเรืองแบบ radial gradient ด้านหลัง (เห็นชัดทุกเบราว์เซอร์
      // ไม่พึ่ง canvas filter) และ 2) ปรับโทนสีตัวอีโมจิให้ออกม่วง/เขียวพิษด้วย ctx.filter
      const glowRadius = item.size * 1.35;
      const glow = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, glowRadius);
      glow.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
      glow.addColorStop(0.6, 'rgba(168, 85, 247, 0.25)');
      glow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.save();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(item.x, item.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.filter = 'hue-rotate(250deg) saturate(280%) brightness(0.8)';
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#a855f7';
      ctx.font = `${item.size * 1.8}px Arial`;
      ctx.fillText('🍌', item.x, item.y);
      ctx.restore();

      ctx.font = `${item.size * 0.9}px Arial`;
      ctx.fillText('☠️', item.x + item.size * 0.5, item.y - item.size * 0.4);
    }

    // ตรวจจับการชน
    if (!isGameOver) {
      const hitDistanceX = Math.abs(item.x - player.x);
      const hitDistanceY = Math.abs(item.y - player.y);

      if (hitDistanceX < player.width / 1.8 && hitDistanceY < 30) {
        score += item.type.score;
        if (score < 0) score = 0;
        if (item.type === ITEM_TYPES.POISON) poisonHits++;
        scoreEl.innerText = score;
        if (score >= TARGET_SCORE) {
          endGame();
        }
        items.splice(i, 1);
        continue;
      }

      if (item.y > canvas.height + 40) {
        items.splice(i, 1);
      }
    }
  }

  requestAnimationFrame(gameLoop);
}

// ==========================================
// 5. Touch / Drag Control Mode (Camera Fallback)
// ==========================================
// เปิดใช้เมื่อกล้องใช้งานไม่ได้ (ถูกปฏิเสธสิทธิ์, ไม่มีกล้อง, หรือเบราว์เซอร์ไม่รองรับ)
// ผู้เล่นควบคุมน้องลิงด้วยการลากนิ้ว/เมาส์แทนการขยับสายตา ใช้ Pointer Events
// เพื่อรองรับทั้งจอสัมผัส (มือถือ/แท็บเล็ต) และเมาส์ (เดสก์ท็อป) ด้วยโค้ดชุดเดียว
function updateTargetFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  targetX = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, x));
}

function enableTouchControls() {
  controlMode = 'touch';
  container.classList.add('touch-mode');

  // ซ่อนองค์ประกอบที่เกี่ยวกับกล้อง เพราะไม่ได้ใช้งานในโหมดนี้
  videoElement.style.display = 'none';
  blinkStatusEl.innerText = getIdleSkillLabel();
  blinkStatusEl.style.color = '#fcfcfcff';

  if (skillBtn) {
    skillBtn.style.display = 'flex';
    skillBtn.addEventListener('click', () => triggerPulseSkill());
  }

  container.addEventListener('pointerdown', (e) => {
    if (isGameOver) return;
    isDragging = true;
    updateTargetFromClientX(e.clientX);
  });

  container.addEventListener('pointermove', (e) => {
    if (!isDragging || isGameOver) return;
    updateTargetFromClientX(e.clientX);
  });

  window.addEventListener('pointerup', () => { isDragging = false; });
  window.addEventListener('pointercancel', () => { isDragging = false; });
}

function startGame(message) {
  statusText.innerText = message;
  startTimers();
  gameLoop();
}

// ==========================================
// 6. MediaPipe Eye Tracking Setup (โหมดกล้อง)
// ==========================================
function getEyeDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function onResults(results) {
  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

  const landmarks = results.multiFaceLandmarks[0];
  const noseTip = landmarks[1];
  
  const eyeX = (1 - noseTip.x) * canvas.width;
  targetX = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, eyeX));

  // ตรวจจับการกระพริบตา
  const topLid = landmarks[159];
  const bottomLid = landmarks[145];
  const eyeDist = getEyeDistance(topLid, bottomLid);

  if (eyeDist < 0.015) {
    if (!isBlinking) {
      isBlinking = true;
      triggerPulseSkill();
    }
  } else {
    isBlinking = false;
  }
}

// ตรวจสอบว่าเบราว์เซอร์รองรับกล้อง/MediaPipe ครบหรือไม่ ก่อนพยายามเปิดกล้องจริง
const cameraApiAvailable =
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
  typeof Camera !== 'undefined' &&
  typeof FaceMesh !== 'undefined';

if (!cameraApiAvailable) {
  // อุปกรณ์/เบราว์เซอร์นี้ไม่รองรับกล้องหรือไลบรารีตรวจจับใบหน้าโหลดไม่สำเร็จ
  enableTouchControls();
  startGame('🎮 ไม่พบระบบกล้องบนอุปกรณ์นี้ ใช้โหมดลากนิ้ว/เมาส์แทน');
} else {
  try {
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await faceMesh.send({ image: videoElement });
      },
      width: 640,
      height: 480,
      facingMode: 'user'
    });

    camera.start().then(() => {
      startGame(`🟢 พร้อมแล้ว! ขยับสายตาเพื่อพาน้องลิงไปรับกล้วยให้ครบ ${TARGET_SCORE} คะแนน`);
    }).catch((err) => {
      // ผู้ใช้ปฏิเสธสิทธิ์กล้อง หรือไม่มีกล้องให้เข้าถึง -> สลับไปโหมดลากนิ้ว/เมาส์
      console.error(err);
      enableTouchControls();
      startGame('🎮 ไม่สามารถเปิดกล้องได้ สลับเป็นโหมดลากนิ้ว/เมาส์ควบคุมน้องลิงแทน');
    });
  } catch (err) {
    // กันเหนียวกรณีไลบรารีสร้าง object ไม่สำเร็จด้วยเหตุผลอื่น (เช่น CDN ถูกบล็อก)
    console.error(err);
    enableTouchControls();
    startGame('🎮 ระบบตรวจจับใบหน้าใช้งานไม่ได้ สลับเป็นโหมดลากนิ้ว/เมาส์แทน');
  }
}