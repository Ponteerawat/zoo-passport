// --- AUDIO SYNTHESIZER SYSTEM ---
const AudioFX = {
    ctx: null,
    bgmInterval: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playEatSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },
    playJumpSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    },
    playHitSound() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },
    playWinSound() {
        if (!this.ctx) return;
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.1);
            osc.stop(this.ctx.currentTime + idx * 0.1 + 0.25);
        });
    },
    startBGM() {
        this.stopBGM();
        if (!this.ctx) return;
        const melody = [261, 293, 329, 349, 392, 349, 329, 293];
        let step = 0;
        this.bgmInterval = setInterval(() => {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = melody[step % melody.length];
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.18);
            step++;
        }, 200);
    },
    stopBGM() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
    }
};

const container = document.getElementById('game-container');

// --- 1. SET UP SCENE & CAMERA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x70d6ff);
scene.fog = new THREE.FogExp2(0x70d6ff, 0.008);

const getContainerAspect = () => container.clientWidth / container.clientHeight;

const camera = new THREE.PerspectiveCamera(38, getContainerAspect(), 0.1, 1000);
camera.position.set(0, 5.5, 12);
camera.lookAt(0, 1.2, -10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff5cc, 0.85);
sunLight.position.set(25, 45, 15);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// --- 3. ENVIRONMENT & DECORATIONS ---
const laneWidth = 2.8;

const grassGeo = new THREE.PlaneGeometry(160, 300);
const grassMat = new THREE.MeshLambertMaterial({ color: 0x88d49e });
const grass = new THREE.Mesh(grassGeo, grassMat);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

const roadGeo = new THREE.PlaneGeometry(laneWidth * 3, 300);
const roadMat = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
road.receiveShadow = true;
scene.add(road);

// เมฆ 3D
const clouds = [];
function create3DCloud(x, y, z) {
    const cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });

    const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2, 1), cloudMat);
    const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), cloudMat); p2.position.set(-1.8, -0.2, 0);
    const p3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 1), cloudMat); p3.position.set(1.8, -0.1, 0.2);
    const p4 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), cloudMat); p4.position.set(0, 0.8, -0.2);

    cloudGroup.add(p1, p2, p3, p4);
    cloudGroup.position.set(x, y, z);
    scene.add(cloudGroup);
    clouds.push(cloudGroup);
}

create3DCloud(-20, 16, -30);
create3DCloud(22, 18, -60);
create3DCloud(-15, 15, -90);
create3DCloud(18, 17, -120);

function createMountain(x, z, radius, height, color) {
    const geo = new THREE.ConeGeometry(radius, height, 7);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const mountain = new THREE.Mesh(geo, mat);
    mountain.position.set(x, height / 2, z);
    scene.add(mountain);
}
createMountain(-45, -120, 25, 30, 0x2a9d8f);
createMountain(40, -130, 30, 35, 0x264653);
createMountain(-15, -140, 20, 25, 0xe76f51);

const sceneryObjects = [];

function createBaobabTree(x, z) {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 4.8, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7f5539 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.4;
    trunk.castShadow = trunk.receiveShadow = true;
    tree.add(trunk);

    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x38b000 });
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 1.2, 1.2, 8), leavesMat); l1.position.y = 4.8;
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 0.8, 1.0, 8), leavesMat); l2.position.y = 5.6;
    l1.castShadow = l2.castShadow = true;
    tree.add(l1, l2);

    tree.position.set(x, 0, z);
    scene.add(tree);
    sceneryObjects.push(tree);
}

function createAcaciaTree(x, z) {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.7, 4, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e473b });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2;
    trunk.castShadow = trunk.receiveShadow = true;
    tree.add(trunk);

    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x55a630 });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 0.5, 0.6, 8), leavesMat);
    crown.position.y = 4.2;
    crown.castShadow = true;
    tree.add(crown);

    tree.position.set(x, 0, z);
    scene.add(tree);
    sceneryObjects.push(tree);
}

function createBush(x, z) {
    const bushGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x2b9348 });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(x, 0.7, z);
    bush.castShadow = true;
    scene.add(bush);
    sceneryObjects.push(bush);
}

