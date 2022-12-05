let levelStr = [
    `
......................................................................................
....................................o.........=.......................................
......................................................................................
.........@..........................o.................................................
........==.......................======.......|.......................................
.................................======...............................................
.................................======......................................o........
..............o......o...==============.........................==..........==....o...
.........................==============............+++++++...o..==...o....-.==........
======================================================================================`,

    `
==================================================================================================
.................................................=================================================
.......|.........|.....................===========================================================
.....................................o...........=================================================
..@.........+....................-.........=======================================================
=========================================...======================================================
=========================================...======================================================
=========================================...======================================================
=========================================...======================================================
=========================================...======================================================
=========================================...======================================================
===========================..============...========.....=============..=====================...==
..................................................................................................
...-....o.....-...o....-..........o...................=..........o........-......o........o.......
==..==============================================================================================
==..==============================================================================================
==..==============================================================================================
==..==============================================================================================
==..==============================================================================================
==..==============================================================================================
==..==============================================================================================
.................................................=================================================
.......|....o....|...............|.....===========================================================
...........................+.........o...........=================================================
............+......-..=....+.....-........o=======================================================
==================================================================================================`,


    `
====================================...=========================
=...===.................................====...................=
=.............=.........................====...................=
=..........o..=.........................====...................=
=.............=.........................====...................=
=.............=.........................====...-..=....=....-..=
=.......=...............................====o.......=.........o=
=.............=.........................=====.................==
=.......................................====...................=
=.......=...............................====.........==........=
=.......................................====........==.........=
==..=...................................====.-o................=
=.......................................====...........-.......=
==.....=..........o.....................====..==...............=
=.......................................====...................=
=...............=.......................====............=......=
=...===......=|=........................====.........=.........=
=..=@..=.....=.=.......-...=............====o.......=..........=
=.=.....==...===........................====.....|........-....=
=...................................o...====..==...............=
=.......o...............................====...................=
================..==========================........=..........=
=.......................................=......-..........o....=
=..................................-....=................==....=
=...............==.......|.....................==..............=
=....|.....................==..........................|.......=
=....................=...........==............................=
=..........=.................o..........=..................o...=
=-....................................-.=......................=
================================================================`,




    `
=====================================================================================================================================
=......................=............=..............=....................................=...........................................=
=......................=............=.........-....========.....o............o..........=...........................................=
=.......................................................|.=...........o..........-......=...........................................=
=......................o..................o...............=.............=..|..=.....=...=.....|........o............................=
=......................=............-..............=.|............=..|............................======....................o.......=
=......................=............=.....=...-....=............................................========...............o............=
=...............@......=....-.......=++++++++++++++=......=.......-.................-...=....===========............................=
=...............=====================================================================================================...............=
=....==.............................................................................................................................=
=...................................................................................................................................=
=...................................................................................................................................=
=.........=.........................................................................................................................=
=.........==..........o.....................o.......................................................................................=
=.....................=.........o...................................................................................................=
=.....................=.........=...........=........==......................................................................===....=
=.....................=.........=...........=........==...-.....o............=.................................o....................=
=.....................=.........=...........=........=========================................................===...................=
=............................................................................=......................................................=
=............................................=...............................========...............................................=
=...................................................................................=...............................................=
=............................................|......................................=====...........................................=
=.......................................................................................=...........................................=
=.......................................................................................====........................................=
=...........o........................................==.............................................................................=
=============.......................................===...........................................=.................................=
=...................................................................................................................................=
=.................................................................................................|...o....o........................=
=................................................=.........|........................................=============...................=
=................................................=....................................................|.............................=
=........................................=========....................o...................................o...|......==.............=
=........................................=..........................................................................................=
=.......................=+++=.......o....=++++++++++++++=...........................................................................=
=====================================================================......==...................================....................=
=...........................................................................=...................=.........................-.........=
=...........................................................................=...................=...................................=
=...........................................................................=..............======...........-.......................=
=+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=+++++++++++++=======...............................o...=
=====================================================================================================================================
`,
]

const welcomePage = document.querySelector(".welcome");
let start = new Date().getTime();
const timeEl = document.querySelector('.time');

let coins = 0;
let totalCoins = 0;
const coinsEl = document.querySelector('.coins');

let deaths = 0;
const deathsEl = document.querySelector('.deaths');

let levels = levelStr.entries();

