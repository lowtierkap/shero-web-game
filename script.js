const storageKey = 'cheese_thief_pro_save';
let state = JSON.parse(localStorage.getItem(storageKey)) || {
    cheese: 0, points: 0, lvlExtra: 0, lvlLess: 0, lvlMulti: 1
};

const WIN_TARGET = 200000;
const catImg = document.getElementById('cat-img');
const haha = document.getElementById('haha-overlay');
const targetBowl = document.getElementById('bowl-target');
const sourceBowl = document.getElementById('bowl-source');
const holdingIndicator = document.getElementById('holding-indicator');

const sleepingCat = "IMG_9246.png"; 
const alertCat = "IMG_9248.png";

let isAlert = false;
let isHoldingCheese = false;
let loopActive = false;

// MECHANIC: PICK UP
function tapSource() {
    if (isAlert) { triggerLoss(); return; }
    if (isHoldingCheese) return; 

    isHoldingCheese = true;
    sourceBowl.style.opacity = "0.3";
    holdingIndicator.style.display = "block";
}

// MECHANIC: DROP OFF
function tapTarget() {
    if (isAlert) { triggerLoss(); return; }
    if (!isHoldingCheese) return; 

    state.cheese += (1 + state.lvlExtra);
    isHoldingCheese = false;
    sourceBowl.style.opacity = "1";
    holdingIndicator.style.display = "none";

    if (state.cheese >= WIN_TARGET) triggerWin();
    save();
}

// ALERT LOGIC: 10-15s SAFE WINDOW
function gameLoop() {
    if (loopActive) return; 
    loopActive = true;

    function runCycle() {
        // Wait 10-15 seconds before cat wakes up
        let safeTime = Math.floor(Math.random() * 5001) + 10000; 
        
        setTimeout(() => {
            isAlert = true;
            catImg.src = alertCat;
            
            // Stay awake for 1.3 seconds
            setTimeout(() => {
                isAlert = false;
                catImg.src = sleepingCat;
                runCycle(); 
            }, 1300);
        }, safeTime);
    }
    runCycle();
}

function triggerLoss() {
    state.points = Math.floor(state.points * 0.8);
    haha.style.display = "block";
    setTimeout(() => { haha.style.display = "none"; }, 1100);
    
    isHoldingCheese = false;
    sourceBowl.style.opacity = "1";
    holdingIndicator.style.display = "none";
    save();
}

// SHOP LOGIC
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

function save() {
    localStorage.setItem(storageKey, JSON.stringify(state));
    updateUI();
}

function updateUI() {
    document.getElementById('cheese-count').innerText = Math.floor(state.cheese).toLocaleString();
    document.getElementById('points-count').innerText = Math.floor(state.points).toLocaleString();
    document.getElementById('lvl-extra').innerText = state.lvlExtra;
    document.getElementById('lvl-less').innerText = state.lvlLess;
    document.getElementById('val-multi').innerText = state.lvlMulti;

    document.getElementById('cost-extra').innerText = (10 * Math.pow(2, state.lvlExtra)).toLocaleString();
    document.getElementById('cost-less').innerText = (50 * (state.lvlLess + 1)).toLocaleString();
    document.getElementById('cost-multi').innerText = (100 * state.lvlMulti).toLocaleString();

    document.querySelectorAll('.upgrade-card').forEach(card => {
        let isCapped = false;
        if (card.id === 'up-extra' && state.lvlExtra >= 5) isCapped = true;
        if (card.id === 'up-less' && state.lvlLess >= 4) isCapped = true;
        if (card.id === 'up-points' && state.lvlMulti >= 5) isCapped = true;

        const cost = parseInt(card.querySelector('.up-cost').innerText.replace(/,/g, ''));
        card.disabled = (state.points < cost) || isCapped;
        if (isCapped) card.querySelector('.up-cost').innerText = "MAXED";
    });
}

function clearSaveAndReload() {
    localStorage.removeItem(storageKey);
    location.reload();
}

function triggerWin() {
    document.getElementById('win-screen').style.display = "flex";
}

window.onload = () => {
    updateUI();
    gameLoop();
};