for (let z = 10; z > -190; z -= 10) {
    if (Math.random() < 0.5) {
        createBaobabTree(-7.5 - Math.random() * 2, z);
        createAcaciaTree(7.5 + Math.random() * 2, z);
    } else {
        createAcaciaTree(-7.5 - Math.random() * 2, z);
        createBaobabTree(7.5 + Math.random() * 2, z);
    }
    createBush(-5.5 - Math.random() * 2, z + 5);
    createBush(5.5 + Math.random() * 2, z + 5);
}

// --- 4. MODEL LION ---
const lionGroup = new THREE.Group();

const skinMat = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
const maneMat = new THREE.MeshLambertMaterial({ color: 0xe76f51 });

const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), skinMat);
body.scale.set(0.95, 0.85, 1.25);
body.position.set(0, 0.7, 0);
body.castShadow = true;
lionGroup.add(body);

const maneGeo = new THREE.TorusGeometry(0.8, 0.42, 12, 18);
const mane = new THREE.Mesh(maneGeo, maneMat);
mane.position.set(0, 1.15, -0.4);
mane.castShadow = true;
lionGroup.add(mane);

const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), skinMat);
head.position.set(0, 1.15, -0.5);
head.castShadow = true;
lionGroup.add(head);

const earGeo = new THREE.SphereGeometry(0.2, 8, 8);
const leftEar = new THREE.Mesh(earGeo, skinMat); leftEar.position.set(-0.55, 1.7, -0.4);
const rightEar = new THREE.Mesh(earGeo, skinMat); rightEar.position.set(0.55, 1.7, -0.4);
lionGroup.add(leftEar, rightEar);

const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.5, 12);
const legFL = new THREE.Mesh(legGeo, skinMat); legFL.position.set(-0.4, 0.25, -0.5);
const legFR = new THREE.Mesh(legGeo, skinMat); legFR.position.set(0.4, 0.25, -0.5);
const legBL = new THREE.Mesh(legGeo, skinMat); legBL.position.set(-0.4, 0.25, 0.3);
const legBR = new THREE.Mesh(legGeo, skinMat); legBR.position.set(0.4, 0.25, 0.3);

legFL.castShadow = legFR.castShadow = legBL.castShadow = legBR.castShadow = true;
lionGroup.add(legFL, legFR, legBL, legBR);

const tailGroup = new THREE.Group();
const tailStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), skinMat);
tailStem.position.set(0, 0.3, 0.3);
tailStem.rotation.x = Math.PI / 4;

const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), maneMat);
tailTip.position.set(0, 0.6, 0.6);

tailGroup.add(tailStem, tailTip);
tailGroup.position.set(0, 0.6, 0.5);
lionGroup.add(tailGroup);

lionGroup.position.z = 0;
scene.add(lionGroup);

// --- 5. GAME LOGIC & JUMP PHYSICS ---
let gameStarted = false;
let isGameOver = false;
let meatCollected = 0;
let timeLeft = 30;
let timerInterval = null;

const gameSpeed = 0.38;
let currentLane = 0;
let objects = [];
let spawnTimer = 0;

let lionY = 0;
let velocityY = 0;
const gravity = -0.018;
const jumpPower = 0.25;
let isGrounded = true;

function createMeatMesh() {
    const meatGroup = new THREE.Group();

    const meatGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12);
    const meatMat = new THREE.MeshLambertMaterial({ color: 0xb5179e });
    const meat = new THREE.Mesh(meatGeo, meatMat);
    meat.scale.set(1, 1, 1.3);
    meat.rotation.x = Math.PI / 3;
    meat.position.y = 0.6;
    meat.castShadow = true;
    meatGroup.add(meat);

    const boneGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
    const boneMat = new THREE.MeshLambertMaterial({ color: 0xf8f9fa });
    const bone = new THREE.Mesh(boneGeo, boneMat);
    bone.rotation.x = Math.PI / 3;
    bone.position.set(0, 0.6, 0);
    meatGroup.add(bone);

    return meatGroup;
}

