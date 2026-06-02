/* ==========================
   图书馆小达人
========================== */

const librarySteps = [

"进入图书馆",
"查找图书",
"记录书架号",
"取书",
"办理借书手续",
"离开图书馆"

];

let libraryCompleted = false;
let libraryAttempts = 0;
let libraryStartTime = { value: 0 };
let libraryBestAccuracy = 0;

function renderLibraryGame(){
    libraryCompleted = false;
    libraryAttempts = 0;
    libraryBestAccuracy = 0;
    stopTimer();

document.body.innerHTML=`

<div class="libraryScene">

    <div class="topBar">

        <button onclick="goHome()">
        🏰 返回大厅
        </button>

        <h1>
        📚 图书馆小达人
        </h1>

        <div class="gameStats">
            <span>⏱️ <span id="libraryTimer">0秒</span></span>
            <span>📝 第 <span id="libraryAttempt">0</span> 次尝试</span>
        </div>

    </div>

    <div class="teacherHint">

        👩‍🏫 小智老师：

        先来学一学借书的正确步骤吧！

    </div>

    <div id="libraryLearnView">

        <div class="learnSteps">
            ${librarySteps.map((s, i) => `<div class="learnStep"><span class="learnStepNum">${i+1}</span>${s}</div>`).join("")}
        </div>

        <div class="btnArea">
            <button onclick="libraryStartChallenge()">
            🚀 开始挑战
            </button>
        </div>

    </div>

    <div id="libraryChallengeView" style="display:none">

        <div class="queryPanel">

            <input
            id="bookInput"
            placeholder="请输入书名">

            <button onclick="searchBook()">

            🔍 查询

            </button>

        </div>

        <div id="searchResult"></div>

        <div id="libraryMap"></div>

        <div id="libraryCards"></div>

        <div class="btnArea">

            <button
            onclick="checkLibraryAnswer()">

            ✔ 检查答案

            </button>

        </div>

        <div id="libraryResult"></div>

    </div>

</div>

`;

const libraryTask = getTaskResults()["library"];
if (libraryTask) {
    document.querySelector("#libraryLearnView .btnArea").innerHTML +=
        `<button onclick="showTaskSheet('library')" style="background:linear-gradient(135deg,#42A5F5,#1E88E5);margin-left:10px">📋 查看任务单</button>`;
} else if (achievements["借书达人"]) {
    document.querySelector("#libraryLearnView .btnArea").innerHTML +=
        `<button onclick="showTaskSheet('library')" style="background:linear-gradient(135deg,#FFA726,#F57C00);margin-left:10px">📝 填写任务单</button>`;
}
teacherSay("先来学习借书的正确步骤吧。");
}

function libraryStartChallenge(){
    document.getElementById("libraryLearnView").style.display = "none";
    document.getElementById("libraryChallengeView").style.display = "block";
    document.querySelector(".libraryScene .teacherHint").innerHTML = "👩‍🏫 小智老师：请先查询图书，再完成借书步骤排序。";
    startTimer("libraryTimer", libraryStartTime);
    teacherSay("请先查询图书，再完成借书步骤排序。");
}

function searchBook(){

const name =
document.getElementById(
"bookInput"
).value;

if(!name){

alert("请输入书名");

return;

}

document
.getElementById(
"searchResult"
)

.innerHTML=

`
<div class="searchBox">

📚 查询成功

书名：

${name}

<br><br>

位置：

A区 3排 5号

</div>
`;

renderMap();

renderLibraryCards();

teacherSay(
"请前往A区找到图书。"
);

}

function renderMap(){

document
.getElementById(
"libraryMap"
)

.innerHTML=

`
<div class="map">

<div class="shelf">
A区
</div>

<div class="shelf">
B区
</div>

<div class="shelf">
C区
</div>

<div id="player">
👧
</div>

</div>

<div class="moveBtns">

<button onclick="movePlayer('left')">
⬅
</button>

<button onclick="movePlayer('right')">
➡
</button>

</div>

`;

window.playerPos=0;

}

function movePlayer(dir){

const player=
document.getElementById(
"player"
);

if(dir==="left"){

playerPos--;

}

if(dir==="right"){

playerPos++;

}

if(playerPos<0)
playerPos=0;

if(playerPos>2)
playerPos=2;

player.style.left=
(100+playerPos*220)+"px";

if(playerPos===0){

teacherSay(
"恭喜找到A区书架！"
);

}

}

function renderLibraryCards(){

const shuffled=[

"办理借书手续",
"进入图书馆",
"取书",
"离开图书馆",
"查找图书",
"记录书架号"

];

const box=
document.getElementById(
"libraryCards"
);

box.innerHTML="";

shuffled.forEach(step=>{

const div=
document.createElement(
"div"
);

div.className="libraryCard";

div.innerText=step;

box.appendChild(div);

});

initLibraryDrag();

}

function initLibraryDrag(){
    initSmoothDrag(".libraryCard");
}

function checkLibraryAnswer(){

libraryAttempts++;
document.getElementById("libraryAttempt").textContent = libraryAttempts;

const current=[

...document.querySelectorAll(
".libraryCard"
)

].map(
x=>x.innerText
);

const acc = calcAccuracy(current, librarySteps);
if (acc > libraryBestAccuracy) libraryBestAccuracy = acc;

if(

JSON.stringify(current)
===

JSON.stringify(
librarySteps
)

){

librarySuccess();

}else{

libraryError();

}

}

function librarySuccess(){

if(libraryCompleted)
return;

libraryCompleted=true;
stopTimer();

const elapsed = formatTime(Date.now() - libraryStartTime.value);

teacherSay(

"太棒了，你掌握了借书算法。"

);

document
.getElementById("libraryResult")

.innerHTML=

`
<div class="successBox">

🎉🎉🎉

<h2>
借书成功！
</h2>

📚

<br><br>

<div class="statRow">
    <span>📝 尝试次数</span>
    <span>${libraryAttempts} 次</span>
</div>
<div class="statRow">
    <span>⏱️ 用时</span>
    <span>${elapsed}</span>
</div>
<div class="statRow">
    <span>🎯 准确率</span>
    <span>${libraryBestAccuracy}%</span>
</div>

<br>

⭐ 获得成就

借书达人

</div>
`;

recordGameResult("library", libraryAttempts, Date.now() - libraryStartTime.value, libraryBestAccuracy);

unlockAchievement(
"借书达人"
);

playSuccessEffect();

setTimeout(() => showTaskSheet("library"), 1500);

}

function libraryError(){

teacherSay(
"步骤顺序不正确，再试试看。"
);

document
.getElementById(
"libraryResult"
)

.innerHTML=

`
<div class="errorBox">

❌

步骤错误

请重新排列

</div>
`;

}