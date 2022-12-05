let level =`
======================================
....===...............................
......................................
==.....=..............................
......................................
......................................
.......................=..............
.......................=..............
....====...............=..............
.....................===..............
..........=====........=......=.......
............=..........=.....==.......
............=..........=..............
.@..........=..........=..............
======================================
======================================`;
let level2 = `.@..
====
====`
const scale = 30;
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
    }
    touching(pos, size, type) {
        let x = Math.floor(state.player.pos.x);
        let xs = Math.floor(x + size.x);
        let y = Math.floor(state.player.pos.y);
        let ys = Math.floor(y +size.y);
        let minX = Math.floor(pos.x);
        let maxX = Math.floor(pos.x + size.x);
        let minY = Math.floor(pos.y);
        let maxY = Math.floor(pos.y + size.y);
        console.log("minX ", minX, 'maxX ', maxX, "minY ", minY, 'maxY ', maxY);
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
        if (this.rows[maxY][x] == type ||
            this.rows[maxY][xs] == type) {
            tBoundary.bottom = true;
            tState.touched = true;
            }
        if (this.rows[y][maxX] == type ||
            this.rows[ys][maxX] == type || (pos.x + size.x > this.width)) {
                tBoundary.right = true;
                tState.touched = true;
                }
        if (this.rows[y][minX] == type ||
            this.rows[ys][minX] == type || (pos.x < 0)) {
                tBoundary.left = true;
                tState.touched = true;
            }
        if (this.rows[minY][x] == type ||
            this.rows[minY][xs] == type || (pos.y < 0)) //minus one bcz of the player's height wich is greater than 1 and being shifted higher so it's base get aligned with the floor
        {
            tBoundary.top = true;
            tState.touched = true;
        }

        // if (this.rows[maxY][minX] == type || 
        //     this.rows[maxY][maxX] == type) {
        //     tBoundary.bottom = true;
        //     tState.touched = true;
        //     if (this.rows[minY][maxX] == type || (pos.x + size.x > this.width))
        //         tBoundary.right = true;
        //     if (this.rows[minY][minX] == type || (pos.x < 0)) 
        //         tBoundary.left = true;

        // } else {
        //     if (this.rows[minY][maxX] == type ||
        //         this.rows[maxY][maxX] == type || (pos.x + size.x > this.width)) {
        //         tBoundary.right = true;
        //         tState.touched = true;
        //         }
        //     if (this.rows[minY][minX] == type ||
        //         this.rows[maxY][minX] == type || (pos.x < 0)) {
        //         tBoundary.left = true;
        //         tState.touched = true;
        //     }
        // }
        // if (this.rows[minY][minX] == type || 
        //     this.rows[minY][maxX] == type) //minus one bcz of the player's height wich is greater than 1 and being shifted higher so it's base get aligned with the floor
        // {
        //     tBoundary.top = true;
        //     tState.touched = true;
        // }
        // if ((pos.x + size.x > this.width) || (pos.x < 0) ||
        //     (pos.y + size.y > this.height) || (pos.y < 0)) {
        //     tBoundary.isOut = true;
        //     tState.touched = true;
        // }

        return tState;
    }
}
class Player {
    constructor(pos) {
        this.pos = pos;
    }
    get type() { return "player"; }
    static create(pos) {
        return new Player(new Vec(pos.x, pos.y));
    }
    update(state) {
        if(jumping && PlayerSpeedY>0){
            PlayerSpeedY-=0.005;
            // PlayerSpeed = 0
        }
        else 
            PlayerSpeedY = 0;
        if(keys["ArrowLeft"]) PlayerSpeed = -0.13;
        if(keys["ArrowRight"]) PlayerSpeed = 0.13;
        let nextPos = {
            x:this.pos.x + PlayerSpeed,
            y: this.pos.y - PlayerSpeedY + gravity
        }
        let tState = state.level.touching(nextPos, this.size, "wall");
        console.log(tState);
        let boundaries = tState.tBoundary;
        if (tState.touched) {
            if (!boundaries["left"] && (PlayerSpeed < 0))
                this.pos.x = nextPos.x;
            // else if (boundaries["left"] && (PlayerSpeed < 0))
                    // this.pos.x = Math.floor(this.pos.x)+0.001;
            if (!boundaries["right"] && (PlayerSpeed > 0))
                this.pos.x = nextPos.x;
            // else if (boundaries["right"] && (PlayerSpeed > 0))
                // this.pos.x = Math.ceil(this.pos.x)-0.001;
            if (!boundaries["bottom"] && PlayerSpeedY < gravity)
                this.pos.y = nextPos.y;
            else if (boundaries["bottom"] && (PlayerSpeedY <gravity)) {
                    // this.pos.y = Math.ceil(this.pos.y)-0.001;
                    jumping = false;
                }
            if(!boundaries["top"] && (PlayerSpeedY >= gravity)) {
                this.pos.y = nextPos.y;
            }
            else if (boundaries["top"] && (PlayerSpeedY >= gravity)) {
                PlayerSpeedY -=0.024;
                this.pos.y = Math.floor(this.pos.y) + 0.001;
            }
        }
        else {
            this.pos.x = nextPos.x;
            this.pos.y = nextPos.y;
        }
        tState = state.level.touching(nextPos, this.size, "lava");
        if (tState)
            state.status = "lost";
    }
}
Player.prototype.size = new Vec(1, 1);
class Lava {
    constructor(pos) {
        this.pos = pos;
    }
    get type() { return "lava"; }
    static create(pos) {
        return new Lava(new Vec(pos.x, pos.y))
    }
    update(state) {

    }
}
Lava.prototype.size = new Vec(1, 1);
class Coin {

}
// class Wall {
//     constructor(pos) {
//         this.pos = pos;
//     }
// }
// Wall.prototype.size = new Vec(2, 2);
function elt(name, attrs, ...children) {
    let elmt = document.createElement(name);
    for (let attr of Object.keys(attrs))
        elmt.setAttribute(attr, attrs[attr]);
    for (let ch of children)
        elmt.appendChild(ch);
    return elmt;
}
function buildLvl(lvl) {
    return elt('table', {
        width: lvl.rows[0].length * scale,
        height: lvl.rows.length * scale
    }, ...lvl.rows.map(row =>
        elt('tr', {}, ...row.map(el =>
            elt('td', { class: el, style: `height : ${scale}px; width: ${scale}px;` })))))
}
class State {
    constructor(level) {
        let player;
        this.status = "playing";
        this.level = level;
        this.actors = level.startActors;
        this.player = level.startActors.filter(act => act.type == "player")[0];
    }
    update() {
        if(this.status == "lost")
            return new State(this.level);
    }
}
function drawActor(actors, parent) {
    for (let actor of actors) {
        let act = elt('div', {
            class: `actor ${actor.type}`,
            style: `height: ${actor.size.y * scale}px; 
                    width: ${actor.size.x * scale}px;
                    left: ${actor.pos.x * scale}px;
                    top: ${(actor.pos.y - actor.size.y % Math.floor(actor.size.y)) * scale}px`
        })
        // act.setAttribute('class', `actor ${actor.type}`);
        // act.style.width = `${actor.size.x * scale}px`;
        // act.style.height = `${actor.size.y * scale}px`;
        // act.style.left = `${actor.pos.x * scale}px`;
        // act.style.top = `${(actor.pos.y - actor.size.y % Math.floor(actor.size.y)) * scale}px`;
        parent.appendChild(act);
    }
}
let frame = elt('div', { class: 'frame' });
function displayLevel(levelEl, actors) {
    frame.appendChild(levelEl);
    drawActor(actors, frame);
    document.body.appendChild(frame);
}
const levelChars = {
    "@": Player, "=": "wall", ".": "empty",
    "+": "lava"
}
let lvl1 = new Level(level);
let state = new State(lvl1);
let grid = buildLvl(lvl1);
console.log(state.actors);
displayLevel(grid, lvl1.startActors);
////////////////////
///////////////////
let PlayerSpeed = 0, PlayerSpeedY = 0;
let gravity = 0.13;
let jumping = false;
let then = Date.now();
window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
let keys = {};
function keydown() {
    event.preventDefault();
    keys[event.key] = true;
    if (keys["ArrowUp"] && !jumping) { jumping = true; PlayerSpeedY = 0.35; }
    /*let key = window.event.key;
    if(key == 'ArrowUp') {
        if(!jumping) {
            jumping = true;
            PlayerSpeedY = 15/scale;
        }
        // console.log('uppp');
    }
    if (key == 'ArrowLeft') 
    PlayerSpeed = -5/scale;
    if (key == 'ArrowRight')
    PlayerSpeed = 5/scale;*/
}
function keyup() {
    event.preventDefault();
    keys[event.key] = false;
    PlayerSpeed = 0;
    // if(window.event.key != "ArrowUp")
    //        PlayerSpeed = 0;
}
function updateDisp(state) {
    let now = Date.now();
    let dif = now - then;
    let actors = Array.from(frame.querySelectorAll('.actor'));
    if (dif > 1000 / 120) {
        for (let act of actors) {
            frame.removeChild(act);
        }
        state.actors.forEach(actor => actor.update(state));
        drawActor(state.actors, frame)
        then = now;
    }
    requestAnimationFrame(() => updateDisp(state));
}
updateDisp(state);
// console.log(state.player);
// console.log(Object.keys(lvl1.touching(state.player)));



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
//         drawActor([new Player(actor.pos)], frame)
//     })
// }