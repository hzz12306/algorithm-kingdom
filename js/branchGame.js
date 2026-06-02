/* ==========================
   算法岔路口 - 机器人放学回家
   ========================== */

let branchCompleted = false;
let branchAttempts = 0;
let branchStartTime = { value: 0 };

function renderBranchGame() {
    branchCompleted = false;
    branchAttempts = 0;
    stopTimer();

    document.body.innerHTML = `

<div class="branchScene">

    <div class="topBar">
        <button onclick="goHome()">🏰 返回大厅</button>
        <h1>🚦 算法岔路口</h1>
        <div class="gameStats">
            <span>⏱️ <span id="branchTimer">0秒</span></span>
            <span>📝 第 <span id="branchAttempt">0</span> 次选择</span>
        </div>
    </div>

    <div class="teacherHint">
        👩‍🏫 小智老师：<br>
        放学啦！机器人🤖要回家，可是有好几条路可以走。<br>
        每条路都是解决同一个问题的不同"算法"，选哪条呢？
    </div>

    <div class="schoolArea">
        <div class="routeMap">
            <span class="mapPoint">🏫</span>
            <span class="mapArrow">➡️ ❓ ➡️</span>
            <span class="mapPoint">🏠</span>
        </div>
        <div class="routeLabel">学校 —— 找一条路回家 —— 家</div>
    </div>

    <div class="choiceArea">
        <button class="choiceBtn" onclick="choosePath('fast')">
            🏃<br>最短路线<br><span class="choiceSub">最快但车多</span>
        </button>
        <button class="choiceBtn" onclick="choosePath('safe')">
            🚸<br>安全路线<br><span class="choiceSub">最安全但绕路</span>
        </button>
        <button class="choiceBtn" onclick="choosePath('scenic')">
            🌳<br>风景路线<br><span class="choiceSub">最美但最慢</span>
        </button>
    </div>

    <div id="branchResult"></div>

</div>

    `;
    const bt = getTaskResults()["branch"];
    if (bt) {
        document.querySelector(".branchScene .teacherHint").innerHTML +=
            `<br><button onclick="showTaskSheet('branch')" style="margin-top:8px;padding:6px 18px;background:linear-gradient(135deg,#42A5F5,#1E88E5);color:white;border:none;border-radius:12px;font-size:14px;cursor:pointer">📋 查看任务单</button>`;
    } else if (achievements["分支达人"]) {
        document.querySelector(".branchScene .teacherHint").innerHTML +=
            `<br><button onclick="showTaskSheet('branch')" style="margin-top:8px;padding:6px 18px;background:linear-gradient(135deg,#FFA726,#F57C00);color:white;border:none;border-radius:12px;font-size:14px;cursor:pointer">📝 填写任务单</button>`;
    }
    startTimer("branchTimer", branchStartTime);
    teacherSay("放学了，机器人要走哪条路回家呢？不同的路就是不同的算法哦！");
}

function choosePath(type) {
    branchAttempts++;
    document.getElementById("branchAttempt").textContent = branchAttempts;
    switch (type) {
        case "fast":
            takeFastPath();
            break;
        case "safe":
            takeSafePath();
            break;
        case "scenic":
            takeScenicPath();
            break;
    }
}

function takeFastPath() {
    teacherSay("你选择了最短路线！这是一个'最快算法'，追求效率。");
    document.getElementById("branchResult").innerHTML = `
<div class="successBox">
    🌟 最短路线<br><br>
    🤖 机器人飞快跑过马路<br>
    ⚡ 5分钟就到啦！<br><br>
    <span class="tradeoff">优点：最快到达 &nbsp;|&nbsp; 缺点：路上车多</span>
</div>
    `;
    completeBranch("最短路线");
}

function takeSafePath() {
    teacherSay("你选择了安全路线！这是一个'最安全算法'，优先考虑安全。");
    document.getElementById("branchResult").innerHTML = `
<div class="successBox">
    🌟 安全路线<br><br>
    🤖 机器人走天桥过马路<br>
    🕐 10分钟到家！<br><br>
    <span class="tradeoff">优点：最安全 &nbsp;|&nbsp; 缺点：多花时间</span>
</div>
    `;
    completeBranch("安全路线");
}

function takeScenicPath() {
    teacherSay("你选择了风景路线！这是一个'最有趣算法'，重视体验。");
    document.getElementById("branchResult").innerHTML = `
<div class="successBox">
    🌟 风景路线<br><br>
    🤖 机器人穿过公园看花看树<br>
    🕐 15分钟到家！<br><br>
    <span class="tradeoff">优点：风景优美 &nbsp;|&nbsp; 缺点：花时间最长</span>
</div>
    `;
    completeBranch("风景路线");
}

function completeBranch(pathName) {
    const elapsed = formatTime(Date.now() - branchStartTime.value);
    if (!branchCompleted) {
        branchCompleted = true;
        stopTimer();
        recordGameResult("branch", branchAttempts, Date.now() - branchStartTime.value, 100);
        unlockAchievement("分支达人");
    }
    const oldTree = document.querySelector(".flowTree");
    if (oldTree) oldTree.remove();
    setTimeout(() => {
        showBranchThinking(pathName, elapsed);
    }, 500);
    setTimeout(() => showTaskSheet("branch"), 2000);
}

function showBranchThinking(pathName, elapsed) {
    const pathIcons = {"最短路线":"🏃","安全路线":"🚸","风景路线":"🌳"};
    const icon = pathIcons[pathName] || "🚦";
    document.getElementById("branchResult").innerHTML += `

<div class="flowTree">
    <h2>🌳 算法岔路口</h2>
    <p class="flowSummary">同一个问题 <strong>"回家"</strong>，可以用不同算法解决！</p>

    <div class="flowChart">
        <div class="flowNode start">开始放学</div>
        <div class="flowArrow">▼</div>
        <div class="flowNode decision">选择路线</div>
        <div class="flowArrow">▼</div>

        <div class="flowBranch">
            <div class="flowBranchCol ${pathName==="最短路线"?"selected":""}">
                <div class="flowNode opt">🏃 最短路线</div>
                <div class="flowTag">最快到达</div>
            </div>
            <div class="flowBranchCol ${pathName==="安全路线"?"selected":""}">
                <div class="flowNode opt">🚸 安全路线</div>
                <div class="flowTag">最安全</div>
            </div>
            <div class="flowBranchCol ${pathName==="风景路线"?"selected":""}">
                <div class="flowNode opt">🌳 风景路线</div>
                <div class="flowTag">风景最美</div>
            </div>
        </div>

        <div class="flowMerge">
            <div class="flowArrow">▼</div>
            <div class="flowNode end">🏠 到家啦！</div>
        </div>
    </div>

    <br>
    <div class="statRow">
        <span>📝 选择次数</span>
        <span>${branchAttempts} 次</span>
    </div>
    <div class="statRow">
        <span>⏱️ 用时</span>
        <span>${elapsed}</span>
    </div>

    <p class="flowSummary">
        你选了 ${icon} <strong>${pathName}</strong>！<br>
        三种算法都完成了任务，只是方式不同哦！
    </p>
</div>

    `;

    teacherSay(
        "同学们，同一个问题可以有多种不同的算法来解决。这就是算法岔路口的魅力！"
    );
}
