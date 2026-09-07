/**
         * ============================================================================
         * MODULE: THREE.JS 3D SCENE MANAGEMENT
         * ============================================================================
         */
let scene, camera, renderer, penguinGroup;

function init3D() {
    try {
        const threeCanvas = document.getElementById('threeCanvas');
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xe0f2fe, 1.0);
        dirLight.position.set(5, 12, 8);
        scene.add(dirLight);

        penguinGroup = new THREE.Group();

        // 1. Ice Pedestal
        const iceGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 32);
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            roughness: 0.1,
            transmission: 0.6,
            transparent: true
        });
        const iceBase = new THREE.Mesh(iceGeo, iceMat);
        iceBase.position.y = -1.2;
        penguinGroup.add(iceBase);

        // 2. Body
        const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
        bodyGeo.scale(1, 1.25, 0.85);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        penguinGroup.add(body);

        // 3. Belly
        const bellyGeo = new THREE.SphereGeometry(0.8, 32, 32);
        bellyGeo.scale(0.82, 1.05, 0.45);
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, -0.1, 0.52);
        penguinGroup.add(belly);

        // 4. Eyes
        const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x020617 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.28, 0.45, 0.72);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.28, 0.45, 0.72);
        penguinGroup.add(leftEye);
        penguinGroup.add(rightEye);

        // 5. Beak
        const beakGeo = new THREE.ConeGeometry(0.18, 0.45, 16);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.2 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0.28, 0.85);
        penguinGroup.add(beak);

        // 6. Wings
        const wingGeo = new THREE.SphereGeometry(0.35, 16, 16);
        wingGeo.scale(0.2, 0.9, 0.45);
        const leftWing = new THREE.Mesh(wingGeo, bodyMat);
        leftWing.position.set(-1.05, 0, 0);
        leftWing.rotation.z = Math.PI / 7;
        const rightWing = new THREE.Mesh(wingGeo, bodyMat);
        rightWing.position.set(1.1, 0, 0);
        rightWing.rotation.z = -Math.PI / 7;
        penguinGroup.add(leftWing);
        penguinGroup.add(rightWing);

        penguinGroup.position.set(0, -1.5, 0);
        scene.add(penguinGroup);

        resize3D();
    } catch (err) {
        console.error('ไม่สามารถเริ่มต้นฉาก 3D ได้:', err);
        scene = camera = renderer = penguinGroup = null;
    }
}

function resize3D() {
    if (!renderer || !camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height);
    camera.aspect = width / height;

    if (width / height < 1) {
        camera.position.set(0, -0.6, 7.5); // Mobile
    } else {
        camera.position.set(0, -1.0, 5.5); // Desktop
    }
    camera.updateProjectionMatrix();
}

function update3DPenguin(dt) {
    if (!penguinGroup) return;
    const time = performance.now() * 0.0025;
    penguinGroup.rotation.y = Math.sin(time) * 0.12;
    penguinGroup.position.y = -1.5 + Math.abs(Math.sin(time * 2)) * 0.08;
}

/**
 * ============================================================================
 * MODULE: AI HAND TRACKING & HYBRID CONTROLS
 * ============================================================================
 */
let handLandmarks = null;
let aiActive = false;
let lastHandDetectedTime = 0;
let cameraInstance = null;
let cameraStarting = false;
let handsReady = false;
let hands = null;

let cursor = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    isPinched: false,
    wasPinched: false,
    state: 'normal'
};

function initHandsModel() {
    try {
        if (typeof Hands === 'undefined') return null;
        const instance = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        instance.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.65,
            minTrackingConfidence: 0.65
        });
        instance.onResults(onHandResults);
        handsReady = true;
        return instance;
    } catch (err) {
        console.error('Error init hands:', err);
        return null;
    }
}

