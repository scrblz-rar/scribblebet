
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const ui = {
weapon: document.getElementById("weapon"),
money: document.getElementById("money"),
upgrade: document.getElementById("upgradeScreen"),
fight: document.getElementById("fightScreen")
};

let save = {
money: 500,
level: 1,
unlocked: ["sword"]
};

/* ================= WEAPONS ================= */

const weapons = {

sword: {
emoji:"🗡️",
type:"orbit",
dmg:2,
range:25,
onHit(b){ if(Math.random()<0.2) b.damageMult = 1.5; }
},

spear: {
emoji:"🔱",
type:"orbit",
dmg:1,
range:40
},

shield: {
emoji:"🛡️",
type:"orbit",
dmg:1,
onHit(b){
b.resist = Math.min(0.5,(b.resist||0)+0.1);
}
},

unarmed: {
emoji:"👊",
type:"body",
dmg:1,
onHit(b){
let spd = Math.hypot(b.vx,b.vy);
b.dmgBonus = spd*0.3;
}
},

scythe: {
emoji:"☠️",
type:"orbit",
dmg:1,
onHit(b,e){
e.poison = (e.poison||0) + 2;
}
},

lance: {
emoji:"📏",
type:"dash",
dmg:5,
cd:2
},

mace: {
emoji:"🔨",
type:"orbit",
dmg:1
},

shotgun: {
emoji:"🔫",
type:"gun",
pellets:5,
dmg:1
},

statue: {
emoji:"🗿",
type:"transform",
dmg:10
},

vampire: {
emoji:"🧛",
type:"gun",
dmg:2,
lifesteal:true
}

};

/* ================= BALL ================= */

class Ball {

constructor(x,y,w,isPlayer){

this.x=x;
this.y=y;

this.vx=(Math.random()-0.5)*4;
this.vy=(Math.random()-0.5)*4;

this.weapon=w;
this.isPlayer=isPlayer;

this.hp=100+save.level*20;

this.angle=0;

this.poison=0;
this.resist=0;

this.dashCD=0;
this.stoneTimer=0;
this.stone=false;

this.damageMult=1;

}

update(){

/* gravity */
this.vy += 0.25;

/* poison tick */
if(this.poison>0 && !this.stone){
this.hp -= this.poison*0.02;
this.poison -= 0.05;
}

/* dash cooldown */
if(this.dashCD>0) this.dashCD--;

/* statue transform cycle */
if(this.weapon==="statue"){

this.stoneTimer++;

if(this.stoneTimer>180){

this.stone = !this.stone;

this.stoneTimer=0;

if(!this.stone){

/* slam damage */
enemy.hp -= 15;

}

}

}

/* movement */

if(!this.stone){

this.x += this.vx;
this.y += this.vy;

}

/* bounce */

if(this.x<20||this.x>780)this.vx*=-1;

if(this.y>430){
this.y=430;
this.vy*=-0.8;
}

/* stone fall heavy */
if(this.stone){
this.vx*=0.98;
this.vy+=0.3;
}

this.angle+=0.1;

}

/* draw */

draw(){

ctx.beginPath();
ctx.arc(this.x,this.y,15,0,Math.PI*2);
ctx.fillStyle=this.isPlayer?"blue":"red";
ctx.fill();

this.drawWeapon();

}

/* weapon visuals */

drawWeapon(){

let w=weapons[this.weapon];

if(w.type==="orbit"){

let r=w.range;

ctx.fillText(
w.emoji,
this.x+Math.cos(this.angle)*r,
this.y+Math.sin(this.angle)*r
);

}

}

}

/* ================= PROJECTILES ================= */

let projectiles=[];

function shoot(a,b){

let dx=b.x-a.x;
let dy=b.y-a.y;

let d=Math.hypot(dx,dy);

let vx=(dx/d)*6;
let vy=(dy/d)*6;

let w=weapons[a.weapon];

if(w.type==="gun"){

for(let i=0;i<(w.pellets||1);i++){

projectiles.push({
x:a.x,
y:a.y,
vx:vx+(Math.random()-0.5)*2,
vy:vy+(Math.random()-0.5)*2,
owner:a,
dmg:w.dmg
});

}

return;
}

projectiles.push({
x:a.x,
y:a.y,
vx,
vy,
owner:a,
dmg:w.dmg
});

}

/* ================= ENEMY AI ================= */

function enemyAI(){

let dx = p.x - e.x;
let dy = p.y - e.y;

let d = Math.hypot(dx,dy);

e.vx += (dx/d)*0.05;
e.vy += (dy/d)*0.05;

if(Math.random()<0.02){
shoot(e,p);
}

}

/* ================= DASH (LANCE) ================= */

function useDash(b,target){

if(b.weapon!=="lance") return;

if(b.dashCD>0) return;

let dx=target.x-b.x;
let dy=target.y-b.y;

let d=Math.hypot(dx,dy);

b.vx += (dx/d)*8;
b.vy += (dy/d)*8;

target.hp -= 12;

b.dashCD = 120;

}

/* ================= COLLISION ================= */

function hit(a,b){

return Math.hypot(a.x-b.x,a.y-b.y)<18;

}

/* ================= GAME ================= */

let p,e;

function beginFight(){

p=new Ball(100,200,ui.weapon.value,true);
e=new Ball(700,200,"sword",false);

loop();

}

/* ================= LOOP ================= */

function loop(){

ctx.clearRect(0,0,800,500);

enemyAI();

p.update();
e.update();

p.draw();
e.draw();

/* dash if lance */
if(Math.random()<0.01){
useDash(p,e);
}

/* shoot */
if(Math.random()<0.03) shoot(p,e);

/* projectiles */
for(let pr of projectiles){

pr.x+=pr.vx;
pr.y+=pr.vy;

ctx.fillText("•",pr.x,pr.y);

if(hit(pr,p)&&pr.owner!==p){

p.hp -= pr.dmg*(1 - (p.resist||0));

}

if(hit(pr,e)&&pr.owner!==e){

e.hp -= pr.dmg*(1 - (e.resist||0));

}

/* lifesteal */
if(pr.owner.weapon==="vampire"){
pr.owner.hp += 0.5;
}

}

/* poison scaling death */
if(e.poison>5){
e.hp -= 0.1;
}

/* win */
if(e.hp<=0){

save.money += 100;
save.level++;

return;

}

/* lose */
if(p.hp<=0) return;

requestAnimationFrame(loop);

}

/* ================= UI ================= */

function startFight(){

ui.upgrade.classList.add("hidden");
ui.fight.classList.remove("hidden");

}

function back(){

ui.fight.classList.add("hidden");
ui.upgrade.classList.remove("hidden");

}

function update(){

ui.money.innerText="Money: "+save.money;

ui.weapon.innerHTML="";

save.unlocked.forEach(w=>{

let o=document.createElement("option");

o.value=w;
o.textContent=weapons[w].emoji+" "+w;

ui.weapon.appendChild(o);

});

}

update();