const replay = document.querySelector('.replay');
const scale = 25;

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Level {
    constructor(plan) {
        let rows = plan.trim().split("\n").map(el => [...el]);
        this.height = rows.length;
        this.width = rows[0].length;
        this.startActors = [];
        this.rows = rows.map((row, y) => {
            return row.map((el, x) => {
                let type = levelChars[el];
                if (typeof type == "string") return type;
                this.startActors.push(type.create(new Vec(x, y), el));
                return "empty";
            })
        })
        this.displayLevel(this.buildLvl(), this.startActors);
    }
    touching(actualPos, nPos, size, type) {
        let x = Math.floor(actualPos.x);
        let xs = Math.floor(x + size.x);
        let y = Math.floor(actualPos.y);
        let ys = Math.floor(y + size.y);
        let nextMinX = Math.floor(nPos.x);
        let nextMaxX = Math.floor(nPos.x + size.x);
        let nextMinY = Math.floor(nPos.y);
        let nextMaxY = Math.floor(nPos.y + size.y);
        let tBoundary = {
            top: false,
            right: false,
            bottom: false,
            left: false,
            isOut: false,
        };
        let tState = {
            touched: false,
            tBoundary: tBoundary
        }
        if (this.rows[nextMaxY][x] == type ||
            this.rows[nextMaxY][xs] == type) {
            tBoundary.bottom = true;
            tState.touched = true;
        }
        if (!tBoundary.bottom) {
            if ((nextMaxX >= this.width) || this.rows[nextMaxY][nextMaxX] == type || this.rows[y][nextMaxX] == type ||
                this.rows[ys][nextMaxX] == type) {
                tBoundary.right = true;
                tState.touched = true;
            }
        }
        else if ((nextMaxX >= this.width) || this.rows[y][nextMaxX] == type ||
            this.rows[ys][nextMaxX] == type) {
            tBoundary.right = true;
            tState.touched = true;
        }
        if ((nPos.x <= 0) || this.rows[y][nextMinX] == type ||
            this.rows[ys][nextMinX] == type) {
            tBoundary.left = true;
            tState.touched = true;
        }
        if ((nPos.y <= 0) || this.rows[nextMinY][x] == type ||
            this.rows[nextMinY][xs] == type) //minus one bcz of the player's height wich is greater than 1 and being shifted higher so it's base get aligned with the floor
        {
            tBoundary.top = true;
            tState.touched = true;
        }
        return tState;
    }


    touching2(actualPos, nPos, size, type) {
        let x = Math.floor(actualPos.x);
        let xs = Math.floor(x + size.x);
        let y = Math.floor(actualPos.y);
        let ys = Math.floor(y + size.y);

        let tBoundary = {
            top: false,
            right: false,
            bottom: false,
            left: false,
            isOut: false,
        };
        let tState = {
            touched: false,
            tBoundary: tBoundary
        }
        if (this.rows[ys][x] == type) {
            tBoundary.bottom = true;
            tState.touched = true;
        }

        if ((xs >= this.width) || this.rows[y][xs] == type) {
            tBoundary.right = true;
            tState.touched = true;
        }

        if ((nPos.x < 0) || this.rows[y][x] == type) {
            tBoundary.left = true;
            tState.touched = true;
        }
        if ((nPos.y < 0) || this.rows[y][x] == type) //minus one bcz of the player's height wich is greater than 1 and being shifted higher so it's base get aligned with the floor
        {
            tBoundary.top = true;
            tState.touched = true;
        }
        return tState;
    }
    buildLvl() {
        return elt('table', {
            width: this.rows[0].length * scale,
            height: this.rows.length * scale
        }, ...this.rows.map(row =>
            elt('tr', {}, ...row.map(el =>
                elt('td', { class: el, style: `height : ${scale}px; width: ${scale}px;` })))))
    }
    displayLevel(levelEl, actors) {
        frame.innerHTML = '';
        frame.appendChild(levelEl);
        drawActors(actors, frame);
    }
    overlap(act1, act2) {
        let overlap = false;
        let x1 = act1.pos.x;
        let xs1 = act1.pos.x + act1.size.x;
        let y1 = act1.pos.y;
        let ys1 = act1.pos.y + act1.size.y;
        let x2 = act2.pos.x;
        let xs2 = act2.pos.x + act2.size.x;
        let y2 = act2.pos.y;
        let ys2 = act2.pos.y + act2.size.y;
        if (x1 < xs2 - 0.001 && xs1 > x2 + 0.001 && y1 < ys2 - 0.001 && ys1 > y2 + 0.001)
            overlap = true;
        return overlap;
    }
}
class Player {
    constructor(pos) {
        this.pos = pos;
        this.speed = new Vec(0, 0);
    }
    get type() { return "player"; }
    static create(pos) {
        return new Player(new Vec(pos.x, pos.y));
    }
    update(state) {
        if (this.speed.y > 0)
            this.speed.y -= 0.005;

        if (keys["ArrowLeft"]) this.speed.x = -0.13;
        if (keys["ArrowRight"]) this.speed.x = 0.13;
        let nextPos = {
            x: this.pos.x + this.speed.x,
            y: this.pos.y - this.speed.y + gravity
        }
        let tState = state.level.touching(this.pos, nextPos, this.size, "wall");
        let boundaries = tState.tBoundary;
        if (tState.touched) {
            if (!boundaries["left"] && (this.speed.x < 0))
                this.pos.x = nextPos.x;
            else if (boundaries["left"] && (this.speed.x < 0)) {
                this.pos.x = Math.floor(this.pos.x) + 0.0000001;
                this.speed.x = 0;
            }
            if (!boundaries["right"] && (this.speed.x > 0))
                this.pos.x = nextPos.x;
            else if (boundaries["right"] && (this.speed.x > 0)) {
                this.pos.x = Math.floor(nextPos.x) - 0.000001;
                this.speed.x = 0;
            }
            if (!boundaries["bottom"]) {
                jumping = true;
                if (this.speed.y < gravity) this.pos.y = nextPos.y;
            }
            else if (boundaries["bottom"] && (this.speed.y < gravity)) {
                this.pos.y = Math.floor(nextPos.y) - 0.0000001;
                jumping = false;
            }
            if (!boundaries["top"] && (this.speed.y >= gravity)) {
                this.pos.y = nextPos.y;
            }
            else if (boundaries["top"] && (this.speed.y >= gravity)) {
                this.speed.y -= 0.024;
                this.pos.y = Math.ceil(nextPos.y) + 0.0000001;
            }
        }
        else {
            this.pos.x = nextPos.x;
            this.pos.y = nextPos.y;
            jumping = true;
        }
        let tLava = state.level.touching(this.pos, this.pos, this.size, "lava");
        if (tLava.touched)
            state.status = "lost";
    }
}
Player.prototype.size = new Vec(1, 1);

