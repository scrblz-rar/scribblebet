let run = {
    money: 100,
    luck: 1,
    multiplier: 1
};

const shopItems = [
    {name:"+1 Luck", cost:50, effect:()=>run.luck++},
    {name:"x2 Multiplier", cost:120, effect:()=>run.multiplier*=2}
];

/* UI */
function updateUI(){
    money.innerText = run.money;
    luck.innerText = run.luck;
    mult.innerText = run.multiplier;
    renderShop();
}
