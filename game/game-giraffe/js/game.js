const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', () => {
    if (!isPlaying) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
});

// UI Screen Navigation
function showStartScreen() {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
}

// ============================================================================
// ปุ่ม "ดูพาสปอต" — ยังไม่ได้เชื่อมจริง รอ path/URL ของหน้า Passport (Zoo Passport LIFF)
// ============================================================================
// เมื่อพร้อมเชื่อมจริง ให้เลือกวิธีใดวิธีหนึ่งด้านล่าง (แล้วลบ alert() ทิ้ง):
//
// 1) ถ้าเกมนี้ถูกเปิดอยู่ใน LIFF เดียวกันกับหน้า Passport (mini-app เดียวกัน,
//    ใช้ history/routerภายใน) ให้เปลี่ยนหน้าในแอปแทนการ redirect ทั้งหน้า เช่น
//      window.location.href = '/passport';               // path ภายในแอปเดียวกัน
//
// 2) ถ้า Passport เป็นคนละ LIFF app (คนละ liffId) ให้ redirect ไป LIFF URL ตรง ๆ เช่น
//      window.location.href = 'https://liff.line.me/xxxxxxxx-xxxxxxxx';
//
// 3) ถ้าเกมนี้ถูกฝัง (embed) อยู่ใน iframe ภายใน Zoo Passport app และอยากให้
//    หน้าแม่ (parent) เป็นคนเปลี่ยนหน้าแทน ให้ยิง postMessage ออกไปแทน เช่น
//      window.parent.postMessage({ type: 'NAVIGATE_TO_PASSPORT' }, '*');
//      // แล้วฝั่ง Zoo Passport (parent) ต้อง addEventListener('message', ...) ดักรับเอง
function goToPassport() {
    // Safety net: even though the button is disabled/hidden until the score
    // requirement is met, guard here too in case it's ever triggered another way.
    if (!isPassportUnlocked()) return;

    // TODO: ใส่ลิงก์/route ของหน้า Passport จริงตามวิธีด้านบน แล้วลบบรรทัด alert() นี้ทิ้ง
    
}

// Passport unlocks permanently the first time the player's best score ever
// reaches PASS_SCORE, so it stays unlocked on future visits/runs too.
function isPassportUnlocked() {
    return bestScore >= PASS_SCORE;
}

// Reflects the current unlock state onto the passport button + hint text.
// Called after every finished run so the UI is always in sync with bestScore.
function updatePassportButton() {
    const passportBtn = document.getElementById('passport-btn');
    const passportHint = document.getElementById('passport-lock-hint');
    if (!passportBtn) return;

    const unlocked = isPassportUnlocked();

    passportBtn.disabled = !unlocked;
    passportBtn.setAttribute('aria-disabled', String(!unlocked));
    passportBtn.classList.toggle('locked', !unlocked);

    if (passportHint) {
        passportHint.classList.toggle('hidden', unlocked);
    }

    const lockScoreEl = document.getElementById('passport-lock-score');
    if (lockScoreEl) {
        lockScoreEl.innerText = PASS_SCORE.toLocaleString();
    }
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    // Resize canvas to frame
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    initGame();
}

// --- GAME ENGINE & LOGIC ---
const GAME_DURATION = 60;
const PASS_SCORE = 5000;

let isPlaying = false;
let score = 0;
let heightMeters = 0;
let elapsedTime = 0;
let remainingTime = GAME_DURATION;
let bestScore = Number(localStorage.getItem('giraffe_best_score')) || 0;

// Giraffe state
let head = { x: 0, y: 0, radius: 22 };
let bodyY = 0;
let targetNeckY = 0;
let currentNeckY = 0;

// Height/score is based on the HIGHEST point ever reached this run, not the
// instantaneous neck position -- otherwise pulling the neck down to dodge an
// obstacle would erase height/score the player already earned.
let maxStretchDist = 0;

// Entities
let obstacles = [];
let items = [];
let cameraOffsetY = 0;
let isDragging = false;