function createDangerousRock() {
    const rockGroup = new THREE.Group();

    const baseGeo = new THREE.DodecahedronGeometry(0.75, 1);
    const darkRockMat = new THREE.MeshLambertMaterial({ color: 0x4a4e69 });
    const baseRock = new THREE.Mesh(baseGeo, darkRockMat);
    baseRock.position.y = 0.5;
    baseRock.scale.set(1.2, 0.8, 1.2);
    baseRock.castShadow = true;
    rockGroup.add(baseRock);

    const spikeGeo = new THREE.ConeGeometry(0.35, 1.2, 5);
    const spikeMat = new THREE.MeshLambertMaterial({ color: 0x22223b });

    const spike1 = new THREE.Mesh(spikeGeo, spikeMat); spike1.position.set(0, 0.9, 0); spike1.castShadow = true;
    const spike2 = new THREE.Mesh(spikeGeo, spikeMat); spike2.position.set(-0.3, 0.7, 0.2); spike2.rotation.z = 0.3; spike2.castShadow = true;
    const spike3 = new THREE.Mesh(spikeGeo, spikeMat); spike3.position.set(0.3, 0.7, -0.2); spike3.rotation.z = -0.3; spike3.castShadow = true;

    rockGroup.add(spike1, spike2, spike3);

    return rockGroup;
}

function spawnObject() {
    const laneIndex = Math.floor(Math.random() * 3) - 1;
    const isMeat = Math.random() < 0.72;

    const objGroup = new THREE.Group();

    if (isMeat) {
        const meat = createMeatMesh();
        objGroup.add(meat);
        objGroup.userData = { type: 'meat', lane: laneIndex };
    } else {
        const rock = createDangerousRock();
        objGroup.add(rock);
        objGroup.userData = { type: 'rock', lane: laneIndex };
    }

    objGroup.position.set(laneIndex * laneWidth, 0, -60);
    scene.add(objGroup);
    objects.push(objGroup);
}

// --- 6. CONTROLS ---
function moveLeft() { if (gameStarted && !isGameOver && currentLane > -1) currentLane--; }
function moveRight() { if (gameStarted && !isGameOver && currentLane < 1) currentLane++; }
function jump() {
    if (gameStarted && !isGameOver && isGrounded) {
        velocityY = jumpPower;
        isGrounded = false;
        AudioFX.playJumpSound();
    }
}

document.getElementById('btn-left').addEventListener('click', moveLeft);
document.getElementById('btn-right').addEventListener('click', moveRight);
document.getElementById('btn-jump').addEventListener('click', jump);

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') moveLeft();
    if (key === 'arrowright' || key === 'd') moveRight();
    if (key === 'arrowup' || key === 'w' || key === ' ') {
        e.preventDefault();
        jump();
    }
});

