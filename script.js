// --- GAME STATE & LOCAL STORAGE ---
let state = JSON.parse(localStorage.getItem('cheeseGame')) || {
    cheese: 0, points: 0,
    lvlExtra: 0, lvlLess: 0, lvlMulti: 1
};

function save() {
    localStorage.setItem('cheeseGame', JSON.stringify(state));
    updateUI();
}

// --- CONSTANTS & DOM ---
const WIN_TARGET = 200000;
const catImg = document.getElementById('cat-img');
const cheeseItem = document.getElementById('cheese-item');
const targetBowl = document.getElementById('bowl-target');
const haha = document.getElementById('haha-overlay');

let isAlert = false;

// --- DRAG AND DROP LOGIC ---
cheeseItem.addEventListener('touchstart', (e) => {
    if (isAlert) triggerLoss();
});

cheeseItem.onmousedown = () => { if (isAlert) triggerLoss(); };

cheeseItem.addEventListener('dragend', (e) => {
    // Check if dropped near target bowl
    const rect = targetBowl.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom) {
        
        let amount = 1 + state.lvlExtra;
        state.cheese += amount;
        
        // Visual feedback
        cheeseItem.style.transform = "scale(1.5)";
        setTimeout(() => cheeseItem.style.transform = "scale(1)", 100);
        
        if (state.cheese >= WIN_TARGET) triggerWin();
        save();
    }
});

// --- ALERT LOGIC (THE RISK) ---
function loop() {
    let delay = Math.random() * 4000 + 2000;
    setTimeout(() => {
        isAlert = true;
        catImg.src = "cat_alert.png"; // CHANGE TO YOUR ALERT IMAGE
        catImg.style.transform = "scale(1.1)";
        
        setTimeout(() => {
            isAlert = false;
            catImg.src = "cat.png";
            catImg.style.transform = "scale(1)";
            loop();
        }, 1200);
    }, delay);
}
loop();

function triggerLoss() {
    state.points = Math.floor(state.points * 0.8);
    haha.style.display = "block";
    setTimeout(() => { haha.style.display = "none"; }, 1000);
    save();
}

// --- SHOP LOGIC ---
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
    document.getElementById('lvl-extra').innerText = state.lvlExtra;
    document.getElementById('cost-extra').innerText = (10 * Math.pow(2, state.lvlExtra));
    document.getElementById('lvl-less').innerText = state.lvlLess;
    document.getElementById('cost-less').innerText = 50 * (state.lvlLess + 1);
    document.getElementById('val-multi').innerText = state.lvlMulti;
    document.getElementById('cost-multi').innerText = 100 * state.lvlMulti;
}

function triggerWin() {
    document.getElementById('win-screen').style.display = "flex";
    // Confetti logic would go here
}

updateUI();