function initGame() {
    score = 0;
    heightMeters = 0;
    elapsedTime = 0;
    remainingTime = GAME_DURATION;
    isPlaying = true;
    maxStretchDist = 0;

    bodyY = canvas.height - 80;
    head.x = canvas.width / 2;
    head.y = bodyY - 180;
    targetNeckY = head.y;
    currentNeckY = head.y;
    cameraOffsetY = 0;

    obstacles = [];
    items = [];

    document.getElementById('score-display').innerText = 'คะแนน: 0';
    document.getElementById('timer-display').innerText = `เวลา: ${GAME_DURATION}`;
    document.getElementById('height-display').innerText = '0.0 m';

    // Generate initial world objects
    for (let i = 1; i <= 20; i++) {
        spawnWorldRow(canvas.height - (i * 160));
    }

    // Controls
    canvas.onmousedown = (e) => {
        isDragging = true;
        updateTargetHeight(e);
    };
    canvas.onmousemove = (e) => {
        if (isDragging) updateTargetHeight(e);
    };
    canvas.onmouseup = () => {
        isDragging = false;
    };
    canvas.ontouchstart = (e) => {
        e.preventDefault();
        isDragging = true;
        updateTargetHeight(e);
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        if (isDragging) updateTargetHeight(e);
    };
    canvas.ontouchend = (e) => {
        e.preventDefault();
        isDragging = false;
    };

    gameLoop.lastTime = 0;
    requestAnimationFrame(gameLoop);
}

function updateTargetHeight(e) {
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const relativeY = clientY - rect.top;

    // Dragging upward extends the head higher
    targetNeckY = relativeY - cameraOffsetY;
    if (targetNeckY > bodyY - 60) targetNeckY = bodyY - 60;
}

function spawnWorldRow(worldY) {
    const rand = Math.random();

    if (worldY > canvas.height - 240) {
        return;
    }

    // Spawn Branch / Obstacle
    if (rand < 0.6) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const baseX = side === 'left' ? 20 : canvas.width - 160;
        const branch = {
            type: 'branch',
            x: baseX,
            y: worldY - 210,
            width: 140,
            height: 24,
            side: side,
            baseX: baseX,
            range: 40 + Math.random() * 35,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 0.8
        };
        obstacles.push(branch);

        // Add Beehive near branch
        if (Math.random() < 0.4) {
            obstacles.push({
                type: 'beehive',
                x: branch.x + 80,
                y: worldY - 185,
                radius: 16,
                anchorBranch: branch,
                offsetX: 80
            });
        }
    }

    // Spawn Collectibles
    if (Math.random() < 0.7) {
        items.push({
            type: Math.random() < 0.25 ? 'star' : 'leaf',
            x: 50 + Math.random() * (canvas.width - 100),
            y: worldY - 40,
            collected: false
        });
    }
}

function gameLoop(now) {
    if (!isPlaying) return;

    if (!gameLoop.lastTime) gameLoop.lastTime = now;
    const deltaSeconds = Math.min((now - gameLoop.lastTime) / 1000, 0.05);
    gameLoop.lastTime = now;

    elapsedTime += deltaSeconds;
    remainingTime = Math.max(0, GAME_DURATION - elapsedTime);
    document.getElementById('timer-display').innerText = `เวลา: ${Math.ceil(remainingTime)}`;

    if (remainingTime <= 0) {
        finishGame();
        return;
    }

    update(deltaSeconds);
    render();

    requestAnimationFrame(gameLoop);
}

function update(deltaSeconds) {
    obstacles.forEach(obs => {
        if (obs.type === 'branch') {
            const move = Math.sin(elapsedTime * obs.speed + obs.phase) * obs.range;
            obs.x = obs.side === 'left'
                ? Math.max(20, obs.baseX + move)
                : Math.min(canvas.width - obs.width - 20, obs.baseX + move);
        }

        if (obs.type === 'beehive' && obs.anchorBranch) {
            obs.x = obs.anchorBranch.x + obs.offsetX;
        }
    });

    // Smoothly move neck towards target
    currentNeckY += (targetNeckY - currentNeckY) * 0.1;
    head.y = currentNeckY;

    // Calculate stretch distance & track the best height ever reached this run.
    // Using the max (rather than the live value) means dodging by pulling the
    // neck down never costs the player height/score they already earned.
    const stretchDist = Math.max(0, (bodyY - 60) - head.y);
    if (stretchDist > maxStretchDist) maxStretchDist = stretchDist;
    heightMeters = (maxStretchDist / 50).toFixed(1);

    // Update score (live display uses the same numbers finishGame() will use)
    const heightScore = Math.floor(maxStretchDist);
    document.getElementById('height-display').innerText = `${heightMeters} m`;
    document.getElementById('score-display').innerText = `คะแนน: ${score + heightScore}`;

    // Dynamic Camera scrolling
    if (head.y + cameraOffsetY < canvas.height * 0.35) {
        cameraOffsetY = (canvas.height * 0.35) - head.y;
    }

    // Spawn new objects above
    const topWorldY = -cameraOffsetY;
    const lastObject = obstacles[obstacles.length - 1];
    if (!lastObject || lastObject.y > topWorldY - 200) {
        spawnWorldRow(topWorldY - 160);
    }

    // Collision Check
    checkCollisions();
}