window.addEventListener('resize', () => {
    camera.aspect = getContainerAspect();
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// --- 7. GAME LOOP & ANIMATION ---
let animTime = 0;

function animate() {
    requestAnimationFrame(animate);
    animTime += 0.2;

    clouds.forEach(c => {
        c.position.x += 0.02;
        if (c.position.x > 35) c.position.x = -35;
    });

    if (!gameStarted) {
        tailGroup.rotation.y = Math.sin(animTime * 0.8) * 0.3;
        renderer.render(scene, camera);
        return;
    }

    if (isGameOver) return;

    const targetX = currentLane * laneWidth;
    lionGroup.position.x += (targetX - lionGroup.position.x) * 0.25;

    velocityY += gravity;
    lionY += velocityY;

    if (lionY <= 0) {
        lionY = 0;
        velocityY = 0;
        isGrounded = true;
    }

    const bounceY = isGrounded ? Math.abs(Math.sin(animTime * 1.8)) * 0.22 : lionY;
    lionGroup.position.y = bounceY;
    lionGroup.rotation.x = isGrounded ? 0 : -velocityY * 0.8;

    camera.position.x = lionGroup.position.x;
    camera.lookAt(lionGroup.position.x, 1.2 + lionGroup.position.y * 0.3, -10);

    if (isGrounded) {
        legFL.rotation.x = Math.sin(animTime * 1.8) * 0.8;
        legFR.rotation.x = -Math.sin(animTime * 1.8) * 0.8;
        legBL.rotation.x = -Math.sin(animTime * 1.8) * 0.8;
        legBR.rotation.x = Math.sin(animTime * 1.8) * 0.8;
    } else {
        legFL.rotation.x = -0.5;
        legFR.rotation.x = -0.5;
        legBL.rotation.x = 0.5;
        legBR.rotation.x = 0.5;
    }
    tailGroup.rotation.y = Math.sin(animTime * 2.5) * 0.6;

    sceneryObjects.forEach(obj => {
        obj.position.z += gameSpeed;
        if (obj.position.z > 10) obj.position.z = -180;
    });

    spawnTimer++;
    if (spawnTimer > 45) {
        spawnObject();
        spawnTimer = 0;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
        let obj = objects[i];
        obj.position.z += gameSpeed;

        if (obj.userData.type === 'meat') {
            obj.rotation.y += 0.06;
        }

        const zDist = Math.abs(obj.position.z - lionGroup.position.z);
        if (zDist < 1.0 && obj.userData.lane === currentLane) {
            if (obj.userData.type === 'meat') {
                meatCollected++;
                document.getElementById('meat-count').innerText = meatCollected;
                AudioFX.playEatSound();
                scene.remove(obj);
                objects.splice(i, 1);

                if (meatCollected >= 15) {
                    endGame(true, "ภารกิจสำเร็จ! 🎉", "พี่สิงโตอิ่มอภิมหาปรีดาแล้ว ขอบคุณมากๆ นะ!");
                    return;
                }
            } else if (obj.userData.type === 'rock') {
                if (lionY < 1.1) {
                    AudioFX.playHitSound();
                    endGame(false, "ชนหินแหลม! 💥", "พยายามกระโดด (W / Space) หลบหินใหม่อีกครั้งนะ!");
                    return;
                }
            }
        } else if (obj.position.z > 10) {
            scene.remove(obj);
            objects.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

// --- 8. TIMER & SYSTEM ---
function startTimer() {
    timeLeft = 30;
    document.getElementById('time-left').innerText = timeLeft;

    timerInterval = setInterval(() => {
        if (isGameOver) return;
        timeLeft--;
        document.getElementById('time-left').innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false, "หมดเวลาแล้ว! ⏰", "พี่สิงโตยังไม่อิ่มเลย เวลาหมดซะก่อน");
        }
    }, 1000);
}

function startGame() {
    AudioFX.init();
    AudioFX.startBGM();
    document.getElementById('start-screen').style.display = 'none';
    gameStarted = true;
    startTimer();
}

function endGame(isWin, title, desc) {
    isGameOver = true;
    clearInterval(timerInterval);
    AudioFX.stopBGM();

    const winStampContainer = document.getElementById('win-stamp-container');
    const btnRedirect = document.getElementById('btn-redirect');

    if (isWin) {
        AudioFX.playWinSound();
        winStampContainer.style.display = 'flex';
        btnRedirect.style.display = 'block';
    } else {
        AudioFX.playHitSound();
        winStampContainer.style.display = 'none';
        btnRedirect.style.display = 'none';
    }

    document.getElementById('result-title').innerText = title;
    document.getElementById('result-desc').innerText = desc;
    document.getElementById('final-meat').innerText = meatCollected;
    document.getElementById('game-over').style.display = 'flex';
}

function restartGame() {
    objects.forEach(obj => scene.remove(obj));
    objects = [];

    meatCollected = 0;
    currentLane = 0;
    spawnTimer = 0;
    lionY = 0;
    velocityY = 0;
    isGrounded = true;
    isGameOver = false;

    document.getElementById('meat-count').innerText = '0';
    document.getElementById('game-over').style.display = 'none';

    lionGroup.position.x = 0;
    lionGroup.position.y = 0;
    camera.position.x = 0;

    AudioFX.startBGM();
    startTimer();
}

// ★★★ ฟังก์ชันกลางสำหรับกลับไปหน้าพาสปอร์ต — pattern เดียวกันทุกเกม ★★★
// zone id ของเกมนี้คือ "lion" และคะแนนที่ได้คือ meatCollected
function goToPassport() {
    const base = (window.ZOO_APP_BASE_URL || 'http://127.0.0.1:5500').replace(/\/$/, '');
    const url = `${base}/app/web/06-stamp-received/index.html?zone=lion&points=${encodeURIComponent(meatCollected)}`;
    window.location.href = url;
}

animate();