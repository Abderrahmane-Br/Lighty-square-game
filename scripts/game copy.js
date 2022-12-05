let level = `
======================================
....===...............................
......................................
==.....=..............................
......................................
......................+...............
........=.............................
......................................
....===...............................
...=...=..............................
..=.....=.............................
......................................
.........@.=........=.++++............
======================================
======================================`;
let level2 = `
......
....=.
....=.
@...=.
======`

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
                this.startActors.push(type.create(new Vec(x, y)));
                return "empty";
            })
        })
        this.displayLevel(this.buildLvl(), this.startActors);
    }
    touching(pos, size , type) {
        let x = Math.floor(state.player.pos.x);
        let xs = Math.floor(x + size.x);
        let y = Math.floor(state.player.pos.y);
        let ys = Math.floor(y + size.y);
        let nextMinX = Math.floor(pos.x);
        let nextMaxX = Math.floor(pos.x + size.x);
        let nextMinY = Math.floor(pos.y);
        let nextMaxY = Math.floor(pos.y + size.y);
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
        if(this.rows[nextMaxY][x] == type || this.rows[nextMaxY][xs] == type) {
            tBoundary.bottom = true;
            tState.touched = true;
        }
        if(!tBoundary.bottom){
            if (this.rows[nextMinY][nextMinX] == type || this.rows[nextMaxY][nextMinX] == type) {
                tBoundary.left = true;
                tState.touched = true;
            }
            if (this.rows[nextMinY][nextMaxX] == type || this.rows[nextMaxY][nextMaxX] == type) {
                tBoundary.right = true;
                tState.touched = true;
            }
        }
        else {
            if (this.rows[y][nextMinX] == type || this.rows[ys][nextMinX] == type) {
                tBoundary.left = true;
                tState.touched = true;
            }
            if (this.rows[y][nextMaxX] == type || this.rows[ys][nextMaxX] == type) {
                tBoundary.right = true;
                tState.touched = true;
            }
        }
        if (this.rows[nextMinY][x] == type || this.rows[nextMinY][xs] == type) {
            tBoundary.top = true;
            tState.touched = true;
        }
        if (!tBoundary.top) {
            if (this.rows[nextMinY][nextMinX] == type) {
                tBoundary.left = true;
                tState.touched = true;
            }
            if (this.rows[nextMinY][nextMaxX] == type) {
                tBoundary.right = true;
                tState.touched = true;
            }
        }
        
        // if (this.rows[nextMaxY][x] == type ||
        //     this.rows[nextMaxY][xs] == type) {
        //     tBoundary.bottom = true;
        //     tState.touched = true;
        // }
        // if (!tBoundary.bottom) {
        //     if (this.rows[nextMaxY][nextMaxX] == type || this.rows[y][nextMaxX] == type ||
        //         this.rows[ys][nextMaxX] == type || (nextMaxX >= this.width)) {
        //         tBoundary.right = true;
        //         tState.touched = true;
        //     }
        // }
        // else if (this.rows[y][nextMaxX] == type ||
        //     this.rows[ys][nextMaxX] == type || (nextMaxX >= this.width)) {
        //     tBoundary.right = true;
        //     tState.touched = true;
        // }
        // if (this.rows[y][nextMinX] == type ||
        //     this.rows[ys][nextMinX] == type || (pos.x < 0)) {
        //     tBoundary.left = true;
        //     tState.touched = true;
        // }
        // if (this.rows[nextMinY][x] == type ||
        //     this.rows[nextMinY][xs] == type || (pos.y < 0)) //minus one bcz of the player's height wich is greater than 1 and being shifted higher so it's base get aligned with the floor
        // {
        //     tBoundary.top = true;
        //     tState.touched = true;
        // }
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
    // frame = elt('div', { class: 'frame' })
    frame.innerHTML = '';
    frame.appendChild(levelEl);
    drawActors(actors, frame);
    
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
        if ( this.speed.y > 0) 
            this.speed.y -= 0.005;
            
        if (keys["ArrowLeft"]) this.speed.x = -0.13;
        if (keys["ArrowRight"]) this.speed.x = 0.13;
        let nextPos = {
            x: this.pos.x + this.speed.x,
            y: this.pos.y - this.speed.y + gravity
        }
        let tState = state.level.touching(nextPos, this.size, "wall");
        let boundaries = tState.tBoundary;
        if (tState.touched) {
            if (!boundaries["left"] && (this.speed.x < 0))
                this.pos.x = nextPos.x;
            else if (boundaries["left"] && (this.speed.x < 0))
                this.pos.x = Math.floor(this.pos.x) + 0.0000001;
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
        let tLava = state.level.touching(this.pos, this.size, "lava");
        if(tLava.touched)
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
    }
    update() {
        if (this.status == "lost")
            return new State( new Level(level));
        return this;
    }
}
function drawActors(actors, parent) {
    for (let actor of actors) {
        let act = elt('div', {
            class: `actor ${actor.type}`,
            style: `height: ${actor.size.y * scale}px; 
                    width: ${actor.size.x * scale}px;
                    left: ${actor.pos.x * scale}px;
                    top: ${(actor.pos.y - actor.size.y % Math.floor(actor.size.y)) * scale}px`
        })
        parent.appendChild(act);
    }
}
let frame = elt('div', { class: 'frame' });
document.body.appendChild(frame);
const levelChars = {
    "@": Player, "=": "wall", ".": "empty",
    "+": "lava"
}
let currentLvl = new Level(level);
let state = new State(currentLvl);
// currentLvl.displayLevel(currentLvl.buildLvl(), state.actors);
////////////////////
///////////////////
// let speed = 0, this.speed.y = 0;
let gravity = 0.15;
let jumping = false;
let then = Date.now();
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
let keys = {};
function keydown() {
    event.preventDefault();
    keys[event.key] = true;
    if (keys["ArrowUp"] && !jumping) { jumping = true; state.player.speed.y = 0.35; }
}
function keyup() {
    event.preventDefault();
    keys[event.key] = false;
    state.player.speed.x = 0;
}
function updateDisp(currentState) {
    state = currentState.update();
    let now = Date.now();
    let dif = now - then;
    let actors = Array.from(frame.querySelectorAll('.actor'));
    if (dif > 1000 / 200) {
        for (let act of actors) {
            frame.removeChild(act);
        }
        state.player.update(state);
        drawActors(state.actors, frame)
        then = now;
    }
    requestAnimationFrame(() => updateDisp(state));
}
updateDisp(state);



// window.addEventListener('keydown', (e) => {
//     e.preventDefault();
//     if (e.key == "ArrowRight") {
//         state.player.pos.x+=0.2;
//         console.log('here');
//         updateDisplay(state.player);
//     }
// })
// function updateDisplay(actor) {
//     requestAnimationFrame(()=> {
//         let player = document.getElementsByClassName('player')[0];
//         let frame = document.getElementsByClassName('frame')[0];
//         frame.removeChild(player);
//         drawActors([new Player(actor.pos)], frame)
//     })
// }