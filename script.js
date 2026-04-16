/**
 * CHEESE THIEF - CORE ENGINE
 * Logic: Two-tap movement, 10-15s safe windows, local storage saving.
 */

// --- 1. GAME STATE & LOCAL STORAGE ---
const storageKey = 'cheese_thief_pro_save';
let state = JSON.parse(localStorage.getItem(storageKey)) || {
    cheese: 0, 
    points: 0,
    lvlExtra: 0, 
    lvlLess: 0, 
    lvlMulti: 1
};

// --- 2. DOM ELEMENTS ---
const WIN_TARGET = 200000;
const catImg = document.getElementById('cat-img');
const haha = document.getElementById('haha-overlay');
const targetBowl = document.getElementById('bowl-target');
const sourceBowl = document.getElementById('bowl-source');
const holdingIndicator = document.getElementById('holding-indicator');

// --- 3. CONFIGURATION ---
const sleepingCat = "IMG_9246.png"; 
const alertCat = "IMG_9248.png";

let isAlert = false;
let isHoldingCheese = false;

// --- 4. CORE MECHANIC: TWO-TAP SYSTEM ---

/**
 * First Tap: Pick up cheese from the source bowl
 */
function tapSource() {
    if (isAlert) {
        triggerLoss();
        return; 
    }
    if (isHoldingCheese) return; 

    isHoldingCheese = true;
    sourceBowl.disabled = true; // Visual feedback that bowl is "empty"
    targetBowl.disabled = false;
    holdingIndicator.style.display = "block"; 
    holdingIndicator.innerText = "🧀";
}

/**
 * Second Tap: Drop cheese in the middle bowl
 */
function tapTarget() {
    if (isAlert) {
        triggerLoss();
        return;
    }
    if (!isHoldingCheese) return; 

    // Calculate final transfer based on "Extra Cheese" upgrade
    let amount = 1 + state.lvlExtra;
    state.cheese += amount;

    // Reset holding state for next transfer
    isHoldingCheese = false;
    sourceBowl.disabled = false;
    holdingIndicator.style.display = "none";

    if (state.cheese >= WIN_TARGET) triggerWin();
    save();
}

// --- 5. ALERT LOGIC (10-15s OPPORTUNITY WINDOW) ---

function gameLoop() {
    // SAFE WINDOW: Guaranteed sleep for 10 to 15 seconds
    let safeTime = Math.random() * 5000 + 10000; 
    
    setTimeout(() => {
        // ALERT STATE: Cat wakes up
        isAlert = true;
        catImg.src = alertCat;
        catImg.style.transform = "scale(1.05)";
        
        // WAKE DURATION: Cat stays awake for 1.3 seconds
        setTimeout(() => {
            isAlert = false;
            catImg.src = sleepingCat;
            catImg.style.transform = "scale(1)";
            
            // RESTART: Begin the next safe cycle
            gameLoop(); 
        }, 1300); 

    }, safeTime);
}

function triggerLoss() {
    // Penalty: Lose 20% of points
    state.points = Math.floor(state.points * 0.8);
    
    // UI Feedback
    haha.style.display = "block";
    setTimeout(() => { haha.style.display = "none"; }, 1100);
    
    // Reset transfer progress
    isHoldingCheese = false;
    sourceBowl.disabled = false;
    holdingIndicator.style.display = "none";
    
    save();
}

// --- 6. SHOP & ECONOMY ---

function sellCheese() {
    let req = 10 - (state.lvlLess * 2); // Less Req upgrade decreases this
    if (state.cheese >= req) {
        state.cheese -= req;
        state.points += (1 * state.lvlMulti); // Multi upgrade increases this
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

// --- 7. UI & PERSISTENCE ---

function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    updateUI();
}

function updateUI() {
    // Update live counters
    document.getElementById('cheese-count').innerText = Math.floor(state.cheese).toLocaleString();
    document.getElementById('points-count').innerText = state.points.toLocaleString();
    
    // Update shop levels/multipliers
    document.getElementById('lvl-extra').innerText = state.lvlExtra;
    document.getElementById('lvl-less').innerText = state.lvlLess;
    document.getElementById('val-multi').innerText = state.lvlMulti;

    // Calculate and update current costs
    document.getElementById('cost-extra').innerText = (10 * Math.pow(2, state.lvlExtra)).toLocaleString();
    document.getElementById('cost-less').innerText = (50 * (state.lvlLess + 1)).toLocaleString();
    document.getElementById('cost-multi').innerText = (100 * state.lvlMulti).toLocaleString();

    // Handle button states (Affordability and Caps)
    document.querySelectorAll('.upgrade-card').forEach(card => {
        const costTxt = card.querySelector('.up-cost').innerText.replace(/[^0-9]/g, '');
        const cost = parseInt(costTxt);
        
        // Determine if upgrade is capped
        let isCapped = false;
        if (card.id === 'up-extra' && state.lvlExtra >= 5) isCapped = true;
        if (card.id === 'up-less' && state.lvlLess >= 4) isCapped = true;
        if (card.id === 'up-points' && state.lvlMulti >= 5) isCapped = true;

        card.disabled = (state.points < cost) || isCapped;
        if (isCapped) card.querySelector('.up-cost').innerText = "MAX";
    });
}

function clearSaveAndReload() {
    localStorage.removeItem(storageKey);
    location.reload();
}

function triggerWin() {
    document.getElementById('win-screen').style.display = "flex";
    // For confetti, you can use an external library like canvas-confetti
    console.log("Win target reached! Confetti Time!");
}

// --- 8. INITIALIZATION ---

// Start the game loop when the image is ready
if (catImg.complete) {
    gameLoop();
} else {
    catImg.onload = gameLoop;
}

// Initial UI Refresh
updateUI();
