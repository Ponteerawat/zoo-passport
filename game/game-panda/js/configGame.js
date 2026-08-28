class SoundFX {
    constructor() {
        this.ctx = null;
    }
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }
    playCoin() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }
    playBamboo() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
    playMushroom() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.08);
        osc.frequency.linearRampToValueAtTime(900, now + 0.18);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
    }
    playJump() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
    playDie() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }
    playWin() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            gain.gain.setValueAtTime(0.15, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.25);
        });
    }
}
const sound = new SoundFX();

class FXSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
    }

    addSparkles(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 140 + 40;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: Math.random() * 4 + 2,
                alpha: 1,
                life: Math.random() * 0.3 + 0.3
            });
        }
    }

    addFloatingText(x, y, text, color = '#FFD700') {
        this.floatingTexts.push({
            x, y,
            text,
            color,
            alpha: 1,
            vy: -45,
            life: 0.8
        });
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life / 0.5);
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy * dt;
            t.life -= dt;
            t.alpha = Math.max(0, t.life / 0.8);
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    draw(ctx) {
        ctx.save();
        for (let p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.font = 'bold 22px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        for (let t of this.floatingTexts) {
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = '#000000';
            ctx.fillText(t.text, t.x + 1, t.y + 1);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
        }
        ctx.restore();
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
    }
}
const fx = new FXSystem();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

let gameState = 'START';
let animationId;
let lastTime = 0;
let scale = 1;
let toastTimeout = null;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    document.getElementById('mobile-controls').style.display = 'flex';
}

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    sound.init();
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    if (e.code === 'Space' && gameState === 'PLAYING') player.jump();
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

function setupTouchButton(id, keyName, isJump = false) {
    const btn = document.getElementById(id);
    if (!btn) return;

    const press = (e) => {
        if (e.cancelable) e.preventDefault();
        sound.init();
        btn.classList.add('active');
        keys[keyName] = true;
        if (isJump && gameState === 'PLAYING') player.jump();
    };
    const release = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.remove('active');
        keys[keyName] = false;
    };

    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
}

setupTouchButton('btn-left', 'ArrowLeft');
setupTouchButton('btn-right', 'ArrowRight');
setupTouchButton('btn-up', 'ArrowUp');
setupTouchButton('btn-down', 'ArrowDown');
setupTouchButton('btn-jump', 'Space', true);

