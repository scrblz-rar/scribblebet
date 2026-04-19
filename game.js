/* =========================
SAVE
========================= */

let save =
JSON.parse(localStorage.getItem("scribble")) || {

money: 500,

unlocked: ["sword"],

level: 1

};

/* =========================
WEAPONS (FULL SYSTEM)
========================= */

const weapons = {

/* Tier 0 */

sword: {
tier: 0,
emoji: "🗡️",
type: "orbit",
damage: 2,
range: 25,

onDamageTaken(b) {
if (Math.random() < 0.25)
b.damageMult += 0.5;
}

},

spear: {
tier: 0,
emoji: "🔱",
type: "orbit",
damage: 1,
range: 40,

onEquip(b) {
b.rangeBoost = 2;
}

},

shield: {
tier: 0,
emoji: "🛡️",
type: "orbit",
damage: 1,

onDamageTaken(b) {
b.resist = Math.min(0.5, (b.resist || 0) + 0.1);
}

},

/* Tier 1 */

unarmed: {
tier: 1,
emoji: "👊",
type: "body",
damage: 1,

onHit(b) {
b.vx *= 1.15;
b.vy *= 1.15;
}

},

scythe: {
tier: 1,
emoji: "☠️",
type: "orbit",
damage: 1,

onHit(b, e) {
e.poison = (e.poison || 0) + 3;
}
},

/* Tier 2 */

lance: {
tier: 2,
emoji: "📏",
type: "lunge",
damage: 5,
cd: 3
},

mace: {
tier: 2,
emoji: "🔨",
type: "orbit",
damage: 1
},

/* Tier 3 */

shotgun: {
tier: 3,
emoji: "🔫",
type: "projectile",
pellets: 5,
damage: 1
},

statue: {
tier: 3,
emoji: "🗿",
type: "stone",
damage: 10
},

/* Tier 4 */

vampire: {
tier: 4,
emoji: "🧛",
type: "projectile",
damage: 2,
lifesteal: true
}

};

/* =========================
BALL
========================= */

class Ball {

constructor(x,y,w) {

this.x=x;
this.y=y;

this.vx=(Math.random()-0.5)*5;
this.vy=(Math.random()-0.5)*5;

this.weapon=weapons[w];

this.hp=100+save.level*25;

this.weaponAngle=0;

this.poison=0;

this.resist=0;

this.damageMult=1;

this.rangeBoost=0;

this.lungeCD=0;

this.stone=false;

}

update() {

/* gravity */

this.vy += 0.25;

/* poison tick */

if(this.poison>0){

this.hp -= 0.2;
this.poison -= 0.1;

}

/* movement */

this.x+=this.vx;
this.y+=this.vy;

/* bounce */

if(this.x<20||this.x>780)this.vx*=-1;

if(this.y>480){

this.y=480;
this.vy*=-0.8;

}

/* stone mode */

if(this.stone){

this.hp -= -0.05; // invincible vibe
}

this.weaponAngle+=0.1;

}

draw(ctx){

ctx.beginPath();
ctx.arc(this.x,this.y,15,0,Math.PI*2);
ctx.fillStyle="black";
ctx.fill();

this.drawWeapon(ctx);

}

drawWeapon(ctx){

let w=this.weapon;

if(w.type==="orbit"){

let r=w.range+(this.rangeBoost||0);

ctx.fillText(
w.emoji,
this.x+Math.cos(this.weaponAngle)*r,
this.y+Math.sin(this.weaponAngle)*r
);

}

}

}

/* =========================
PROJECTILES
========================= */

let projectiles=[];

function shoot(b,target){

let dx=target.x-b.x;
let dy=target.y-b.y;

let d=Math.sqrt(dx*dx+dy*dy);

let vx=(dx/d)*6;
let vy=(dy/d)*6;

let w=b.weapon;

/* shotgun */

if(w.emoji==="🔫"){

for(let i=0;i<w.pellets;i++){

projectiles.push({
x:b.x,
y:b.y,
vx:vx+(Math.random()-0.5)*2,
vy:vy+(Math.random()-0.5)*2,
owner:b
});

}

return;

}

projectiles.push({
x:b.x,
y:b.y,
vx,
vy,
owner:b
});

}

/* =========================
GAME
========================= */

let canvas=document.getElementById("arena");
let ctx=canvas.getContext("2d");

let p,e;

function startFight(){

p=new Ball(100,200,weaponSelect.value);
e=new Ball(700,200,random());

fight();

}

/* enemy tier */

function random(){

let keys=Object.keys(weapons);

return keys[Math.floor(Math.random()*keys.length)];

}

/* collision */

function hit(a,b){

return Math.hypot(a.x-b.x,a.y-b.y)<18;

}

/* loop */

function fight(){

ctx.clearRect(0,0,800,500);

p.update();
e.update();

p.draw(ctx);
e.draw(ctx);

/* shoot */

if(Math.random()<0.03)shoot(p,e);
if(Math.random()<0.03)shoot(e,p);

/* projectiles */

for(let i=0;i<projectiles.length;i++){

let pr=projectiles[i];

pr.x+=pr.vx;
pr.y+=pr.vy;

ctx.fillText("•",pr.x,pr.y);

if(hit(pr,p)&&pr.owner!==p){

p.hp-=2;

if(e.weapon.lifesteal)e.hp+=1;

}

if(hit(pr,e)&&pr.owner!==e){

e.hp-=2;

if(p.weapon.lifesteal)p.hp+=1;

}

}

/* win */

if(e.hp<=0){

save.money+=100;
save.level++;

localStorage.setItem("scribble",JSON.stringify(save));

return;

}

/* lose */

if(p.hp<=0)return;

requestAnimationFrame(fight);

}

/* =========================
UI
========================= */

function goToFight(){

upgradeScreen.classList.add("hidden");
fightScreen.classList.remove("hidden");

}

function returnToUpgrade(){

fightScreen.classList.add("hidden");
upgradeScreen.classList.remove("hidden");

}
