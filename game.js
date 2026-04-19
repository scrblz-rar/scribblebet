
/* =========================
SAVE DATA
========================= */

let save =
JSON.parse(
localStorage.getItem("scribbleSave")
) || {

money: 500,

unlocked: ["sword"],

level: 1

};

/* =========================
WEAPONS WITH PROJECTILES
========================= */

const weapons = {

sword: {
tier: 0,
emoji: "🗡️",
type: "orbit",
damage: 2,
range: 25
},

spear: {
tier: 0,
emoji: "🔱",
type: "orbit",
damage: 1,
range: 37
},

shield: {
tier: 0,
emoji: "🛡️",
type: "orbit",
damage: 1,
range: 25
},

unarmed: {
tier: 1,
emoji: "👊",
type: "body",
damage: 1
},

scythe: {
tier: 1,
emoji: "☠️",
type: "orbit",
damage: 1
},

lance: {
tier: 2,
emoji: "📏",
type: "orbit",
damage: 5
},

mace: {
tier: 2,
emoji: "🔨",
type: "orbit",
damage: 1
},

shotgun: {
tier: 3,
emoji: "🔫",
type: "projectile",
damage: 1,
pellets: 5
},

statue: {
tier: 3,
emoji: "🗿",
type: "body",
damage: 10
},

vampire: {
tier: 4,
emoji: "🧛",
type: "projectile",
damage: 2,
lifesteal: true
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
weapons[w].emoji +
" " +
w;

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
SCREEN SWITCH
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

constructor(x, y, weaponName) {

this.weaponName =
weaponName;

this.weapon =
weapons[weaponName];

this.x = x;
this.y = y;

this.vx =
(Math.random() - 0.5) * 6;

this.vy =
(Math.random() - 0.5) * 4;

this.weaponAngle = 0;

this.level = save.level;

this.maxHp =
100 + this.level * 25;

this.hp =
this.maxHp;

}

update() {

/* Gravity */

this.vy += 0.25;

/* Movement */

this.x += this.vx;
this.y += this.vy;

/* Walls */

if (this.x < 15 ||
this.x > 685)

this.vx *= -1;

/* Floor */

if (this.y > 435) {

this.y = 435;

this.vy *= -0.8;

}

this.weaponAngle += 0.1;

}

draw(ctx, color) {

/* Ball */

ctx.beginPath();

ctx.arc(
this.x,
this.y,
15,
0,
Math.PI * 2
);

ctx.fillStyle = color;

ctx.fill();

/* Weapon */

this.drawWeapon(ctx);

}

drawWeapon(ctx) {

let weapon =
this.weapon;

if (weapon.type === "orbit") {

let wx =
this.x +
Math.cos(
this.weaponAngle
) *
weapon.range;

let wy =
this.y +
Math.sin(
this.weaponAngle
) *
weapon.range;

ctx.font = "18px Arial";

ctx.fillText(
weapon.emoji,
wx - 8,
wy + 6
);

}

/* PROJECTILE WEAPONS */

if (
weapon.type === "projectile"
) {

if (Math.random() < 0.02) {

fireProjectile(this);

}

}

}

}

/* =========================
PROJECTILES
========================= */

let projectiles = [];

class Projectile {

constructor(x, y, vx, vy, owner) {

this.x = x;
this.y = y;

this.vx = vx;
this.vy = vy;

this.owner = owner;

}

update() {

this.x += this.vx;
this.y += this.vy;

}

draw(ctx) {

ctx.font = "14px Arial";

ctx.fillText(
"•",
this.x,
this.y
);

}

}

function fireProjectile(ball) {

let target =
(ball === playerBall)
? enemyBall
: playerBall;

let dx =
target.x - ball.x;

let dy =
target.y - ball.y;

let dist =
Math.sqrt(dx*dx + dy*dy);

let speed = 6;

let vx =
(dx / dist) * speed;

let vy =
(dy / dist) * speed;

let weapon =
ball.weapon;

if (weapon.emoji === "🔫") {

/* Shotgun pellets */

for (let i = 0; i <
weapon.pellets; i++) {

let spread =
(Math.random() - 0.5) * 2;

projectiles.push(
new Projectile(
ball.x,
ball.y,
vx + spread,
vy + spread,
ball
)
);

}

}

else {

/* Single shot */

projectiles.push(
new Projectile(
ball.x,
ball.y,
vx,
vy,
ball
)
);

}

}

/* =========================
COLLISION
========================= */

function checkProjectileHit(p, target) {

let dx =
p.x - target.x;

let dy =
p.y - target.y;

let dist =
Math.sqrt(dx*dx + dy*dy);

return dist < 15;

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
new Ball(150, 100, weapon);

enemyBall =
new Ball(
550,
100,
randomEnemyWeapon()
);

fightLoop(bet);

}

/* =========================
ENEMY RANDOM TIER
========================= */

function randomEnemyWeapon() {

let level =
save.level;

let tier =
Math.min(
Math.floor(level / 3),
4
);

let possible =
Object.keys(weapons)
.filter(w =>
weapons[w].tier <= tier
);

return possible[
Math.floor(
Math.random() *
possible.length
)
];

}

/* =========================
MAIN LOOP
========================= */

function fightLoop(bet) {

ctx.clearRect(
0,
0,
700,
450
);

/* Update balls */

playerBall.update();
enemyBall.update();

/* Draw */

playerBall.draw(ctx, "#00aaff");

enemyBall.draw(ctx, "#ff4444");

/* Projectiles */

projectiles.forEach(p => {

p.update();

p.draw(ctx);

/* Hit player */

if (
checkProjectileHit(
p,
playerBall
) &&
p.owner !== playerBall
) {

playerBall.hp -= 2;

}

/* Hit enemy */

if (
checkProjectileHit(
p,
enemyBall
) &&
p.owner !== enemyBall
) {

enemyBall.hp -= 2;

}

});

/* Remove offscreen */

projectiles =
projectiles.filter(p =>
p.x > 0 &&
p.x < 700 &&
p.y > 0 &&
p.y < 450
);

/* Win */

if (enemyBall.hp <= 0) {

unlockWeapon(
enemyBall.weaponName
);

save.money += bet * 2;

save.level++;

saveGame();

updateMoney();

return;

}

/* Lose */

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

function saveGame() {

localStorage.setItem(
"scribbleSave",
JSON.stringify(save)
);

}
