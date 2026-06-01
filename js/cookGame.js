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
let cookAttempts = 0;
let cookStartTime = { value: 0 };
let cookBestAccuracy = 0;

/* ==========================
   创建页面
   ========================== */

function renderCookGame(){
    cookCompleted = false;
    cookAttempts = 0;
    cookBestAccuracy = 0;
    stopTimer();

    document.body.innerHTML=`

<div class="cookScene">

    <div class="topBar">

        <button onclick="goHome()">
        🏰 返回大厅
        </button>

        <h1>
        🍅 厨房小厨神
        </h1>

        <div class="gameStats">
            <span>⏱️ <span id="cookTimer">0秒</span></span>
            <span>📝 第 <span id="cookAttempt">0</span> 次尝试</span>
        </div>

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
    startTimer("cookTimer", cookStartTime);

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

div.innerText=step;

box.appendChild(div);

});

initDrag();

}

/* ==========================
   拖拽功能
   ========================== */

function initDrag(){
    initSmoothDrag(".cookCard");
}

/* ==========================
   检查答案
   ========================== */

function checkCookAnswer(){

cookAttempts++;
document.getElementById("cookAttempt").textContent = cookAttempts;

const current=[

...document.querySelectorAll(
".cookCard"
)

].map(

x=>x.innerText

);

const acc = calcAccuracy(current, cookSteps);
if (acc > cookBestAccuracy) cookBestAccuracy = acc;

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
stopTimer();

const elapsed = formatTime(Date.now() - cookStartTime.value);

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

<br><br>

<div class="statRow">
    <span>📝 尝试次数</span>
    <span>${cookAttempts} 次</span>
</div>
<div class="statRow">
    <span>⏱️ 用时</span>
    <span>${elapsed}</span>
</div>
<div class="statRow">
    <span>🎯 准确率</span>
    <span>${cookBestAccuracy}%</span>
</div>

<br>

⭐ 获得成就：

厨房达人

</div>
`;

recordGameResult("cook", cookAttempts, Date.now() - cookStartTime.value, cookBestAccuracy);

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
