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

function renderLibraryGame(){

document.body.innerHTML=`

<div class="libraryScene">

    <div class="topBar">

        <button onclick="goHome()">
        🏰 返回大厅
        </button>

        <h1>
        📚 图书馆小达人
        </h1>

    </div>

    <div class="teacherHint">

        👩‍🏫 小智老师：

        请帮助同学完成借书任务！

    </div>

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

`;

teacherSay(
"请先查询图书，再完成借书步骤排序。"
);

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

div.className=
"libraryCard";

div.draggable=true;

div.innerText=step;

box.appendChild(div);

});

initLibraryDrag();

}

function initLibraryDrag(){

let dragged=null;

document
.querySelectorAll(
".libraryCard"
)

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

card.parentNode.insertBefore(
dragged,
card
);

}

);

});

}

function checkLibraryAnswer(){

const current=[

...document.querySelectorAll(
".libraryCard"
)

].map(
x=>x.innerText
);

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

teacherSay(

"太棒了，你掌握了借书算法。"

);

document
.getElementById(
"libraryResult"
)

.innerHTML=

`
<div class="successBox">

🎉🎉🎉

<h2>
借书成功！
</h2>

📚

⭐ 获得成就

借书达人

</div>
`;

unlockAchievement(
"借书达人"
);

playSuccessEffect();

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