function checkCollisions() {
    // NOTE: head.y is a world-space coordinate (it is NOT offset by cameraOffsetY).
    // obs.y / item.y are also world-space. render() applies the SAME
    // ctx.translate(0, cameraOffsetY) to the giraffe and to every obstacle/item,
    // so their positions relative to each other on screen are identical to their
    // positions in world space. Collision checks must therefore compare
    // world-space to world-space (head.y vs obs.y / item.y) WITHOUT re-adding
    // cameraOffsetY -- adding it only to one side is what caused the neck to
    // visually miss a branch yet still trigger game over.

    // Check items collection
    items.forEach(item => {
        if (!item.collected) {
            const dx = head.x - item.x;
            const dy = head.y - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < head.radius + 15) {
                item.collected = true;
                score += (item.type === 'star') ? 300 : 100;
            }
        }
    });

    // Check obstacle collision
    obstacles.forEach(obs => {
        if (obs.type === 'branch') {
            if (head.x + head.radius > obs.x &&
                head.x - head.radius < obs.x + obs.width &&
                head.y + head.radius > obs.y &&
                head.y - head.radius < obs.y + obs.height) {
                triggerGameOver();
            }
        } else if (obs.type === 'beehive') {
            const dx = head.x - obs.x;
            const dy = head.y - obs.y;
            if (Math.sqrt(dx * dx + dy * dy) < head.radius + obs.radius) {
                triggerGameOver();
            }
        }
    });
}

function triggerGameOver() {
    finishGame();
}

function finishGame() {
    if (!isPlaying) return;

    isPlaying = false;
    const totalScore = score + Math.floor(maxStretchDist);
    const passed = totalScore >= PASS_SCORE;

    localStorage.setItem('giraffe_latest_score', totalScore);

    if (totalScore > bestScore) {
        bestScore = totalScore;
        localStorage.setItem('giraffe_best_score', bestScore);
    }

    document.getElementById('final-height').innerText = `${heightMeters} m`;
    document.getElementById('final-score').innerText = totalScore.toLocaleString();
    document.getElementById('best-score').innerText = bestScore.toLocaleString();
    document.getElementById('final-status').innerText = passed ? 'ผ่าน!' : 'ไม่ผ่าน';
    document.getElementById('final-status').style.color = passed ? 'var(--green-leaf)' : '#d32f2f';

    // Header of the result screen: only call it "GAME OVER" on a real loss.
    // A win (time ran out OR hit an obstacle, but score >= PASS_SCORE) shows
    // "MISSION COMPLETE" instead, since "GAME OVER" reads as a failure state.
    const resultTitleEl = document.getElementById('result-title');
    resultTitleEl.innerText = passed ? 'MISSION COMPLETE' : 'GAME OVER';
    resultTitleEl.style.color = passed ? 'var(--green-leaf)' : '#d32f2f';

    // Victory decoration (badge/mascot/confetti) only shows on a win.
    const victoryDecor = document.getElementById('victory-decor');
    if (victoryDecor) {
        victoryDecor.classList.toggle('hidden', !passed);
    }

    // Passport unlock is based on bestScore (updated above), so once the
    // player has ever reached PASS_SCORE the button stays unlocked for good.
    updatePassportButton();

    document.getElementById('gameover-screen').classList.remove('hidden');
}

