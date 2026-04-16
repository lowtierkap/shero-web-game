let points = 0;
let pointsPerSecond = 0;
let tapMultiplier = 1;
let lotionCost = 500;

const countDisplay = document.getElementById('purr-count');
const ppsDisplay = document.getElementById('pps-display');
const hitbox = document.getElementById('belly-hitbox');

// Audio Synthesis for the Purr
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playPurr() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, audioCtx.currentTime); // Deep rumble
    
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

// interaction Handler
function handleInteraction(e) {
    // Determine coordinates based on touch or mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Rate limiting: only trigger roughly 15% of movement events to keep it balanced
    if (Math.random() > 0.85) {
        addPoint(clientX, clientY);
    }
}

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
    setTimeout(() => el.remove(), 600);
}

// Event Listeners for Rubbing
hitbox.addEventListener('mousemove', handleInteraction);

hitbox.addEventListener('touchmove', function(e) {
    e.preventDefault(); // STOPS PAGE SCROLL
    handleInteraction(e);
}, { passive: false });

// Also allow clicking/tapping
hitbox.addEventListener('mousedown', (e) => addPoint(e.clientX, e.clientY));
hitbox.addEventListener('touchstart', function(e) {
    e.preventDefault(); // STOPS PAGE BOUNCE
    addPoint(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

// Shop Functions
function buyUpgrade(id, cost, pps) {
    if (points >= cost) {
        points -= cost;
        pointsPerSecond += pps;
        const btn = document.getElementById(`upgrade-${id}`);
        const nextCost = Math.floor(cost * 1.6);
        btn.setAttribute('onclick', `buyUpgrade('${id}', ${nextCost}, ${pps})`);
        btn.querySelector('.price').innerText = `Cost: ${nextCost.toLocaleString()}`;
        updateDisplay();
    }
}

function buyLotion() {
    if (points >= lotionCost) {
        points -= lotionCost;
        tapMultiplier *= 2;
        lotionCost *= 5;
        document.getElementById('lotion-cost').innerText = `Cost: ${lotionCost.toLocaleString()}`;
        updateDisplay();
    }
}

function updateDisplay() {
    countDisplay.innerText = Math.floor(points).toLocaleString();
    ppsDisplay.innerText = `PPS: ${pointsPerSecond.toFixed(1)}`;
    
    // UI Button state
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        const costTxt = btn.querySelector('.price').innerText.replace(/[^0-9]/g, '');
        btn.disabled = points < parseInt(costTxt);
    });
}

// Idle Loop (10 ticks per second)
setInterval(() => {
    if (pointsPerSecond > 0) {
        points += (pointsPerSecond / 10);
        updateDisplay();
    }
}, 100);

// Set initial state
updateDisplay();
