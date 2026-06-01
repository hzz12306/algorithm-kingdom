/* ==========================
   算法岔路口
========================== */

let branchCompleted=false;

/* ==========================
   页面
========================== */

function renderBranchGame(){

document.body.innerHTML=`

<div class="branchScene">

    <div class="topBar">

        <button onclick="goHome()">

        🏰 返回大厅

        </button>

        <h1>

        🚦 算法岔路口

        </h1>

    </div>

    <div class="teacherHint">

        👩‍🏫 小智老师：

        图书馆里的书已经被借出了！

        你会怎么办呢？

    </div>

    <div class="bookArea">

        <div class="bookIcon">

            📚

        </div>

        <div class="bookState">

            《哈利波特》

            <br><br>

            ❌ 已借出

        </div>

    </div>

    <div class="choiceArea">

        <button
        class="choiceBtn"
        onclick="chooseBranch('reserve')">

        📅 预约借书

        </button>

        <button
        class="choiceBtn"
        onclick="chooseBranch('change')">

        📖 换一本书

        </button>

        <button
        class="choiceBtn"
        onclick="chooseBranch('leave')">

        🚪 回家

        </button>

    </div>

    <div id="branchResult">

    </div>

</div>

`;

teacherSay(
"如果书已经借出，你会怎么做呢？"
);

}

function chooseBranch(type){

switch(type){

case "reserve":

reserveBook();

break;

case "change":

changeBook();

break;

case "leave":

leaveLibrary();

break;

}

}

function reserveBook(){

teacherSay(

"非常棒！预约借书是一种解决方案。"

);

document
.getElementById(
"branchResult"
)

.innerHTML=

`
<div class="successBox">

🌟

预约成功！

等待归还后即可借阅。

</div>
`;

completeBranch();

}

function changeBook(){

teacherSay(

"很好！换一本书也是解决问题的方法。"

);

document
.getElementById(
"branchResult"
)

.innerHTML=

`
<div class="successBox">

📖

已重新选择图书！

借书成功！

</div>
`;

completeBranch();

}

function leaveLibrary(){

teacherSay(

"如果直接回家，就无法完成借书任务。"

);

document
.getElementById(
"branchResult"
)

.innerHTML=

`
<div class="errorBox">

😢

没有借到书！

请再想想办法。

</div>
`;

}

function completeBranch(){

if(branchCompleted)
return;

branchCompleted=true;

unlockAchievement(
"分支达人"
);

setTimeout(()=>{

showBranchThinking();

},1500);

}

function showBranchThinking(){

document
.getElementById(
"branchResult"
)

.innerHTML +=

`
<div class="flowTree">

<h2>

🌳 算法岔路口

</h2>

<pre>

开始借书

   │

   ▼

找到图书？

   │

 ┌─┴─────┐

 │       │

是      否

 │       │

 ▼       ▼

借书   已借出

          │

    ┌─────┴─────┐

    │           │

预约借书   换一本书

    │           │

    ▼           ▼

  成功        成功

</pre>

</div>
`;

teacherSay(

"同学们，这就是算法中的分支思想。"

);

showFinalCertificate();

}

function showFinalCertificate(){

setTimeout(()=>{

document
.body
.insertAdjacentHTML(

"beforeend",

`

<div id="finalCertificate">

    <div class="certificateBox">

        <h1>

        👑

        算法大师

        </h1>

        <br>

        🍅 厨房达人

        <br>

        📚 借书达人

        <br>

        🪥 刷牙达人

        <br>

        🚦 分支达人

        <br><br>

        恭喜完成全部挑战！

        <br><br>

        <button
        onclick="renderCertificate()">

        🏆 领取证书

        </button>

    </div>

</div>

`

);

},3000);

}