// --- RENDER FUNCTIONS ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(0, cameraOffsetY);

    // 1. Draw Obstacles
    obstacles.forEach(obs => {
        if (obs.type === 'branch') {
            drawBranch(obs);
        } else if (obs.type === 'beehive') {
            drawBeehive(obs);
        }
    });

    // 2. Draw Collectibles
    items.forEach(item => {
        if (!item.collected) {
            if (item.type === 'star') {
                ctx.font = '24px sans-serif';
                ctx.fillText('⭐', item.x - 12, item.y + 8);
            } else {
                ctx.font = '24px sans-serif';
                ctx.fillText('🍃', item.x - 12, item.y + 8);
            }
        }
    });

    
    // 3. Draw Giraffe
    drawGiraffe();

    ctx.restore();
}

/**
 * Redesigned branch: rounded wood socket where it meets the screen edge,
 * a wood-grain gradient with grain lines for a rounded 3D log look, a soft
 * drop shadow for depth, and a fuller two-tone leaf cluster at the tip
 * (plus a couple of small accent leaves along the branch) instead of a
 * single flat green circle.
 */
function drawBranch(obs) {
    const isLeft = obs.side === 'left';
    const tipX = isLeft ? obs.x + obs.width : obs.x;

    ctx.save();

    // Soft shadow beneath the branch for depth
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y + obs.height - 3, obs.width, obs.height, 12);
    ctx.fill();

    // Wood body with a top-to-bottom gradient (light on top, darker below)
    const woodGrad = ctx.createLinearGradient(0, obs.y, 0, obs.y + obs.height);
    woodGrad.addColorStop(0, '#a3703f');
    woodGrad.addColorStop(0.5, '#8a5730');
    woodGrad.addColorStop(1, '#6b3f22');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 12);
    ctx.fill();

    // Darker outline for definition
    ctx.strokeStyle = '#4a2c17';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 12);
    ctx.stroke();

    // Wood-grain texture lines
    ctx.strokeStyle = 'rgba(74, 44, 23, 0.35)';
    ctx.lineWidth = 1.5;
    for (let gx = obs.x + 14; gx < obs.x + obs.width - 10; gx += 22) {
        ctx.beginPath();
        ctx.moveTo(gx, obs.y + 4);
        ctx.quadraticCurveTo(gx + 6, obs.y + obs.height / 2, gx, obs.y + obs.height - 4);
        ctx.stroke();
    }

    // Rounded socket where the branch meets the screen edge (grows "from the tree")
    const socketX = isLeft ? obs.x - 6 : obs.x + obs.width - 18;
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.roundRect(socketX, obs.y - 3, 24, obs.height + 6, 10);
    ctx.fill();

    ctx.restore();

    // Leaf cluster at the outer tip -- layered two-tone circles for volume
    drawLeafCluster(tipX, obs.y + obs.height / 2, 1.0);

    // A couple of small accent leaves along the branch
    const midX = isLeft ? obs.x + obs.width * 0.45 : obs.x + obs.width * 0.55;
    drawLeafCluster(midX, obs.y - 6, 0.55);
}