function resize() {
    const container = document.getElementById('game-container');
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const scaleX = cw / GAME_WIDTH;
    const scaleY = ch / GAME_HEIGHT;
    scale = Math.min(scaleX, scaleY);

    canvas.width = GAME_WIDTH * scale;
    canvas.height = GAME_HEIGHT * scale;

    ctx.scale(scale, scale);

    canvas.style.width = `${GAME_WIDTH * scale}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;
}
window.addEventListener('resize', resize);
resize();

function showToast(text) {
    const toast = document.getElementById('toast-msg');
    toast.innerText = text;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

const Draw = {
    panda: (x, y, w, h, dir, isClimbing, climbFrame) => {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        if (dir === -1) ctx.scale(-1, 1);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, h / 2 - 2, w / 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isClimbing) {
            const bob = Math.sin(climbFrame * 0.2) * 2;
            ctx.translate(0, bob);

            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(0, 5, 18, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(0, -10, 16, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(-10, -22, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, -22, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-15, -5, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(15, -5, 6, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(-5, -22, 6, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(0, 5, 18, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(5, 15, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-10, 15, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(8, 5, 6, 10, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(5, -10, 16, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#222';
            ctx.beginPath(); ctx.arc(12, -22, 6, 0, Math.PI * 2); ctx.fill();

            ctx.beginPath(); ctx.ellipse(10, -12, 6, 4, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(12, -12, 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath(); ctx.arc(18, -8, 2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    },
    platform: (x, y, w, h) => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x, y + 10, w, h - 10);

        ctx.fillStyle = '#32CD32';
        ctx.fillRect(x, y, w, 15);

        ctx.beginPath();
        for (let i = 0; i < w; i += 10) {
            ctx.moveTo(x + i, y + 15);
            ctx.lineTo(x + i + 5, y + 15 + Math.random() * 5 + 2);
            ctx.lineTo(x + i + 10, y + 15);
        }
        ctx.fill();
    },
    ladder: (x, y, w, h) => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, 4, h);
        ctx.fillRect(x + w - 4, y, 4, h);
        for (let stepY = y + 10; stepY < y + h; stepY += 20) {
            ctx.fillRect(x, stepY, w, 4);
        }
    },
    spike: (x, y, w, h) => {
        ctx.fillStyle = '#B22222';
        const count = Math.floor(w / 15);
        const spikeW = w / count;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            ctx.moveTo(x + i * spikeW, y + h);
            ctx.lineTo(x + i * spikeW + spikeW / 2, y);
            ctx.lineTo(x + (i + 1) * spikeW, y + h);
        }
        ctx.fill();

        ctx.fillStyle = '#CD5C5C';
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
            ctx.moveTo(x + i * spikeW + spikeW / 2, y);
            ctx.lineTo(x + i * spikeW + spikeW / 2 + 2, y + h);
            ctx.lineTo(x + (i + 1) * spikeW, y + h);
        }
        ctx.fill();
    },
    bamboo: (x, y, w, h) => {
        ctx.fillStyle = '#2E8B57';
        const segH = h / 4;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x, y + i * segH, w, segH - 2);
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(x - 2, y + i * segH - 2, w + 4, 2);
            ctx.fillStyle = '#2E8B57';
        }
        ctx.fillStyle = '#32CD32';
        ctx.beginPath(); ctx.ellipse(x - 10, y + 10, 15, 4, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 15, y + 20, 15, 4, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    },
    coin: (x, y, r) => {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#DAA520';
        ctx.beginPath(); ctx.arc(x, y, r - 4, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(x - 3, y - 2, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 3, y - 2, 2, 0, Math.PI * 2); ctx.fill();
    },
    mushroom: (x, y, w, h) => {
        ctx.fillStyle = '#F5DEB3';
        ctx.fillRect(x + w / 2 - 4, y + h / 2, 8, h / 2);
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, w / 2, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath(); ctx.arc(x + w / 2 - 6, y + h / 2 - 6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w / 2 + 6, y + h / 2 - 4, 2, 0, Math.PI * 2); ctx.fill();
    },
    water: (x, y, w, h, time) => {
        ctx.fillStyle = 'rgba(65, 105, 225, 0.8)';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y);
        for (let i = 0; i <= w; i += 20) {
            const waveY = Math.sin((i + time) * 0.05) * 5;
            ctx.lineTo(x + i, y + waveY);
        }
        ctx.lineTo(x + w, y + h);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x, y, w, 5);
    },
    goal: (x, y, w, h) => {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(x, y, 10, h);
        ctx.fillRect(x + w - 10, y, 10, h);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(x - 20, y);
        ctx.lineTo(x + w / 2, y - 40);
        ctx.lineTo(x + w + 20, y);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillRect(x + w / 2 - 15, y + 10, 30, 40);
        ctx.fillStyle = '#FFD700';
        ctx.font = "20px Arial";
        ctx.fillText("出", x + w / 2 - 10, y + 35);
    }
};

class Player {
    constructor(x, y) {
        this.w = 40;
        this.h = 40;
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.speed = 300;
        this.jumpForce = -750;
        this.gravity = 2000;

        this.groundedTimer = 0;
        this.jumpBuffer = 0;

        this.dir = 1;

        this.isClimbing = false;
        this.climbSpeed = 200;
        this.climbFrame = 0;

        this.hasMushroom = false;
        this.mushroomTimer = 0;
    }

    update(dt, level) {
        if (this.hasMushroom) {
            this.mushroomTimer -= dt;
            if (this.mushroomTimer <= 0) this.hasMushroom = false;
        }

        this.groundedTimer -= dt;
        this.jumpBuffer -= dt;

        const moveSpeed = this.speed;

        if (keys.ArrowLeft) { this.vx = -moveSpeed; this.dir = -1; }
        else if (keys.ArrowRight) { this.vx = moveSpeed; this.dir = 1; }
        else { this.vx = 0; }

        let touchingLadder = null;
        for (let ladder of level.ladders) {
            if (this.checkCollision(this, ladder)) {
                touchingLadder = ladder;
                break;
            }
        }

        if (touchingLadder) {
            if ((keys.ArrowUp || keys.ArrowDown) && !this.isClimbing) {
                this.isClimbing = true;
                this.vx = 0;
                this.x = touchingLadder.x + touchingLadder.w / 2 - this.w / 2;
            }
        } else {
            this.isClimbing = false;
        }

        if (this.isClimbing) {
            this.vy = 0;
            this.groundedTimer = 0.1;
            if (keys.ArrowUp) { this.vy = -this.climbSpeed; this.climbFrame++; }
            else if (keys.ArrowDown) { this.vy = this.climbSpeed; this.climbFrame++; }

            if (keys.ArrowLeft || keys.ArrowRight) this.isClimbing = false;

            if (this.y < touchingLadder.y - this.h + 5) {
                this.y = touchingLadder.y - this.h + 5;
                this.isClimbing = false;
            }
            if (this.y > touchingLadder.y + touchingLadder.h - this.h) {
                this.y = touchingLadder.y + touchingLadder.h - this.h;
                this.isClimbing = false;
            }
        }

        if (this.jumpBuffer > 0 && this.groundedTimer > 0) {
            this.vy = this.hasMushroom ? this.jumpForce * 1.2 : this.jumpForce;
            this.groundedTimer = 0;
            this.jumpBuffer = 0;
            this.isClimbing = false;
            sound.playJump();
        } else if (!this.isClimbing) {
            this.vy += this.gravity * dt;
        }

        this.x += this.vx * dt;
        this.handleCollisionX(level.platforms, touchingLadder);

        this.y += this.vy * dt;
        this.handleCollisionY(level.platforms, touchingLadder);

        if (this.x < 0) this.x = 0;
        if (this.x + this.w > GAME_WIDTH) this.x = GAME_WIDTH - this.w;

        if (this.y > GAME_HEIGHT) {
            this.die();
        }
    }

    jump() {
        this.jumpBuffer = 0.15;
    }

    handleCollisionX(platforms, touchingLadder) {
        if (this.isClimbing) return;

        for (let p of platforms) {
            if (this.checkCollision(this, p)) {
                if (touchingLadder && p.h <= 50) continue;

                if (this.vx > 0) {
                    this.x = p.x - this.w;
                } else if (this.vx < 0) {
                    this.x = p.x + p.w;
                }
                this.vx = 0;
            }
        }
    }

    handleCollisionY(platforms, touchingLadder) {
        if (this.isClimbing) return;

        for (let p of platforms) {
            if (this.checkCollision(this, p)) {
                if (this.vy > 0) {
                    this.y = p.y - this.h;
                    this.groundedTimer = 0.15;
                    this.vy = 0;
                } else if (this.vy < 0) {
                    if (touchingLadder && p.h <= 50) continue;

                    this.y = p.y + p.h;
                    this.vy = 0;
                }
            }
        }
    }

    checkCollision(rect1, rect2) {
        return (rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y);
    }

    die() {
        sound.playDie();
        fx.addSparkles(this.x + this.w / 2, this.y + this.h / 2, '#FF4500', 25);
        game.lives--;
        updateUI();
        if (game.lives <= 0) {
            gameState = 'GAMEOVER';
            document.getElementById('screen-gameover').classList.remove('hidden');
        } else {
            this.x = this.startX;
            this.y = this.startY;
            this.vx = 0;
            this.vy = 0;
            this.groundedTimer = 0;
            this.jumpBuffer = 0;
            this.hasMushroom = false;
        }
    }

    draw() {
        Draw.panda(this.x, this.y, this.w, this.h, this.dir, this.isClimbing, this.climbFrame);

        if (this.hasMushroom) {
            ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 2, this.w * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

const levels = [
    // Level 1
    {
        startXY: [100, 500],
        targetBamboo: 3,
        platforms: [
            { x: 0, y: 600, w: 400, h: 120 },
            { x: 560, y: 600, w: 720, h: 120 },
            { x: 200, y: 350, w: 250, h: 40 },
            { x: 520, y: 430, w: 180, h: 40 },
            { x: 760, y: 350, w: 250, h: 40 },
        ],
        ladders: [
            { x: 350, y: 350, w: 40, h: 250 },
            { x: 850, y: 350, w: 40, h: 250 }
        ],
        spikes: [
            { x: 400, y: 650, w: 160, h: 30 }
        ],
        waters: [],
        bamboos: [
            { x: 250, y: 270, w: 15, h: 80, collected: false },
            { x: 600, y: 350, w: 15, h: 80, collected: false },
            { x: 950, y: 520, w: 15, h: 80, collected: false }
        ],
        coins: [
            { x: 220, y: 550, r: 15, collected: false },
            { x: 620, y: 550, r: 15, collected: false },
            { x: 900, y: 280, r: 15, collected: false }
        ],
        mushrooms: [
            { x: 950, y: 310, w: 30, h: 40, collected: false }
        ],
        goal: { x: 1100, y: 450, w: 120, h: 150 }
    },
    // Level 2 (Fixed Jump Gap & Added Stepping Platform)
    {
        startXY: [50, 200],
        targetBamboo: 2,
        platforms: [
            { x: 0, y: 300, w: 220, h: 420 },       // Left cliff
            { x: 0, y: 650, w: 400, h: 70 },        // Lower left ground
            { x: 580, y: 530, w: 260, h: 120 },      // Mid block under spikes
            { x: 900, y: 380, w: 380, h: 340 },      // Goal plateau right
            { x: 260, y: 460, w: 150, h: 40 },       // Floating step 1
            { x: 470, y: 390, w: 140, h: 40 },       // Floating step 2 (Mid bridge)
            { x: 670, y: 320, w: 160, h: 40 },       // Floating step 3 (Upper step)
        ],
        ladders: [
            { x: 170, y: 300, w: 40, h: 350 }
        ],
        spikes: [
            { x: 620, y: 500, w: 180, h: 30 }
        ],
        waters: [
            { x: 400, y: 600, w: 180, h: 120 }
        ],
        bamboos: [
            { x: 720, y: 240, w: 15, h: 80, collected: false },
            { x: 1000, y: 300, w: 15, h: 80, collected: false }
        ],
        coins: [
            { x: 330, y: 400, r: 15, collected: false },
            { x: 770, y: 260, r: 15, collected: false }
        ],
        mushrooms: [],
        goal: { x: 1120, y: 230, w: 100, h: 150 }
    },
    // Level 3
    {
        startXY: [50, 450],
        targetBamboo: 3,
        platforms: [
            { x: 0, y: 550, w: 150, h: 170 },
            { x: 1070, y: 520, w: 210, h: 200 },
            { x: 220, y: 480, w: 110, h: 30 },
            { x: 390, y: 420, w: 110, h: 30 },
            { x: 560, y: 360, w: 110, h: 30 },
            { x: 730, y: 360, w: 110, h: 30 },
            { x: 900, y: 440, w: 110, h: 30 },
            { x: 500, y: 180, w: 250, h: 30 },
        ],
        ladders: [
            { x: 600, y: 180, w: 40, h: 180 }
        ],
        spikes: [
            { x: 150, y: 650, w: 920, h: 70 }
        ],
        waters: [],
        bamboos: [
            { x: 250, y: 400, w: 15, h: 80, collected: false },
            { x: 620, y: 100, w: 15, h: 80, collected: false },
            { x: 930, y: 360, w: 15, h: 80, collected: false }
        ],
        coins: [
            { x: 430, y: 350, r: 15, collected: false },
            { x: 770, y: 290, r: 15, collected: false }
        ],
        mushrooms: [],
        goal: { x: 1130, y: 370, w: 100, h: 150 }
    },
    // Level 4
    {
        startXY: [50, 150],
        targetBamboo: 2,
        platforms: [
            { x: 0, y: 250, w: 160, h: 470 },
            { x: 0, y: 650, w: 1280, h: 70 },
            { x: 250, y: 450, w: 140, h: 40 },
            { x: 460, y: 410, w: 140, h: 40 },
            { x: 670, y: 370, w: 140, h: 40 },
            { x: 880, y: 270, w: 400, h: 450 },
        ],
        ladders: [
            { x: 110, y: 250, w: 40, h: 400 }
        ],
        spikes: [],
        waters: [
            { x: 160, y: 550, w: 720, h: 170 }
        ],
        bamboos: [
            { x: 300, y: 370, w: 15, h: 80, collected: false },
            { x: 710, y: 290, w: 15, h: 80, collected: false }
        ],
        coins: [
            { x: 310, y: 350, r: 15, collected: false },
            { x: 720, y: 270, r: 15, collected: false }
        ],
        mushrooms: [
            { x: 510, y: 370, w: 30, h: 40, collected: false }
        ],
        goal: { x: 1100, y: 120, w: 100, h: 150 }
    },
    // Level 5
    {
        startXY: [50, 450],
        targetBamboo: 4,
        platforms: [
            { x: 0, y: 550, w: 180, h: 170 },
            { x: 230, y: 500, w: 150, h: 40 },
            { x: 430, y: 450, w: 150, h: 40 },
            { x: 630, y: 400, w: 150, h: 40 },
            { x: 200, y: 300, w: 180, h: 40 },
            { x: 430, y: 200, w: 180, h: 40 },
            { x: 660, y: 220, w: 140, h: 40 },
            { x: 850, y: 250, w: 180, h: 40 },
            { x: 1050, y: 550, w: 230, h: 170 },
        ],
        ladders: [
            { x: 280, y: 300, w: 40, h: 200 },
            { x: 480, y: 200, w: 40, h: 250 },
            { x: 920, y: 250, w: 40, h: 300 }
        ],
        spikes: [
            { x: 180, y: 650, w: 870, h: 70 }
        ],
        waters: [],
        bamboos: [
            { x: 290, y: 220, w: 15, h: 80, collected: false },
            { x: 500, y: 120, w: 15, h: 80, collected: false },
            { x: 710, y: 140, w: 15, h: 80, collected: false },
            { x: 910, y: 170, w: 15, h: 80, collected: false },
        ],
        coins: [
            { x: 300, y: 440, r: 15, collected: false },
            { x: 500, y: 390, r: 15, collected: false },
            { x: 700, y: 340, r: 15, collected: false }
        ],
        mushrooms: [],
        goal: { x: 1120, y: 400, w: 100, h: 150 }
    }
];

let game = {
    levelIndex: 0,
    lives: 3,
    bamboo: 0,
    totalBamboo: 0,
    score: 0,
    currentLevel: null
};
let player = null;
let timeCount = 0;

function loadLevel(index) {
    if (index >= levels.length) {
        showToast("🎉 คุณเคลียร์ทุกด่านแล้ว!");
        game.levelIndex = 0;
        index = 0;
    }

    game.currentLevel = JSON.parse(JSON.stringify(levels[index]));
    game.bamboo = 0;
    fx.clear();

    player = new Player(game.currentLevel.startXY[0], game.currentLevel.startXY[1]);
    updateUI();
}

function updateUI() {
    document.getElementById('ui-lives').innerText = game.lives;
    document.getElementById('ui-level').innerText = `ด่าน ${game.levelIndex + 1}/${levels.length}`;
    if (game.currentLevel) {
        document.getElementById('ui-bamboo').innerText = `${game.bamboo}/${game.currentLevel.targetBamboo}`;
    }
    document.getElementById('ui-score').innerText = game.score;
}

document.getElementById('btn-pause').addEventListener('click', () => {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        document.getElementById('screen-pause').classList.remove('hidden');
    }
});

function startGame() {
    game.lives = 3;
    game.score = 0;
    game.totalBamboo = 0;
    game.levelIndex = 0;
    loadLevel(game.levelIndex);

    document.getElementById('screen-start').classList.add('hidden');
    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('screen-levelcomplete').classList.add('hidden');
    document.getElementById('screen-finalcomplete').classList.add('hidden');

    gameState = 'PLAYING';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    startGame();
}

function resumeGame() {
    gameState = 'PLAYING';
    document.getElementById('screen-pause').classList.add('hidden');
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function nextLevel() {
    game.levelIndex++;
    if (game.levelIndex >= levels.length) {
        showFinalCompletion();
        return;
    }
    loadLevel(game.levelIndex);
    document.getElementById('screen-levelcomplete').classList.add('hidden');
    gameState = 'PLAYING';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}



function showFinalCompletion() {
    gameState = 'FINAL_COMPLETE';

    document.getElementById('screen-levelcomplete').classList.add('hidden');
    document.getElementById('screen-gameover').classList.add('hidden');
    document.getElementById('screen-pause').classList.add('hidden');

    // แสดงคะแนนจริงของผู้เล่น (เดิม fix ไว้ที่ 100 ตายตัว ตอนนี้ใช้ game.score จริง
    // เพื่อให้ตรงกับคะแนนที่จะส่งไปหน้าพาสปอร์ตตอนกด "ดูพาสปอร์ต")
    document.getElementById('final-point').innerText = game.score;

    document.getElementById('screen-finalcomplete').classList.remove('hidden');

    sound.playWin();

    if (player) {
        fx.addSparkles(player.x + player.w / 2, player.y + player.h / 2, '#FFD700', 30);
    }
}

// ★★★ ฟังก์ชันกลางสำหรับกลับไปหน้าพาสปอร์ต — pattern เดียวกันทุกเกม ★★★
// zone id ของเกมนี้คือ "panda" และคะแนนที่ส่งไปคือ game.score
// เดิมฟังก์ชันนี้แค่ขึ้น toast ข้อความ ไม่ได้พาไปไหนจริง ตอนนี้ redirect จริงแล้ว
function showPassport() {
    const base = (window.ZOO_APP_BASE_URL || 'http://127.0.0.1:5500').replace(/\/$/, '');
    const url = `${base}/app/web/06-stamp-received/index.html?zone=panda&points=${encodeURIComponent(game.score)}`;
    window.location.href = url;
}

function checkItemCollisions() {
    const level = game.currentLevel;

    for (let b of level.bamboos) {
        if (!b.collected && player.checkCollision(player, { x: b.x, y: b.y, w: b.w, h: b.h })) {
            b.collected = true;
            game.bamboo++;
            game.totalBamboo++;
            game.score += 50;
            sound.playBamboo();
            fx.addSparkles(b.x + b.w / 2, b.y + b.h / 2, '#32CD32', 15);
            fx.addFloatingText(b.x + b.w / 2, b.y, '+50 ไผ่!', '#32CD32');
            updateUI();
        }
    }

    for (let c of level.coins) {
        if (!c.collected) {
            let cx = c.x - c.r, cy = c.y - c.r, cw = c.r * 2, ch = c.r * 2;
            if (player.checkCollision(player, { x: cx, y: cy, w: cw, h: ch })) {
                c.collected = true;
                game.score += 10;
                sound.playCoin();
                fx.addSparkles(c.x, c.y, '#FFD700', 12);
                fx.addFloatingText(c.x, c.y - 10, '+10', '#FFD700');
                updateUI();
            }
        }
    }

    for (let m of level.mushrooms) {
        if (!m.collected && player.checkCollision(player, { x: m.x, y: m.y, w: m.w, h: m.h })) {
            m.collected = true;
            player.hasMushroom = true;
            player.mushroomTimer = 6;
            game.score += 20;
            sound.playMushroom();
            fx.addSparkles(m.x + m.w / 2, m.y + m.h / 2, '#FF8C00', 18);
            fx.addFloatingText(m.x + m.w / 2, m.y, 'กระโดดสูง!', '#FF8C00');
            updateUI();
        }
    }

    for (let s of level.spikes) {
        let spikeHitbox = { x: s.x + 5, y: s.y + 10, w: s.w - 10, h: s.h - 10 };
        if (player.checkCollision(player, spikeHitbox)) {
            player.die();
            return;
        }
    }

    for (let w of level.waters) {
        let waterHitbox = { x: w.x, y: w.y + 10, w: w.w, h: w.h - 10 };
        if (player.checkCollision(player, waterHitbox)) {
            player.die();
            return;
        }
    }

    const g = level.goal;
    if (player.checkCollision(player, { x: g.x, y: g.y, w: g.w, h: g.h })) {
        if (game.bamboo >= level.targetBamboo) {
            if (game.levelIndex === levels.length - 1) {
                showFinalCompletion();
            } else {
                sound.playWin();
                gameState = 'LEVEL_COMPLETE';
                document.getElementById('lc-bamboo').innerText = `${game.bamboo}/${level.targetBamboo}`;
                document.getElementById('lc-total-bamboo').innerText = game.totalBamboo;
                document.getElementById('lc-score').innerText = game.score;
                document.getElementById('screen-levelcomplete').classList.remove('hidden');
            }
        } else {
            showToast(`⚠️ ต้องเก็บไผ่ให้ครบ ${level.targetBamboo} ต้นก่อน! (${game.bamboo}/${level.targetBamboo})`);
        }
    }
}

function render(dt) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    timeCount += dt;

    const level = game.currentLevel;

    Draw.goal(level.goal.x, level.goal.y, level.goal.w, level.goal.h);

    for (let l of level.ladders) Draw.ladder(l.x, l.y, l.w, l.h);
    for (let p of level.platforms) Draw.platform(p.x, p.y, p.w, p.h);
    for (let s of level.spikes) Draw.spike(s.x, s.y, s.w, s.h);
    for (let w of level.waters) Draw.water(w.x, w.y, w.w, w.h, timeCount * 50);

    for (let b of level.bamboos) {
        if (!b.collected) Draw.bamboo(b.x, b.y, b.w, b.h);
    }

    const coinBob = Math.sin(timeCount * 5) * 5;
    for (let c of level.coins) {
        if (!c.collected) Draw.coin(c.x, c.y + coinBob, c.r);
    }

    for (let m of level.mushrooms) {
        if (!m.collected) Draw.mushroom(m.x, m.y, m.w, m.h);
    }

    player.draw();

    fx.update(dt);
    fx.draw(ctx);
}

function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    if (gameState === 'PLAYING') {
        player.update(dt, game.currentLevel);
        checkItemCollisions();
    }

    if (game.currentLevel) {
        render(dt);
    }

    if (gameState !== 'START') {
        animationId = requestAnimationFrame(gameLoop);
    }
}

resize();