function elt(name, attrs, ...children) {
    let elmt = document.createElement(name);
    for (let attr of Object.keys(attrs))
        elmt.setAttribute(attr, attrs[attr]);
    for (let ch of children)
        elmt.appendChild(ch);
    return elmt;
}

class State {

    constructor(level) {
        this.status = "playing";
        this.level = level;
        this.actors = level.startActors;
        this.player = level.startActors.filter(act => act.type == "player")[0];
        this.coins = level.startActors.filter(act => act.type == "coin")
    }

    update() {
        if (this.status == "lost") {
            coins = 0;
            totalCoins = 0;
            deaths++;
            return new State(new Level(currentLvlPlan.value[1]));
        }
        else if (this.status == "won") {
            currentLvlPlan = levels.next();
            if (!currentLvlPlan.done) {
                coins = 0;
                return new State(new Level(currentLvlPlan.value[1]))
            }
            else
                this.status = "finished";
        }
        else if (this.status == "finished")
            coins = totalCoins;
        return this;
    }
}

class Lava {

    constructor(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }

    get type() { return "lava"; }

    static create(pos, ch) {
        switch (ch) {
            case '|': return new Lava(pos, new Vec(0, 0.15));
            case '-': return new Lava(pos, new Vec(0.15, 0));
        }
    }

    bounceX() {
        this.speed.x *= -1;
    }

    bounceY() {
        this.speed.y *= -1;
    }

    update(state) {
        let nextPos = { x: this.pos.x + this.speed.x, y: this.pos.y + this.speed.y };
        this.pos = nextPos;
        let tState = state.level.touching2(this.pos, nextPos, this.size, "wall");
        if (tState.touched) {
            if (tState.tBoundary.left || tState.tBoundary.right)
                this.bounceX();
            if (tState.tBoundary.top || tState.tBoundary.bottom)
                this.bounceY();
        }
        if (state.level.overlap(state.player, this))
            state.status = "lost";
    }
}

Lava.prototype.size = new Vec(1, 1);

class Coin {

    constructor(pos) {
        this.pos = pos;
        this.basePos = Math.random() * 2 * Math.PI;
    }

    get type() { return "coin"; }

    static create(pos) {
        return new Coin(pos);
    }

    wobble() {
        this.pos.y += Math.sin(this.basePos++ / 10) / 50;
    }

    update(state) {
        this.wobble();
        if (state.level.overlap(state.player, this)) {
            state.coins.pop();
            state.actors = state.actors.filter(act => act != this);
            coins++;
            totalCoins++;
        }
        if (state.coins.length == 0) {
            state.status = "won";
            coins = 0;
        }

    }
}

Coin.prototype.size = new Vec(0.7, 0.7);

function drawActors(actors, parent) {
    for (let actor of actors) {
        let act = elt('div', {
            class: `actor ${actor.type}`,
            style: `height: ${actor.size.y * scale}px; 
                    width: ${actor.size.x * scale}px;
                    left: ${actor.pos.x * scale}px;
                    top: ${(actor.pos.y) * scale}px`
        })
        parent.appendChild(act);
    }
}

