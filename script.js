// --- GAME STATE & LOCAL STORAGE (Sleeked) ---
const storageKey = 'cheese_thief_pro_save';
let state = JSON.parse(localStorage.getItem(storageKey)) || {
    cheese: 0, points: 0,
    lvlExtra: 0, lvlLess: 0, lvlMulti: 1
};

function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    updateUI();
}

// --- CONSTANTS & DOM ---
const WIN_TARGET = 200000;
const catImg = document.getElementById('cat-img');
const haha = document.getElementById('haha-overlay');
const targetBowl = document.getElementById('bowl-target');
const sourceBowl = document.getElementById('bowl-source');
const holdingIndicator = document.getElementById('holding-indicator');

let isAlert = false;
let isHoldingCheese = false;

// --- RENAMED CAT IMAGES ---
const sleepingCat = "IMG_9246.png"; 
const alertCat = "IMG_9248.png";

// --- REWRITTEN CORE MECHANIC: TWO-TAP SYSTEM ---

// First Tap: Pick up cheese
function tapSource() {
    if (isAlert) {
        triggerLoss();
        return; // Penalty triggered, stop.
    }
    if (isHoldingCheese) return; // Already holding.

    isHoldingCheese = true;
    sourceBowl.disabled = true; // Visual 'empty' feedback
    targetBowl.disabled = false;
    holdingIndicator.style.display = "block"; // Start pulse indicator
    holdingIndicator.innerText = "🧀";
}

// Second Tap: Drop cheese in middle bowl
function tapTarget() {
    if (isAlert) {
        triggerLoss();
        // Even if you dropped it, the cat saw you at the moment of contact. Penalty!
    }
    if (!isHoldingCheese) return; // Not holding anything.

    // Calculate final transfer
    let amount = 1 + state.lvlExtra;
    state.cheese += amount;

    // Reset holding state
    isHoldingCheese = false;
    sourceBowl.disabled = false;
    holdingIndicator.style.display = "none";

    if (state.cheese >= WIN_TARGET) triggerWin();
    save();
}

// --- RANDOM ALERT LOGIC (Higher Stakes) ---
function loop() {
    // Increased randomness, shorter quiet periods
    let delay = Math.random() * 3000 + 1500;
    setTimeout(() => {
        isAlert = true;
        catImg.src = alertCat;
        catImg.style.transform = "scale(1.05)";
        
        setTimeout(() => {
            isAlert = false;
            catImg.src = sleepingCat;
            catImg.style.transform = "scale(1)";
            loop(); // Restart cycle
        }, 1300); // Cat stays alert for 1.3 seconds
    }, delay);
}
// Start the cycle when the context is active
catImg.onload = () => loop();

function triggerLoss() {
    // Instantly penalize. Both Taps are now a risk.
    state.points = Math.floor(state.points * 0.8);
    haha.style.display = "block";
    setTimeout(() => { haha.style.display = "none"; }, 1100);
    // Force reset holding state if caught mid-transfer
    isHoldingCheese = false;
    sourceBowl.disabled = false;
    holdingIndicator.style.display = "none";
    save();
}

// --- SHOP & SELLING LOGIC ---
function sellCheese() {
    let req = 10 - (state.lvlLess * 2);
    if (state.cheese >= req) {
        state.cheese -= req;
        state.points += (1 * state.lvlMulti);
        save();
    }
}

function buyExtraCheese() {
    let cost = 10 * Math.pow(2, state.lvlExtra);
    if (state.points >= cost && state.lvlExtra < 5) {
        state.points -= cost;
        state.lvlExtra++;
        save();
    }
}

function buyLessCheese() {
    let cost = 50 * (state.lvlLess + 1);
    if (state.points >= cost && state.lvlLess < 4) {
        state.points -= cost;
        state.lvlLess++;
        save();
    }
}

function buyExtraPoints() {
    let cost = 100 * state.lvlMulti;
    if (state.points >= cost && state.lvlMulti < 5) {
        state.points -= cost;
        state.lvlMulti++;
        save();
    }
}

function updateUI() {
    document.getElementById('cheese-count').innerText = Math.floor(state.cheese).toLocaleString();
    document.getElementById('points-count').innerText = state.points.toLocaleString();
    
    // Update upgrade levels
    document.getElementById('lvl-extra').innerText = state.lvlExtra;
    document.getElementById('lvl-less').innerText = state.lvlLess;
    document.getElementById('val-multi').innerText = state.lvlMulti;

    // Calculate and update costs
    document.getElementById('cost-extra').innerText = (10 * Math.pow(2, state.lvlExtra)).toLocaleString();
    document.getElementById('cost-less').innerText = (50 * (state.lvlLess + 1)).toLocaleString();
    document.getElementById('cost-multi').innerText = (100 * state.lvlMulti).toLocaleString();

    // Check all buttons for affordability and disable cards if needed
    document.querySelectorAll('.upgrade-card').forEach(card => {
        const costTxt = card.querySelector('.up-cost').innerText.replace(/[^0-9]/g, '');
        const cost = parseInt(costTxt);
        const maxLevelMatch = card.querySelector('.up-desc').innerText.match(/Max\s(\d)/);
        const maxLvl = maxLevelMatch ? parseInt(maxLevelMatch[1]) : 5;
        const currentLvlMatch = card.querySelector('.up-title').innerText.match(/Lvl\s(\d)|x(\d)/);
        const currentLvl = currentLvlMatch ? parseInt(currentLvlMatch[1] || currentLvlMatch[2]) : 0;

        card.disabled = (state.points < cost) || (currentLvl >= maxLvl && card.id !== 'up-points' || currentLvl == 5 && card.id == 'up-points');
    });
    
    // Initial state setup for bowls (on reload)
    if(!isHoldingCheese) {
        targetBowl.disabled = true;
        holdingIndicator.style.display = "none";
    }
}

function clearSaveAndReload() {
    localStorage.removeItem(storageKey);
    location.reload();
}

function triggerWin() {
    document.getElementById('win-screen').style.display = "flex";
    // Confetti logic requires external library or detailed canvas script
    // Add simple placeholder if library is unavailable
    console.log("CONFUSEI WIN!");
}

updateUI();