function drawLeafCluster(cx, cy, scale) {
    const r = 16 * scale;
    ctx.save();

    // Back leaves (darker green) for depth
    ctx.fillStyle = '#3f7d00';
    ctx.beginPath();
    ctx.arc(cx - r * 0.5, cy - r * 0.35, r * 0.85, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.55, cy - r * 0.15, r * 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Front leaves (bright green)
    ctx.fillStyle = '#7cd922';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.6, cy + r * 0.3, r * 0.65, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.5, cy + r * 0.35, r * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Highlight for a glossy, friendly look
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

/**
 * Beehive with subtle banding and tiny bee dots so it reads clearly as a
 * hazard distinct from the leaf clusters.
 */
function drawBeehive(obs) {
    ctx.save();

    // Soft shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(obs.x, obs.y + obs.radius * 0.9, obs.radius * 0.8, obs.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    const hiveGrad = ctx.createRadialGradient(
        obs.x - obs.radius * 0.3, obs.y - obs.radius * 0.3, 2,
        obs.x, obs.y, obs.radius
    );
    hiveGrad.addColorStop(0, '#ffd166');
    hiveGrad.addColorStop(1, '#ffa000');
    ctx.fillStyle = hiveGrad;
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#a15c00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Horizontal hive bands
    ctx.strokeStyle = 'rgba(161, 92, 0, 0.5)';
    ctx.lineWidth = 1;
    [-0.4, 0, 0.4].forEach(f => {
        ctx.beginPath();
        ctx.moveTo(obs.x - obs.radius * 0.85, obs.y + obs.radius * f);
        ctx.lineTo(obs.x + obs.radius * 0.85, obs.y + obs.radius * f);
        ctx.stroke();
    });

    // Entrance hole
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y + 4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// ============================================================================
// GIRAFFE MODEL — วิธีนำ "โมเดล" (ภาพของคุณเอง) มาใส่แทนภาพวาด Canvas
// ============================================================================
// ค่าเริ่มต้นเกมจะวาดยีราฟด้วย Canvas (procedural art) ให้สวยขึ้นแล้วด้านล่าง
// แต่ถ้าอยากใช้ "ภาพจริง" ของคุณเอง (เช่น รูปวาด/ภาพที่สร้างจาก AI) ทำตามนี้:
//
// 1. เตรียมไฟล์ PNG พื้นหลังโปร่งใส (transparent background) 3 ไฟล์:
//      - head : ใบหน้ายีราฟมองตรง ๆ    แนะนำสัดส่วนสี่เหลี่ยมจัตุรัส เช่น 200x200px
//      - body : ลำตัวยีราฟ              แนะนำแนวนอน เช่น 220x160px
//      - neck : ลายผิวคอ 1 แถบแนวตั้ง    แนะนำแถบสูง เช่น 60x300px
//        (ภาพ neck จะถูก "ยืด" ตามความยาวคอที่ผู้เล่นดึงขึ้น จึงควรเป็นลายที่ยืดแล้วไม่แปลก เช่น ลายจุด/ลายเรียบ)
// 2. วางไฟล์ไว้โฟลเดอร์เดียวกับ index.html เช่น ตั้งชื่อ giraffe-head.png, giraffe-body.png, giraffe-neck.png
// 3. ใส่ path ลงในค่าคงที่ GIRAFFE_ASSETS ด้านล่าง เช่น head: 'giraffe-head.png'
//
// เกมจะพยายามโหลดภาพให้อัตโนมัติ — ถ้าโหลดสำเร็จจะใช้ภาพของคุณทันที
// ถ้าไม่ใส่ path (เว้นว่างไว้) หรือโหลดไฟล์ไม่เจอ เกมจะ "ไม่พัง" แต่จะสลับไปใช้
// ภาพวาด Canvas สำรอง (procedural) ที่ปรับปรุงให้สวยขึ้นแล้วโดยอัตโนมัติ
// ============================================================================
// --- GIRAFFE IMAGE ASSETS (2D fallback) ---


const giraffeImages = { head: null, body: null, neck: null };
Object.keys(GIRAFFE_ASSETS).forEach(key => {
    const path = GIRAFFE_ASSETS[key];
    if (!path) return;
    const img = new Image();
    img.onload = () => { giraffeImages[key] = img; };
    img.onerror = () => {
        console.warn(`โหลดภาพยีราฟส่วน "${key}" ไม่สำเร็จ (${path}) — จะใช้ภาพวาดสำรอง (Canvas) แทน`);
    };
    img.src = path;
});

// --- 3D MODEL LOADER (ใช้ demo_model ถ้ามี) ---
// ถ้าโฟลเดอร์ ../demo_model/models/scene.gltf อยู่ จะพยายามโหลดโมเดล 3D
let threeOverlay = null; // { renderer, scene, camera, model, width, height }
(function tryLoad3DModel() {
    const modelPath = '../demo_model/models/scene.gltf';

    // Load three.js and GLTFLoader dynamically (CDN)
    const scriptThree = document.createElement('script');
    scriptThree.src = 'https://unpkg.com/three@0.161.0/build/three.min.js';
    scriptThree.onload = () => {
        const scriptLoader = document.createElement('script');
        scriptLoader.src = 'https://unpkg.com/three@0.161.0/examples/js/loaders/GLTFLoader.js';
        scriptLoader.onload = () => {
            // Create overlay renderer inside #game-screen immediately (don't depend on fetch HEAD)
            const container = document.getElementById('game-screen');
            if (!container) return;

            const THREE = window.THREE;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setPixelRatio(window.devicePixelRatio || 1);
            renderer.setSize(150, 200);
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.pointerEvents = 'none';
            renderer.domElement.style.zIndex = '6';
            renderer.domElement.style.left = '0px';
            renderer.domElement.style.top = '0px';
            container.appendChild(renderer.domElement);

            // Light
            const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
            scene.add(hemi);
            const dir = new THREE.DirectionalLight(0xffffff, 0.6);
            dir.position.set(3, 10, 10);
            scene.add(dir);

            // Load model (attempt directly; will fail under file:// but works when served via HTTP)
            const loader = new THREE.GLTFLoader();
            loader.load(modelPath, gltf => {
                const model = gltf.scene || gltf.scenes[0];
                scene.add(model);

                // Compute bounding box & scale to sensible size
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.0 / maxDim * 1.2; // fit into view
                model.scale.setScalar(scale);

                // Center
                box.setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                camera.position.set(0, 0, Math.max(1.5, 1.5));
                camera.lookAt(0, 0, 0);

                threeOverlay = { renderer, scene, camera, model, width: 150, height: 200 };

                console.log('3D giraffe model loaded from', modelPath);
            }, undefined, err => {
                console.warn('โหลดโมเดล 3D ล้มเหลว:', err);
                // remove renderer element to avoid overlay leftover
                try { renderer.domElement.remove(); } catch (e) { }
            });

            // Resize handler
            window.addEventListener('resize', () => {
                if (!threeOverlay) return;
                // keep same pixel size for now
            });
        };
        scriptLoader.onerror = () => { console.warn('ไม่สามารถโหลด GLTFLoader จาก CDN ได้'); };
        document.head.appendChild(scriptLoader);
    };
    scriptThree.onerror = () => { console.warn('ไม่สามารถโหลด three.js จาก CDN ได้'); };
    document.head.appendChild(scriptThree);
})();

// Helper: render 3D overlay at given screen coords (screenX, screenY in pixels relative to #game-screen)
function render3DAt(screenX, screenY, scale = 1.0) {
    if (!threeOverlay) return false;
    const { renderer, scene, camera, model } = threeOverlay;
    const w = Math.round(150 * scale);
    const h = Math.round(200 * scale);
    if (renderer.domElement.width !== w || renderer.domElement.height !== h) {
        renderer.setSize(w, h);
        threeOverlay.width = w; threeOverlay.height = h;
    }
    // Position renderer DOM element so its center matches (screenX, screenY)
    const container = document.getElementById('game-screen');
    const rect = container.getBoundingClientRect();
    const left = Math.round(screenX - w / 2);
    const top = Math.round(screenY - h / 2);
    renderer.domElement.style.left = `${left}px`;
    renderer.domElement.style.top = `${top}px`;

    // small gentle animation (head look) — optional
    if (model) model.rotation.y += 0.01;

    renderer.render(scene, camera);
    return true;
}

// Modify drawGiraffe to use 3D overlay when available: (will still fallback to 2D canvas)
const _orig_drawGiraffe = drawGiraffe;
function drawGiraffe() {
    const bodyX = canvas.width / 2;
    const neckTop = head.y;
    const neckBottom = bodyY;

    // Compute screen coords for head/body relative to #game-screen
    const container = document.getElementById('game-screen');
    const rect = container.getBoundingClientRect();
    const screenHeadY = head.y + cameraOffsetY; // world -> screen
    const screenBodyY = bodyY + cameraOffsetY;
    const screenHeadX = bodyX; // canvas and container align

    if (threeOverlay) {
        // render 3D model centered near head; scale by neck length
        const neckLength = Math.max(1, neckBottom - neckTop);
        const scale = Math.min(2.2, 0.8 + neckLength / 160);
        const used = render3DAt(screenHeadX, screenHeadY, scale);
        if (used) return; // rendered by 3D
    }

    // fallback to original 2D drawing
    _orig_drawGiraffe();
}

// Deterministic "noise" (no external libs needed) so patch shapes look organic
// but never flicker between frames -- same input position always gives the same result.
function hashNoise(x, y) {
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return v - Math.floor(v); // 0..1
}

/**
 * Draws one organic reticulated-giraffe patch (a soft irregular blob with a
 * darker outline ring) instead of a plain ellipse, for a more realistic coat.
 */
function drawCoatPatch(cx, cy, baseSize) {
    const n1 = hashNoise(cx * 0.5, cy * 0.5);
    const n2 = hashNoise(cy * 0.5, cx * 0.5);
    const rot = n1 * Math.PI;
    const squish = 0.65 + n2 * 0.45;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Darker outline for the patch (reticulated pattern edge)
    ctx.fillStyle = '#9c5a1c';
    ctx.beginPath();
    ctx.ellipse(0, 0, baseSize * 1.12, baseSize * squish * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main patch blob made of 3 overlapping ellipses for an irregular edge
    ctx.fillStyle = '#d9822b';
    ctx.beginPath();
    ctx.ellipse(0, 0, baseSize, baseSize * squish, 0, 0, Math.PI * 2);
    ctx.ellipse(baseSize * 0.3, baseSize * 0.2 * squish, baseSize * 0.6, baseSize * squish * 0.6, 0, 0, Math.PI * 2);
    ctx.ellipse(-baseSize * 0.3, -baseSize * 0.18 * squish, baseSize * 0.55, baseSize * squish * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawGiraffe() {
    const bodyX = canvas.width / 2;
    drawGiraffeBody(bodyX);
    drawGiraffeNeck(bodyX);
    drawGiraffeHead();
}

function drawGiraffeBody(bodyX) {
    const cy = bodyY + 22;

    if (giraffeImages.body) {
        const w = 130, h = 95;
        ctx.drawImage(giraffeImages.body, bodyX - w / 2, cy - h / 2, w, h);
        return;
    }

    // Soft ground shadow for depth
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(bodyX, cy + 26, 46, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hint of front legs peeking from under the body
    ctx.fillStyle = '#e8ac2c';
    ctx.beginPath();
    ctx.roundRect(bodyX - 34, cy + 6, 14, 34, 6);
    ctx.roundRect(bodyX + 20, cy + 6, 14, 34, 6);
    ctx.fill();
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.roundRect(bodyX - 34, cy + 32, 14, 8, 3);
    ctx.roundRect(bodyX + 20, cy + 32, 14, 8, 3);
    ctx.fill();

    // Body base with radial shading for volume (light upper-left, warm shadow lower-right)
    const bodyGrad = ctx.createRadialGradient(
        bodyX - 18, cy - 14, 6,
        bodyX, cy, 60
    );
    bodyGrad.addColorStop(0, '#ffdb6b');
    bodyGrad.addColorStop(0.6, '#f8c134');
    bodyGrad.addColorStop(1, '#e0a41f');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(bodyX, cy, 48, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c98a1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cream underbelly
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(bodyX, cy + 16, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reticulated coat patches scattered over the body
    [
        [-26, -10, 11], [0, -16, 12], [24, -8, 10],
        [-14, 6, 9], [14, 8, 9]
    ].forEach(([dx, dy, size]) => drawCoatPatch(bodyX + dx, cy + dy, size));

    // Small tail with a dark tuft
    ctx.strokeStyle = '#e0a41f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bodyX + 44, cy - 6);
    ctx.quadraticCurveTo(bodyX + 60, cy + 14, bodyX + 52, cy + 34);
    ctx.stroke();
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.ellipse(bodyX + 52, cy + 38, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawGiraffeNeck(bodyX) {
    const neckTop = head.y;
    const neckBottom = bodyY;
    const neckLength = Math.max(1, neckBottom - neckTop);
    const topWidth = 22;
    const bottomWidth = 34;

    if (giraffeImages.neck) {
        const w = (topWidth + bottomWidth) / 2;
        ctx.drawImage(giraffeImages.neck, bodyX - w / 2, neckTop, w, neckLength);
        return;
    }

    // Tapered trapezoid body for the neck (wider at the shoulders, narrower near the head)
    // shaded with a horizontal gradient for a rounded, cylindrical look.
    const neckGrad = ctx.createLinearGradient(bodyX - bottomWidth / 2, 0, bodyX + bottomWidth / 2, 0);
    neckGrad.addColorStop(0, '#e0a41f');
    neckGrad.addColorStop(0.35, '#ffdb6b');
    neckGrad.addColorStop(0.65, '#f8c134');
    neckGrad.addColorStop(1, '#d9922a');

    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.moveTo(bodyX - topWidth / 2, neckTop);
    ctx.lineTo(bodyX + topWidth / 2, neckTop);
    ctx.lineTo(bodyX + bottomWidth / 2, neckBottom);
    ctx.lineTo(bodyX - bottomWidth / 2, neckBottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c98a1a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mane: small dark tufts running down the back edge of the neck
    ctx.fillStyle = '#7a4a1e';
    for (let y = neckTop + 6; y < neckBottom - 6; y += 14) {
        const t = (y - neckTop) / neckLength;
        const w = topWidth + (bottomWidth - topWidth) * t;
        ctx.beginPath();
        ctx.moveTo(bodyX - w / 2 - 1, y);
        ctx.lineTo(bodyX - w / 2 - 7, y + 6);
        ctx.lineTo(bodyX - w / 2 - 1, y + 11);
        ctx.closePath();
        ctx.fill();
    }

    // Reticulated coat patches along the neck (position/size vary organically but stay stable)
    for (let y = neckTop + 22; y < neckBottom - 16; y += 32) {
        const t = (y - neckTop) / neckLength;
        const w = topWidth + (bottomWidth - topWidth) * t;
        const jitter = (hashNoise(y, bodyX) - 0.5) * (w * 0.5);
        const size = 8 + hashNoise(bodyX, y) * 4;
        drawCoatPatch(bodyX + jitter, y, size);
    }
}

function drawGiraffeHead() {
    if (giraffeImages.head) {
        const size = 76;
        ctx.drawImage(giraffeImages.head, head.x - size / 2, head.y - size / 2, size, size);
        return;
    }

    // Ears (drawn first so the head/horns layer on top of their inner edge)
    ctx.fillStyle = '#e8ac2c';
    [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(head.x + side * 20, head.y - 12);
        ctx.rotate(side * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f3c78a';
        ctx.beginPath();
        ctx.ellipse(0, 1, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8ac2c';
        ctx.restore();
    });

    // Ossicones (horns) with furry brown tips
    [-8, 8].forEach(dx => {
        ctx.fillStyle = '#e8ac2c';
        ctx.beginPath();
        ctx.roundRect(head.x + dx - 2.5, head.y - 34, 5, 14, 2.5);
        ctx.fill();
        ctx.fillStyle = '#7a4a1e';
        ctx.beginPath();
        ctx.arc(head.x + dx, head.y - 34, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Skull/cranium with soft radial shading for volume
    const headGrad = ctx.createRadialGradient(
        head.x - 7, head.y - 7, 3,
        head.x, head.y, head.radius + 4
    );
    headGrad.addColorStop(0, '#ffdb6b');
    headGrad.addColorStop(1, '#f0b428');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c98a1a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // A couple of small face patches for coat continuity
    drawCoatPatch(head.x - 12, head.y - 8, 5);
    drawCoatPatch(head.x + 13, head.y - 6, 5);

    // Muzzle / snout (lighter cream, elongated toward the front)
    ctx.fillStyle = '#f6d2ab';
    ctx.beginPath();
    ctx.ellipse(head.x, head.y + 11, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a877';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Nostrils
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.ellipse(head.x - 5, head.y + 11, 1.6, 2.4, 0.3, 0, Math.PI * 2);
    ctx.ellipse(head.x + 5, head.y + 11, 1.6, 2.4, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth line
    ctx.strokeStyle = '#8a5a34';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(head.x, head.y + 15, 6, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();

    // Eyes with a glossy highlight + tiny eyelash for a cuter, more expressive look
    [-8, 8].forEach(dx => {
        ctx.fillStyle = '#3e1e0a';
        ctx.beginPath();
        ctx.ellipse(head.x + dx, head.y - 3, 3.4, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(head.x + dx - 1, head.y - 4.5, 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3e1e0a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(head.x + dx + (dx > 0 ? 3 : -3), head.y - 6);
        ctx.lineTo(head.x + dx + (dx > 0 ? 6 : -6), head.y - 8);
        ctx.stroke();
    });
}

// Sync the passport button's lock state on initial load too, in case the
// player already unlocked it in a previous session (bestScore persists
// via localStorage).
updatePassportButton();