let frame = document.getElementById("frame");

const levelChars = {
    "@": Player, "=": "wall", ".": "empty",
    "+": "lava", '-': Lava, '|': Lava, "o": Coin
}

let currentLvlPlan = levels.next();
let currentLvl = new Level(currentLvlPlan.value[1]);
let state = new State(currentLvl);

let gravity = 0.15;
let jumping = false;
let then = Date.now();
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
let keys = {};

function keydown(event) {
    event.preventDefault();
    keys[event.key] = true;
    if (keys["ArrowUp"] && !jumping) { jumping = true; state.player.speed.y = 0.35; }
}

function keyup(event) {
    event.preventDefault();
    keys[event.key] = false;
    state.player.speed.x = 0;
}

function updateDisp(currentState) {
    if (currentState.status != "finished") {
        state = currentState.update();
        let now = Date.now();
        let dif = now - then;
        let actors = Array.from(frame.querySelectorAll('.actor'));

        for (let act of actors) {
            frame.removeChild(act);
        }
        for (let actor of state.actors)
            actor.update(state);
        drawActors(state.actors, frame);
        scrollIntoView(state.player);
        then = now;

        timeEl.textContent = timePlayed(start);
        deathsEl.textContent = `${deaths}`;
        coinsEl.textContent = `${coins}`;

        requestAnimationFrame(() => updateDisp(state));
    }
    else {
        endGame();
    }
    return
}


let animationNumber = requestAnimationFrame(() => updateDisp(state));
let lastPlayerX = state.player.pos.x * scale, lastPlayerY = state.player.pos.y * scale;

function scrollIntoView(el) {
    let posX = el.pos.x * scale;
    let posY = el.pos.y * scale;
    frame.scrollTo(posX - 250, posY - 150)
}


function timePlayed(start) {
    let current = new Date().getTime();
    let lapse = current - start
    let secs = Math.floor(lapse / 1000) % 60;
    let mins = Math.floor(lapse / 1000 / 60) % 60;
    let hrs = Math.floor(lapse / 1000 / 60 / 60);

    return `${hrs < 10 ? "0" + hrs : hrs}:${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`
}

function endGame() {
    function newRecord() {
        localStorage.setItem("lightySquare", JSON.stringify(newScore));
        highestScoreEl.style.display = "none";
        newRecordEl.style.display = "block";
        newRecordEl.classList.add("active");
    }

    function defaultRecord() {
        highestScoreEl.style.display = "table-row";
        newRecordEl.style.display = "none";
        newRecordEl.classList.remove("active");
    }

    const lightySquare = JSON.parse(localStorage.lightySquare);
    const newRecordEl = document.querySelector(".newRecord");
    const highestScoreEl = document.querySelector(".highestScore");
    const endgameMenu = document.querySelector("#endgame");
    const bestTimeEl = document.querySelector(".bestTime");
    const bestLossesEl = document.querySelector(".bestLosses");
    const yourTimeEl = document.querySelector(".yourTime");
    const yourLossesEl = document.querySelector(".yourLosses");

    defaultRecord();

    let newScore = {
        firstGame: false,
        losses: deaths,
        time: timePlayed(start),
    }

    yourTimeEl.textContent = newScore.time;
    yourLossesEl.textContent = newScore.losses;

    let bestScore;

    if (lightySquare) {
        if (lightySquare.firstGame) {
            newRecord();
        }
        else {
            bestScore = lightySquare;
            bestTimeEl.textContent = bestScore.time;
            bestLossesEl.textContent = bestScore.losses;

            let timeReg = new RegExp(/(\d*):(\d{2}):(\d{2})/);
            [_, bstH, bstM, bstS] = timeReg.exec(bestScore.time);
            [_, crH, crM, crS] = timeReg.exec(newScore.time);

            let bestTime = bstH * 60 + bstM * 60 + bstS;
            let newTime = crH * 60 + crM * 60 + crS;


            if (bestTime > newTime)
                newRecord();
            else if (bestTime == newTime) {
                if (bestScore.losses > newScore.losses)
                    newRecord();
            }
        }
    }

    else {
        newRecord();

    }

    endgameMenu.style.display = "block";
}

replay.addEventListener('click', () => {

    coins = 0;
    totalCoins = 0;
    deaths = 0;
    start = new Date().getTime();

    levels = levelStr.entries();
    currentLvlPlan = levels.next();
    currentLvl = new Level(currentLvlPlan.value[1]);
    state = new State(currentLvl);

    document.querySelector("#endgame").style.display = "none";

    welcomePage.classList.add("active");
    window.addEventListener('keyup', startGame);

    function startGame() {
        welcomePage.classList.remove("active");
        window.removeEventListener('keypress', startGame);
        requestAnimationFrame(() => updateDisp(state));
    }

})