function onHandResults(results) {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!gameCanvas) return;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        handLandmarks = results.multiHandLandmarks[0];
        aiActive = true;
        lastHandDetectedTime = performance.now();

        const indexTip = handLandmarks[8];
        let tx = (1 - indexTip.x) * gameCanvas.width;
        let ty = indexTip.y * gameCanvas.height;
        cursor.targetX = Math.max(0, Math.min(gameCanvas.width, tx));
        cursor.targetY = Math.max(0, Math.min(gameCanvas.height, ty));

        const thumbTip = handLandmarks[4];
        const thumbX = (1 - thumbTip.x) * gameCanvas.width;
        const thumbY = thumbTip.y * gameCanvas.height;

        const dx = cursor.targetX - thumbX;
        const dy = cursor.targetY - thumbY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const responsiveThreshold = Math.min(gameCanvas.width, gameCanvas.height) * 0.08;
        cursor.isPinched = (distance < responsiveThreshold);

    } else {
        if (performance.now() - lastHandDetectedTime > 1200) {
            aiActive = false;
            handLandmarks = null;
        }
    }
}

async function startCamera() {
    if (cameraStarting || cameraInstance) return true;
    cameraStarting = true;

    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('No getUserMedia');
        if (typeof Camera === 'undefined') throw new Error('Camera Utils missing');

        if (!hands) hands = initHandsModel();
        if (!hands) throw new Error('Hands model init failed');

        const webcam = document.getElementById('webcam');
        cameraInstance = new Camera(webcam, {
            onFrame: async () => {
                try { await hands.send({ image: webcam }); } catch (err) { }
            },
            width: 1280,
            height: 720
        });

        await cameraInstance.start();
        cameraStarting = false;
        return true;
    } catch (err) {
        console.warn('Camera failed, using fallback:', err);
        aiActive = false;
        cameraInstance = null;
        cameraStarting = false;
        document.getElementById('cameraErrorModal').classList.remove('hidden');
        return false;
    }
}

// Pointer fallback
function updatePointerPosition(x, y) {
    const gameCanvas = document.getElementById('gameCanvas');
    if (!aiActive && gameCanvas) {
        cursor.targetX = Math.max(0, Math.min(gameCanvas.width, x));
        cursor.targetY = Math.max(0, Math.min(gameCanvas.height, y));
    }
}
window.addEventListener('mousemove', (e) => updatePointerPosition(e.clientX, e.clientY));
window.addEventListener('mousedown', () => { if (!aiActive) cursor.isPinched = true; });
window.addEventListener('mouseup', () => { if (!aiActive) cursor.isPinched = false; });
window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
        if (!aiActive) cursor.isPinched = true;
    }
}, { passive: true });
window.addEventListener('touchend', () => { if (!aiActive) cursor.isPinched = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) aiActive = false; });

/**
 * ============================================================================
 * MODULE: MAIN GAME LOGIC & ENGINE
 * ============================================================================
 */
let gameState = 'START';
let score = 0;
let level = 1;
let timeLeft = 45;
let gameTimer = null;
let lastFrameTime = performance.now();
let isTabHidden = false;

let fishes = [];
let grabbedObject = null;

const ITEM_TYPES = {
    FISH: { type: 'fish', points: 10 },
    BOMB: { type: 'bomb', points: -15 }
};

let particles = [];
let screenShake = { time: 0, magnitude: 0 };
const EXPLOSION_FLASH_DURATION = 0.25;
let explosionFlash = { time: 0 };

let audioCtx = null;
function getAudioCtx() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    } catch (err) { return null; }
}

function playCatchSound() {
    const ac = getAudioCtx();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.3);
}

function playExplosionSound() {
    const ac = getAudioCtx();
    if (!ac) return;
    const now = ac.currentTime;
    const bufferSize = Math.floor(ac.sampleRate * 0.4);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(filter).connect(noiseGain).connect(ac.destination);
    noise.start(now);

    const thump = ac.createOscillator();
    const thumpGain = ac.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(120, now);
    thump.frequency.exponentialRampToValueAtTime(35, now + 0.3);
    thumpGain.gain.setValueAtTime(0.5, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    thump.connect(thumpGain).connect(ac.destination);
    thump.start(now);
    thump.stop(now + 0.4);
}

function spawnParticles(x, y, color, count, opts = {}) {
    const speed = opts.speed || 200;
    const life = opts.life || 0.6;
    const size = opts.size || 4;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = speed * (0.4 + Math.random() * 0.6);
        particles.push({
            x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
            life, maxLife: life, size: size * (0.6 + Math.random() * 0.8), color
        });
    }
}

function triggerCatchEffect(x, y) {
    spawnParticles(x, y, '#facc15', 16, { speed: 220, life: 0.5, size: 4 });
    spawnParticles(x, y, '#34d399', 10, { speed: 140, life: 0.7, size: 3 });
    playCatchSound();
}

