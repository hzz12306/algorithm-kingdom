/* ==========================
   机器人刷牙
========================== */

const brushSteps=[

"湿润牙刷",
"挤牙膏",
"上下刷牙",
"漱口"

];

let brushCompleted=false;
let brushAttempts = 0;
let brushStartTime = { value: 0 };
let brushBestAccuracy = 0;

/* ==========================
   页面
   ========================== */

function renderBrushGame(){
    brushCompleted = false;
    brushAttempts = 0;
    brushBestAccuracy = 0;
    stopTimer();

document.body.innerHTML=`

<div class="brushScene">

    <div class="topBar">

        <button onclick="goHome()">

        🏰 返回大厅

        </button>

        <h1>

        🪥 机器人刷牙

        </h1>

        <div class="gameStats">
            <span>⏱️ <span id="brushTimer">0秒</span></span>
            <span>📝 第 <span id="brushAttempt">0</span> 次尝试</span>
        </div>

    </div>

    <div class="teacherHint">

        👩‍🏫 小智老师：

        请帮助机器人完成刷牙步骤！

    </div>

    <div class="robotArea">

        <div id="robotFace">

            🤖

        </div>

        <div id="robotMouth">

            😬

        </div>

    </div>

    <div id="brushCards">

    </div>

    <div class="btnArea">

        <button
        onclick="checkBrushAnswer()">

        ✔ 检查答案

        </button>

    </div>

    <div id="brushResult">

    </div>

</div>

`;

createBrushCards();

teacherSay(
"请按照正确顺序排列刷牙步骤。"
);

    startTimer("brushTimer", brushStartTime);

}

function createBrushCards(){

const shuffled=[

"上下刷牙",
"漱口",
"挤牙膏",
"湿润牙刷"

];

const box=
document.getElementById(
"brushCards"
);

box.innerHTML="";

shuffled.forEach(step=>{

const div=
document.createElement("div");

div.className="brushCard";

div.innerText=step;

box.appendChild(div);

});

initBrushDrag();

}

function initBrushDrag(){
    initSmoothDrag(".brushCard");
}

function checkBrushAnswer(){

brushAttempts++;
document.getElementById("brushAttempt").textContent = brushAttempts;

const current=[

...document.querySelectorAll(
".brushCard"
)

].map(
x=>x.innerText
);

const acc = calcAccuracy(current, brushSteps);
if (acc > brushBestAccuracy) brushBestAccuracy = acc;

if(

JSON.stringify(current)
===

JSON.stringify(
brushSteps
)

){

brushSuccess();

}else{

brushError();

}

}

function brushSuccess(){

if(brushCompleted)
return;

brushCompleted=true;
stopTimer();

const elapsed = formatTime(Date.now() - brushStartTime.value);

teacherSay(

"太棒了，你已经掌握刷牙算法。"

);

document
.getElementById("robotMouth")

.innerHTML="😁✨";

document
.getElementById("brushResult")

.innerHTML=

`
<div class="successBox">

🎉🎉🎉

<h2>

牙齿闪闪发光！

</h2>

<br>

<div class="statRow">
    <span>📝 尝试次数</span>
    <span>${brushAttempts} 次</span>
</div>
<div class="statRow">
    <span>⏱️ 用时</span>
    <span>${elapsed}</span>
</div>
<div class="statRow">
    <span>🎯 准确率</span>
    <span>${brushBestAccuracy}%</span>
</div>

<br>

⭐ 获得成就

刷牙达人

</div>
`;

recordGameResult("brush", brushAttempts, Date.now() - brushStartTime.value, brushBestAccuracy);

unlockAchievement(
"刷牙达人"
);

playSuccessEffect();

}

function brushError(){

teacherSay(
"步骤顺序不正确，再观察一下。"
);

document
.getElementById(
"brushResult"
)

.innerHTML=

`
<div class="errorBox">

❌

机器人刷牙失败！

请重新排列步骤。

</div>
`;

}

