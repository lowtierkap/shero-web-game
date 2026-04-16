const storageKey = 'shero_heist_final';
let state = JSON.parse(localStorage.getItem(storageKey)) || {
    cheese: 0, points: 0, lvlExtra: 0, lvlLess: 0, lvlMulti: 1
};

const WIN_TARGET = 200000;
const catImg = document.getElementById('cat-img');
const statusIndicator = document.getElementById('cat-status-indicator');
const moodText = document.getElementById('mood-text');
const thoughtBubble = document.getElementById('thought-bubble');
const haha = document.getElementById('haha-overlay');
const holdingIndicator = document.getElementById('holding-indicator');
const sourceBowl = document.getElementById('bowl-source');

let isAlert = false;
let isHoldingCheese = false;
let loopActive = false;
let streak = 0;
let catnipActive = false;

// --- SHERO'S THOUGHTS LIBRARY ---
const thoughts = {
    "Deep Sleep": [
        "Dreaming of a mountain of mice...",
        "Everything is so quiet...",
        "The sun is warm in my dream.",
        "Zzz... extra cheese for everyone... zzz"
    ],
    "Normal": [
        "Is that a bird outside?",
        "I think I heard the fridge open...",
        "My tail is itchy...",
        "Just five more minutes of sleep."
    ],
    "Restless": [
        "I sense a disturbance in the cheese...",
        "Who is moving?!",
        "The floorboard just creaked...",
        "I'm half-awake and hungry."
    ],
    "Catnip": [
        "WHOA... colors...",
        "The cheese is dancing!",
        "I am the king of the universe.",
        "I can see through time..."
    ]
};

// --- CORE MECHANICS ---

function tapSource() {
    if (isAlert) { triggerLoss(); return; }
    if (isHoldingCheese) return; 
    isHoldingCheese = true;
    sourceBowl.style.opacity = "0.2";
    holdingIndicator.style.display = "block";
}

function tapTarget() {
    if (isAlert) { triggerLoss(); return; }
    if (!isHoldingCheese) return; 

    streak++;
    let bonus = Math.floor(streak / 5);
    state.cheese += (1 + state.lvlExtra + bonus);
    
    isHoldingCheese = false;
    sourceBowl.style.opacity = "1";
    holdingIndicator.style.display = "none";

    if (state.cheese >= WIN_TARGET) triggerWin();
    save();
}

// Risk a Pet
catImg.onclick = () => {
    if (isAlert) { triggerLoss(); return; }
    if (Math.random() < 0.25) {
        triggerLoss();
    } else {
        state.cheese += 50;
        streak += 5;
        save();
        catImg.style.filter = "brightness(2)";
        setTimeout(() => catImg.style.filter = "brightness(1)", 100);
    }
};

// --- THE SHERO ENGINE ---

function gameLoop() {
    if (loopActive) return;
    loopActive = true;

    function runCycle() {
        if (catnipActive) {
            updateMood("Catnip");
            return; // Catnip timer handles the reset
        }

        const moodRoll = Math.random();
        let mood = "Normal";
        let duration = 12000;

        if (moodRoll < 0.2) { mood = "Deep Sleep"; duration = 18000; }
        else if (moodRoll > 0.8) { mood = "Restless"; duration = 7000; }

        updateMood(mood);
        statusIndicator.className = "sleeping";

        // Pre-wake Twitch (1.5s before)
        setTimeout(() => {
            if (!isAlert && !catnipActive) catImg.style.animation = "shake 0.15s infinite";
        }, duration - 1500);

        // Wake up
        setTimeout(() => {
            if (catnipActive) { runCycle(); return; }
            
            isAlert = true;
            catImg.style.animation = "none";
            statusIndicator.className = "alert";
            if (isHoldingCheese) streak = 0;

            setTimeout(() => {
                isAlert = false;
                runCycle();
            }, 1400);
        }, duration);
    }
    runCycle();
}

function updateMood(mood) {
    currentMood = mood;
    moodText.innerText = mood.toUpperCase();
    const possibleThoughts = thoughts[mood] || thoughts["Normal"];
    thoughtBubble.innerText = `"${possibleThoughts[Math.floor(Math.random() * possibleThoughts.length)]}"`;
}

function buyCatnip() {
    if (state.points >= 1000 && !catnipActive) {
        state.points -= 1000;
        catnipActive = true;
        updateMood("Catnip");
        save();
        setTimeout(() => {
            catnipActive = false;
            loopActive = false;
            gameLoop();
        }, 30000);
    }
}

function triggerLoss() {
    state.points = Math.floor(state.points * 0.8);
    streak = 0;
    haha.style.display = "flex";
    setTimeout(() => { haha.style.display = "none"; }, 1200);
    isHoldingCheese = false;
    sourceBowl.style.opacity = "1";
    holdingIndicator.style.display = "none";
    save();
}

// --- SHOP & UI ---

function sellCheese() {
    let req = 10 - (state.lvlLess * 2);
    if (state.cheese >= req) {
        state.cheese -= req;
        state.points += (1 * state.lvlMulti);
        save();
    }
}

function buyExtraCheese() {
    let cost = Math.pow(2, state.lvlExtra) * 10;
    if (state.points >= cost && state.lvlExtra < 5) {
        state.points -= cost; state.lvlExtra++; save();
    }
}

function buyLessCheese() {
    let cost = (state.lvlLess + 1) * 50;
    if (state.points >= cost && state.lvlLess < 4) {
        state.points -= cost; state.lvlLess++; save();
    }
}

function buyExtraPoints() {
    let cost = state.lvlMulti * 100;
    if (state.points >= cost && state.lvlMulti < 5) {
        state.points -= cost; state.lvlMulti++; save();
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
    
    document.getElementById('cost-extra').innerText = (Math.pow(2, state.lvlExtra) * 10).toLocaleString();
    document.getElementById('cost-less').innerText = ((state.lvlLess + 1) * 50).toLocaleString();
    document.getElementById('cost-multi').innerText = (state.lvlMulti * 100).toLocaleString();

    document.querySelectorAll('.upgrade-card').forEach(card => {
        const costTxt = card.querySelector('.up-cost')?.innerText.replace(/,/g, '');
        if (costTxt && state.points < parseInt(costTxt)) card.disabled = true;
        else card.disabled = false;
        if (state.points < 1000 && card.classList.contains('catnip')) card.disabled = true;
    });
}

function clearSaveAndReload() { localStorage.removeItem(storageKey); location.reload(); }
function triggerWin() { document.getElementById('win-screen').style.display = "flex"; }

window.onload = () => { save(); gameLoop(); };