function triggerExplosion(x, y) {
    spawnParticles(x, y, '#f97316', 26, { speed: 340, life: 0.7, size: 6 });
    spawnParticles(x, y, '#f43f5e', 16, { speed: 260, life: 0.9, size: 5 });
    spawnParticles(x, y, '#78716c', 12, { speed: 180, life: 1.1, size: 7 });
    screenShake.time = 0.35;
    screenShake.magnitude = 18;
    explosionFlash.time = EXPLOSION_FLASH_DURATION;
    playExplosionSound();
}

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const dom = {
    levelTxt: document.getElementById('levelTxt'),
    scoreTxt: document.getElementById('scoreTxt'),
    timeTxt: document.getElementById('timeTxt'),
    finalScore: document.getElementById('finalScore'),
    winScore: document.getElementById('winScore'),
    aiStatusTxt: document.getElementById('aiStatusTxt'),
    aiStatusPill: document.getElementById('aiStatus'),
    startModal: document.getElementById('startModal'),
    instructionModal: document.getElementById('instructionModal'),
    gameOverModal: document.getElementById('gameOverModal'),
    missionCompleteModal: document.getElementById('missionCompleteModal'),
    btnStartGame: document.getElementById('btnStartGame'),
    startTouchBtn: document.getElementById('startTouchBtn'),
    startARBtn: document.getElementById('startARBtn'),
    rotateOverlay: document.getElementById('rotateOverlay'),
    cancelARRotateBtn: document.getElementById('cancelARRotateBtn'),
    restartBtn: document.getElementById('restartBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    playAgainWinBtn: document.getElementById('playAgainWinBtn'),
    viewPassportBtn: document.getElementById('viewPassportBtn'),
    arToast: document.getElementById('arToast')
};

function resizeCanvas() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    resize3D();
}
window.addEventListener('resize', () => { setTimeout(resizeCanvas, 120); });

function spawnFish() {
    const screenUnit = Math.min(gameCanvas.width, gameCanvas.height);
    const radius = screenUnit * (level === 1 ? 0.045 : (level === 2 ? 0.038 : 0.032));

    // เพิ่มความเร็วตามเลเวลที่เพิ่มขึ้น
    const speedMultiplier = 1 + (level * 0.4);
    const speed = screenUnit * (0.06 * speedMultiplier);

    // โอกาสเกิดระเบิดเพิ่มขึ้นตามเลเวล
    const bombChance = level === 1 ? 0 : (level === 2 ? 0.25 : (level === 3 ? 0.4 : 0.5));
    const itemType = Math.random() < bombChance ? ITEM_TYPES.BOMB : ITEM_TYPES.FISH;

    fishes.push({
        id: Math.random(),
        x: screenUnit * 0.2 + Math.random() * (gameCanvas.width - screenUnit * 0.4),
        y: gameCanvas.height * 0.15 + Math.random() * (gameCanvas.height * 0.35),
        radius: radius,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        isGrabbed: false,
        itemType: itemType
    });
}

function initLevel() {
    fishes = [];
    grabbedObject = null;
    const count = level === 1 ? 4 : (level === 2 ? 6 : 8);
    for (let i = 0; i < count; i++) spawnFish();
}

function checkLevelProgression() {
    if (score >= 100) {
        score = 100;
        dom.scoreTxt.innerText = score;
        triggerMissionComplete();
        return;
    }

    let newLevel = 1;
    if (score >= 70) newLevel = 4;
    else if (score >= 40) newLevel = 3;
    else if (score >= 20) newLevel = 2;

    if (newLevel !== level) {
        level = newLevel;
        dom.levelTxt.innerText = level;
        initLevel();
    }
}

function gameLoop(time) {
    try { runFrame(time); } catch (err) { }
    requestAnimationFrame(gameLoop);
}

