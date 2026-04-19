
/* =========================
   SAVE DATA
========================= */

let save =
JSON.parse(
localStorage.getItem("scribbleSave")
) || {

money: 500,

unlocked: ["sword"],

hp: 100,

damage: 10

};

/* =========================
   WEAPONS
========================= */

const weapons = {

sword: {

type: "orbit",

damage: 10,

passive: "Spin speed increases"

},

spear: {

type: "orbit",

damage: 15,

passive: "First strike bonus"

},

shield: {

type: "orbit",

damage: 6,

passive: "Damage reduction"

},

shotgun: {

type: "projectile",

damage: 8,

passive: "Fires multiple pellets"

},

vampire: {

type: "projectile",

damage: 7,

passive: "Lifesteal"

},

unarmed: {

type: "none",

damage: 5,

passive: "Fast movement"

}

};

/* =========================
   UI SETUP
========================= */

function updateWeaponSelect() {

let select =
document.getElementById("weaponSelect");

select.innerHTML = "";

save.unlocked.forEach(w => {

let option =
document.createElement("option");

option.value = w;

option.textContent =
w +
" (" +
weapons[w].passive +
")";

select.appendChild(option);

});

}

function updateMoney() {

document.getElementById(
"moneyDisplay"
).innerText =

"Money: $" +
save.money;

}

updateWeaponSelect();
updateMoney();

/* =========================
   UPGRADE SYSTEM
========================= */

function buyUpgrade(type) {

if (type === "hp") {

if (save.money >= 50) {

save.money -= 50;

save.hp += 20;

}

}

if (type === "damage") {

if (save.money >= 75) {

save.money -= 75;

save.damage += 5;

}

}

saveGame();

updateMoney();

}

function saveGame() {

localStorage.setItem(
"scribbleSave",
JSON.stringify(save)
);

}

/* =========================
   SCREEN SWITCHING
========================= */

function goToFight() {

document
.getElementById("upgradeScreen")
.classList.add("hidden");

document
.getElementById("fightScreen")
.classList.remove("hidden");

}

function returnToUpgrade() {

document
.getElementById("fightScreen")
.classList.add("hidden");

document
.getElementById("upgradeScreen")
.classList.remove("hidden");

}

/* =========================
   BALL CLASS
========================= */

class Ball {

constructor(x, y, weapon) {

this.x = x;
this.y = y;

this.vx =
(Math.random() - 0.5) * 4;

this.vy =
(Math.random() - 0.5) * 4;

this.hp = save.hp;

this.weapon = weapon;

this.weaponAngle = 0;

}

update() {

this.x += this.vx;
this.y += this.vy;

if (this.x < 10 ||
this.x > 590)
this.vx *= -1;

if (this.y < 10 ||
this.y > 390)
this.vy *= -1;

this.weaponAngle += 0.1;

}

draw(ctx) {

ctx.beginPath();

ctx.arc(
this.x,
this.y,
15,
0,
Math.PI * 2
);

ctx.fillStyle = "cyan";

ctx.fill();

this.drawWeapon(ctx);

}

drawWeapon(ctx) {

if (
weapons[this.weapon].type
=== "orbit"
) {

let wx =
this.x +
Math.cos(
this.weaponAngle
) * 25;

let wy =
this.y +
Math.sin(
this.weaponAngle
) * 25;

ctx.beginPath();

ctx.arc(
wx,
wy,
6,
0,
Math.PI * 2
);

ctx.fillStyle = "yellow";

ctx.fill();

}

}

}

/* =========================
   FIGHT SYSTEM
========================= */

let canvas =
document.getElementById("arena");

let ctx =
canvas.getContext("2d");

let playerBall;
let enemyBall;

function startFight() {

let bet =
parseInt(
document.getElementById(
"betInput"
).value
);

if (bet > save.money)
return;

save.money -= bet;

let weapon =
document.getElementById(
"weaponSelect"
).value;

playerBall =
new Ball(100, 200, weapon);

enemyBall =
new Ball(500, 200, randomEnemyWeapon());

fightLoop(bet);

}

/* =========================
   RANDOM ENEMY
========================= */

function randomEnemyWeapon() {

let list =
Object.keys(weapons);

return list[
Math.floor(
Math.random() *
list.length
)
];

}

/* =========================
   COLLISION
========================= */

function checkCollision(a, b) {

let dx =
a.x - b.x;

let dy =
a.y - b.y;

let dist =
Math.sqrt(dx*dx + dy*dy);

return dist < 30;

}

/* =========================
   MAIN LOOP
========================= */

function fightLoop(bet) {

ctx.clearRect(
0,
0,
600,
400
);

playerBall.update();
enemyBall.update();

playerBall.draw(ctx);
enemyBall.draw(ctx);

if (
checkCollision(
playerBall,
enemyBall
)
) {

enemyBall.hp -= save.damage;

playerBall.hp -= 5;

}

/* Unlock weapon if defeated */

if (enemyBall.hp <= 0) {

unlockWeapon(enemyBall.weapon);

save.money += bet * 2;

saveGame();

updateMoney();

return;

}

if (playerBall.hp <= 0) {

saveGame();

updateMoney();

return;

}

requestAnimationFrame(
() =>
fightLoop(bet)
);

}

/* =========================
   UNLOCK SYSTEM
========================= */

function unlockWeapon(w) {

if (
!save.unlocked.includes(w)
) {

save.unlocked.push(w);

updateWeaponSelect();

}

}
