/* ==========================
   厨房小厨神
========================== */

const cookSteps = [

"准备食材",
"打鸡蛋",
"切西红柿",
"炒鸡蛋",
"炒西红柿",
"调味",
"装盘"

];

let cookCompleted = false;

/* ==========================
   创建页面
========================== */

function renderCookGame(){

document.body.innerHTML=`

<div class="cookScene">

    <div class="topBar">

        <button onclick="goHome()">
        🏰 返回大厅
        </button>

        <h1>
        🍅 厨房小厨神
        </h1>

    </div>

    <div class="teacherHint">

        🤖 小智老师：

        请帮助机器人完成
        西红柿炒鸡蛋！

    </div>

    <div class="characterArea">

        <div class="role">

            🍅

            <p>番茄</p>

        </div>

        <div class="role">

            🤖

            <p>厨师机器人</p>

        </div>

        <div class="role">

            🥚

            <p>鸡蛋</p>

        </div>

    </div>

    <div id="cookCards">

    </div>

    <div class="btnArea">

        <button
        onclick="checkCookAnswer()">

        ✔ 检查答案

        </button>

    </div>

    <div id="cookResult">

    </div>

</div>

`;

createCookCards();

teacherSay(
"请把做菜步骤拖动到正确顺序。"
);

}

/* ==========================
   创建步骤卡
========================== */

function createCookCards(){

const shuffled = [

"炒西红柿",
"装盘",
"打鸡蛋",
"调味",
"炒鸡蛋",
"准备食材",
"切西红柿"

];

const box =
document.getElementById("cookCards");

box.innerHTML="";

shuffled.forEach(step=>{

const div =
document.createElement("div");

div.className="cookCard";

div.draggable=true;

div.innerText=step;

box.appendChild(div);

});

initDrag();

}

/* ==========================
   拖拽功能
========================== */

function initDrag(){

let dragged=null;

document
.querySelectorAll(".cookCard")

.forEach(card=>{

card.addEventListener(

"dragstart",

()=>{

dragged=card;

}

);

card.addEventListener(

"dragover",

e=>{

e.preventDefault();

}

);

card.addEventListener(

"drop",

e=>{

e.preventDefault();

const parent=
card.parentNode;

parent.insertBefore(
dragged,
card
);

}

);

});

}

/* ==========================
   检查答案
========================== */

function checkCookAnswer(){

const current=[

...document.querySelectorAll(
".cookCard"
)

].map(

x=>x.innerText

);

if(

JSON.stringify(current)
===

JSON.stringify(cookSteps)

){

cookSuccess();

}else{

cookError();

}

}

/* ==========================
   成功
========================== */

function cookSuccess(){

if(cookCompleted) return;

cookCompleted=true;

teacherSay(

"太棒了，同学们已经掌握了算法的有序性。"

);

document
.getElementById("cookResult")

.innerHTML=

`
<div class="successBox">

🎉🎉🎉

<h2>
西红柿炒鸡蛋完成！
</h2>

🍅 ➜ 🍳

⭐ 获得成就：

厨房达人

</div>
`;

unlockAchievement(
"厨房达人"
);

playSuccessEffect();

}

/* ==========================
   错误
========================== */

function cookError(){

teacherSay(

"步骤顺序不正确，再观察一下哦。"

);

document
.getElementById("cookResult")

.innerHTML=

`
<div class="errorBox">

💥 锅烧糊啦！

请重新排列步骤！

</div>
`;

}

/* ==========================
   动画特效
========================== */

function playSuccessEffect(){

for(let i=0;i<30;i++){

let star=
document.createElement("div");

star.className="star";

star.innerHTML="⭐";

star.style.left=
Math.random()*100+"vw";

star.style.top=
Math.random()*50+"vh";

document.body.appendChild(
star
);

setTimeout(()=>{

star.remove();

},3000);

}

}