function runFrame(time) {
    const dt = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.1);
    lastFrameTime = time;

    if (gameCanvas.width === 0 || gameCanvas.height === 0) return;
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.save();
    if (screenShake.time > 0) {
        screenShake.time -= dt;
        const shakeAmt = screenShake.magnitude * Math.max(0, screenShake.time);
        ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
    }

    const lerpSpeed = 1 - Math.exp(-22 * dt);
    cursor.x += (cursor.targetX - cursor.x) * lerpSpeed;
    cursor.y += (cursor.targetY - cursor.y) * lerpSpeed;

    if (aiActive) {
        dom.aiStatusTxt.innerText = 'AI Tracking Active';
        dom.aiStatusPill.className = 'glass-pill px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold text-emerald-300 flex items-center gap-2';
    } else {
        dom.aiStatusTxt.innerText = 'Touch / Mouse Mode';
        dom.aiStatusPill.className = 'glass-pill px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-semibold text-sky-300 flex items-center gap-2';
    }

    if (aiActive && handLandmarks) {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        handLandmarks.forEach((lm) => {
            ctx.beginPath();
            ctx.arc((1 - lm.x) * gameCanvas.width, lm.y * gameCanvas.height, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    update3DPenguin(dt);
    if (renderer && scene && camera) renderer.render(scene, camera);

    if (gameState === 'PLAYING' && !isTabHidden) updateFishesAndInteraction(dt);

    // Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.94; p.vy *= 0.94;
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    if (gameState === 'INSTRUCTION') {
        const rect = dom.btnStartGame.getBoundingClientRect();
        if (cursor.x >= rect.left && cursor.x <= rect.right && cursor.y >= rect.top && cursor.y <= rect.bottom) {
            cursor.state = 'hover';
            if (cursor.isPinched && !cursor.wasPinched) startGame();
        }
    }

    drawCursor();
    ctx.restore();

    if (explosionFlash.time > 0) {
        explosionFlash.time -= dt;
        const alpha = Math.max(0, explosionFlash.time / EXPLOSION_FLASH_DURATION) * 0.35;
        ctx.save(); ctx.fillStyle = `rgba(248, 113, 113, ${alpha})`; ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height); ctx.restore();
    }

    cursor.wasPinched = cursor.isPinched;
}

function updateFishesAndInteraction(dt) {
    let hoveringAny = false;
    const screenUnit = Math.min(gameCanvas.width, gameCanvas.height);
    const mouthX = gameCanvas.width / 2;
    const mouthY = gameCanvas.height * 0.72;
    const mouthRadius = screenUnit * 0.14;

    ctx.save();
    ctx.beginPath(); ctx.arc(mouthX, mouthY, mouthRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)'; ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();

    fishes.forEach((fish) => {
        if (!fish.isGrabbed) {
            fish.x += fish.vx * dt; fish.y += fish.vy * dt;
            if (fish.x < fish.radius || fish.x > gameCanvas.width - fish.radius) fish.vx *= -1;
            if (fish.y < gameCanvas.height * 0.1 || fish.y > gameCanvas.height * 0.5) fish.vy *= -1;
        } else {
            fish.x = cursor.x; fish.y = cursor.y;
        }

        const distToCursor = Math.hypot(cursor.x - fish.x, cursor.y - fish.y);
        if (distToCursor < fish.radius * 1.2) {
            hoveringAny = true;
            if (cursor.isPinched && !cursor.wasPinched && !grabbedObject) {
                fish.isGrabbed = true; grabbedObject = fish;
            }
        }

        if (!cursor.isPinched && fish.isGrabbed) {
            fish.isGrabbed = false; grabbedObject = null;
            const distToMouth = Math.hypot(fish.x - mouthX, fish.y - mouthY);
            if (distToMouth < mouthRadius) {
                if (fish.itemType && fish.itemType.type === 'bomb') {
                    triggerExplosion(fish.x, fish.y);
                    score = Math.max(0, score + fish.itemType.points);
                } else {
                    triggerCatchEffect(fish.x, fish.y);
                    score += fish.itemType ? fish.itemType.points : 10;
                }
                dom.scoreTxt.innerText = score;
                fishes = fishes.filter(f => f.id !== fish.id);
                spawnFish();
                checkLevelProgression();
            }
        }
        drawFish(fish);
    });

    if (grabbedObject) cursor.state = 'grabbed';
    else if (cursor.isPinched) cursor.state = 'miss_pinch';
    else if (hoveringAny) cursor.state = 'hover';
    else cursor.state = 'normal';
}

function drawFish(fish) {
    if (fish.itemType && fish.itemType.type === 'bomb') {
        ctx.save(); ctx.translate(fish.x, fish.y);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, fish.radius * 1.9);
        glow.addColorStop(0, 'rgba(248, 113, 113, 0.55)'); glow.addColorStop(1, 'rgba(248, 113, 113, 0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, fish.radius * 1.9, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = fish.isGrabbed ? '#7f1d1d' : '#1c1917';
        ctx.beginPath(); ctx.arc(0, 0, fish.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f87171'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.beginPath(); ctx.arc(-fish.radius * 0.3, -fish.radius * 0.35, fish.radius * 0.28, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#facc15'; ctx.lineWidth = Math.max(1.5, fish.radius * 0.12); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(fish.radius * 0.3, -fish.radius * 0.85);
        ctx.quadraticCurveTo(fish.radius * 0.9, -fish.radius * 1.4, fish.radius * 0.5, -fish.radius * 1.75); ctx.stroke();

        ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.arc(fish.radius * 0.5, -fish.radius * 1.75, fish.radius * 0.22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(fish.radius * 0.5, -fish.radius * 1.75, fish.radius * 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        return;
    }

    ctx.save(); ctx.translate(fish.x, fish.y);
    ctx.fillStyle = fish.isGrabbed ? '#f59e0b' : '#0ea5e9';
    ctx.beginPath(); ctx.ellipse(0, 0, fish.radius, fish.radius * 0.55, 0, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.moveTo(-fish.radius * 0.7, 0); ctx.lineTo(-fish.radius * 1.2, -fish.radius * 0.4);
    ctx.lineTo(-fish.radius * 1.2, fish.radius * 0.4); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(fish.radius * 0.4, -fish.radius * 0.18, fish.radius * 0.18, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawCursor() {
    ctx.save(); ctx.translate(cursor.x, cursor.y);
    if (cursor.state === 'normal') {
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5; ctx.stroke();
    } else if (cursor.state === 'hover') {
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.strokeStyle = '#facc15'; ctx.setLineDash([5, 5]); ctx.lineWidth = 3; ctx.stroke();
    } else if (cursor.state === 'miss_pinch') {
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fillStyle = 'rgba(244, 63, 94, 0.35)'; ctx.fill();
        ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2.5; ctx.stroke();
    } else if (cursor.state === 'grabbed') {
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34, 197, 94, 0.25)'; ctx.fill();
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#22c55e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('✓', 0, 0);
    }
    ctx.restore();
}

/**
 * ============================================================================
 * MODULE: MODE SELECTION (Touch-only vs AR Camera) & Landscape Lock
 * ============================================================================
 * บนมือถือ ผู้เล่นต้องเลือกเปิดโหมด AR เอง (ปุ่มแยก) และต้องหมุนจอเป็น
 * แนวนอนก่อนถึงจะเข้าสู่ระบบกล้อง/AI Hand Tracking ได้ ส่วนโหมดแตะ/ลาก
 * ด้วยนิ้วเล่นได้ทันทีโดยไม่แตะกล้องเลย (aiActive จะเป็น false ตลอด)
 */
function isMobileDevice() {
    const ua = navigator.userAgent || '';
    const uaMobile = /Android|iPhone|iPod|Windows Phone|Mobi/i.test(ua);
    const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const smallTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && Math.min(window.innerWidth, window.innerHeight) <= 820;
    return uaMobile || (coarsePointer && smallTouch);
}

function isPortraitOrientation() {
    return window.matchMedia('(orientation: portrait)').matches || window.innerHeight > window.innerWidth;
}

let arModePending = false;

function enterTouchMode() {
    getAudioCtx();
    dom.rotateOverlay.classList.add('hidden');
    dom.startModal.classList.add('hidden');
    arModePending = false;
    // ไม่เรียก startCamera() เลย -> aiActive คงเป็น false ตลอดเกม ผู้เล่นควบคุมด้วยนิ้ว/เมาส์เท่านั้น
    startGame();
}

async function enterARMode() {
    if (cameraStarting) return;
    getAudioCtx();
    if (isMobileDevice() && isPortraitOrientation()) {
        dom.startModal.classList.add('hidden');
        dom.rotateOverlay.classList.remove('hidden');
        arModePending = true;
        return;
    }
    await proceedToARFlow();
}

async function proceedToARFlow() {
    dom.rotateOverlay.classList.add('hidden');
    dom.startModal.classList.add('hidden');
    dom.instructionModal.classList.remove('hidden');
    gameState = 'INSTRUCTION';

    dom.startARBtn.disabled = true;
    dom.startARBtn.classList.add('opacity-60', 'pointer-events-none');
    await startCamera();
    dom.startARBtn.disabled = false;
    dom.startARBtn.classList.remove('opacity-60', 'pointer-events-none');
}

function checkPendingARRotation() {
    if (arModePending && isMobileDevice() && !isPortraitOrientation()) {
        arModePending = false;
        proceedToARFlow();
    }
}

dom.startTouchBtn.addEventListener('click', enterTouchMode);
dom.startARBtn.addEventListener('click', enterARMode);
dom.cancelARRotateBtn.addEventListener('click', () => {
    arModePending = false;
    dom.rotateOverlay.classList.add('hidden');
    dom.startModal.classList.remove('hidden');
});

window.addEventListener('resize', () => setTimeout(checkPendingARRotation, 150));
if (window.screen && window.screen.orientation && window.screen.orientation.addEventListener) {
    window.screen.orientation.addEventListener('change', () => setTimeout(checkPendingARRotation, 150));
}
if (window.matchMedia) {
    const landscapeQuery = window.matchMedia('(orientation: landscape)');
    if (landscapeQuery.addEventListener) {
        landscapeQuery.addEventListener('change', () => setTimeout(checkPendingARRotation, 150));
    } else if (landscapeQuery.addListener) {
        landscapeQuery.addListener(() => setTimeout(checkPendingARRotation, 150));
    }
}

/**
 * ============================================================================
 * MODULE: SIMPLE TOAST (ใช้แจ้งเตือนสั้นๆ เช่นตอนกดดูพาสปอร์ต)
 * ============================================================================
 */
let toastTimer = null;
function showToast(msg) {
    if (!dom.arToast) return;
    dom.arToast.innerText = msg;
    dom.arToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.arToast.classList.remove('show'), 2200);
}

if (dom.viewPassportBtn) {
    dom.viewPassportBtn.addEventListener('click', () => {
        showToast('🎁 เปิดพาสปอร์ตสะสมตราประทับของคุณแล้ว!');
    });
}

dom.btnStartGame.addEventListener('click', () => startGame());
dom.restartBtn.addEventListener('click', () => startGame());
dom.playAgainBtn.addEventListener('click', () => { dom.gameOverModal.classList.add('hidden'); startGame(); });
dom.playAgainWinBtn.addEventListener('click', () => { dom.missionCompleteModal.classList.add('hidden'); startGame(); });
document.getElementById('dismissCameraErrorBtn').addEventListener('click', () => { document.getElementById('cameraErrorModal').classList.add('hidden'); });

function startGame() {
    dom.instructionModal.classList.add('hidden');
    dom.gameOverModal.classList.add('hidden');
    dom.missionCompleteModal.classList.add('hidden');

    gameState = 'PLAYING';
    score = 0; level = 1; timeLeft = 45;
    dom.scoreTxt.innerText = score; dom.levelTxt.innerText = level; dom.timeTxt.innerText = timeLeft;
    initLevel();

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        if (isTabHidden || gameState !== 'PLAYING') return;
        timeLeft--; dom.timeTxt.innerText = timeLeft;
        if (timeLeft <= 0) triggerGameOver();
    }, 1000);
}

function triggerGameOver() {
    clearInterval(gameTimer); gameTimer = null;
    gameState = 'GAMEOVER';
    dom.finalScore.innerText = score;
    dom.gameOverModal.classList.remove('hidden');
}

function triggerMissionComplete() {
    clearInterval(gameTimer); gameTimer = null;
    gameState = 'MISSION_COMPLETE';
    dom.winScore.innerText = score;
    dom.missionCompleteModal.classList.remove('hidden');

    triggerCatchEffect(gameCanvas.width * 0.5, gameCanvas.height * 0.5);
    setTimeout(() => triggerCatchEffect(gameCanvas.width * 0.3, gameCanvas.height * 0.4), 300);
    setTimeout(() => triggerCatchEffect(gameCanvas.width * 0.7, gameCanvas.height * 0.3), 600);
}

document.addEventListener('visibilitychange', () => {
    isTabHidden = document.hidden;
    if (!isTabHidden) lastFrameTime = performance.now();
});

resizeCanvas();
init3D();
requestAnimationFrame(gameLoop);