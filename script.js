let points = 0;
let pointsPerSecond = 0;
let tapMultiplier = 1;
let lotionCost = 500;

const countDisplay = document.getElementById('purr-count');
const ppsDisplay = document.getElementById('pps-display');
const hitbox = document.getElementById('belly-hitbox');

// Audio setup: Synthesizes a low-freq purring sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPurr() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, audioCtx.currentTime); // Low "rumble"
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Rubbing event
hitbox.addEventListener('mousemove', (e) => {
    // 10% chance per movement pixel to trigger a point (prevents infinite spam)
    if (Math.random() > 0.90) {
        addPoint(e.clientX, e.clientY);
    }
});

function addPoint(x, y) {
    points += tapMultiplier;
    playPurr();
    createFloatingText(x, y, `+${tapMultiplier}`);
    updateDisplay();
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function buyUpgrade(id, cost, pps) {
    if (points >= cost) {
        points -= cost;
        pointsPerSecond += pps;
        const btn = document.getElementById(`upgrade-${id}`);
        const nextCost = Math.floor(cost * 1.5);
        btn.setAttribute('onclick', `buyUpgrade('${id}', ${nextCost}, ${pps})`);
        btn.querySelector('.price').innerText = `Cost: ${nextCost.toLocaleString()}`;
        updateDisplay();
    }
}

function buyLotion() {
    if (points >= lotionCost) {
        points -= lotionCost;
        tapMultiplier *= 2;
        lotionCost *= 4;
        document.getElementById('lotion-cost').innerText = `Cost: ${lotionCost.toLocaleString()}`;
        updateDisplay();
    }
}

function updateDisplay() {
    countDisplay.innerText = Math.floor(points).toLocaleString();
    ppsDisplay.innerText = `Points Per Second: ${pointsPerSecond.toFixed(1)}`;
    
    // Check all buttons for affordability
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        const costTxt = btn.querySelector('.price').innerText.replace(/[^0-9]/g, '');
        btn.disabled = points < parseInt(costTxt);
    });
}

// Idle generation loop (runs every 100ms)
setInterval(() => {
    if (pointsPerSecond > 0) {
        points += (pointsPerSecond / 10);
        updateDisplay();
    }
}, 100);
