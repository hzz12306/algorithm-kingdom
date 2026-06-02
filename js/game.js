/* ==========================
   全局统计系统
   ========================== */

function getGameStats() {
    const saved = sessionStorage.getItem("gameStats");
    if (saved) return JSON.parse(saved);
    return {
        cook: { attempts: 0, bestTime: Infinity, bestAccuracy: 0, completed: false },
        library: { attempts: 0, bestTime: Infinity, bestAccuracy: 0, completed: false },
        brush: { attempts: 0, bestTime: Infinity, bestAccuracy: 0, completed: false },
        branch: { attempts: 0, bestTime: Infinity, completed: false },
        total: { attempts: 0, time: 0, completed: 0 }
    };
}

function saveGameStats(game, data) {
    const stats = getGameStats();
    stats[game] = data;

    // 更新总计
    stats.total.attempts = stats.cook.attempts + stats.library.attempts + stats.brush.attempts + stats.branch.attempts;
    const t = (s) => (s.bestTime == null || s.bestTime === Infinity) ? 0 : s.bestTime;
    stats.total.time = t(stats.cook) + t(stats.library) + t(stats.brush) + t(stats.branch);
    stats.total.completed = (stats.cook.completed ? 1 : 0)
                          + (stats.library.completed ? 1 : 0)
                          + (stats.brush.completed ? 1 : 0)
                          + (stats.branch.completed ? 1 : 0);
    sessionStorage.setItem("gameStats", JSON.stringify(stats));
    updateStatsPanel();
}

function updateStatsPanel() {
    const stats = getGameStats();
    const panel = document.getElementById("statsPanel");
    if (!panel) return;

    const formatBestTime = (t) => (t == null || t === Infinity) ? "--" : formatTime(t);
    const totalGames = 4;
    const progress = Math.round(stats.total.completed / totalGames * 100);

    const bar = panel.querySelector(".statProgressBar");
    const label = panel.querySelector(".statProgress span");
    if (bar) bar.style.width = progress + "%";
    if (label) label.textContent = "完成进度 " + stats.total.completed + "/" + totalGames;

    const items = panel.querySelectorAll(".statList .statItem strong");
    if (items[0]) items[0].textContent = stats.total.attempts + " 次";
    if (items[1]) items[1].textContent = formatTime(stats.total.time);
    if (items[2]) items[2].textContent = Math.max(stats.cook.bestAccuracy, stats.library.bestAccuracy, stats.brush.bestAccuracy) + "%";

    // 积分与证书等级
    const scores = typeof getTotalScores === "function" ? getTotalScores() : null;
    if (scores) {
        const ts = document.getElementById("totalScoreDisplay");
        if (ts) ts.textContent = scores.total + "/200";
        const ld = document.getElementById("levelDisplay");
        if (ld) {
            const lv = ["--", "🏆 探索家", "🥇 小达人", "👑 大师"][scores.level];
            ld.textContent = lv;
            ld.style.color = scores.levelColor || "#999";
        }
    }

    function setStat(id, completed, time) {
        const el = document.getElementById(id);
        if (el) el.textContent = (completed ? "✅ " : "⏳ ") + formatBestTime(time);
    }
    setStat("statCook", stats.cook.completed, stats.cook.bestTime);
    setStat("statLibrary", stats.library.completed, stats.library.bestTime);
    setStat("statBrush", stats.brush.completed, stats.brush.bestTime);
    setStat("statBranch", stats.branch.completed, stats.branch.bestTime);
}

function recordGameResult(game, attempts, timeMs, accuracy) {
    const stats = getGameStats();
    const g = stats[game];
    g.attempts = attempts;
    if (timeMs < g.bestTime) g.bestTime = timeMs;
    if (accuracy > g.bestAccuracy) g.bestAccuracy = accuracy;
    g.completed = true;
    saveGameStats(game, g);
}

/* ==========================
   通用工具函数
   ========================== */

function formatTime(ms){
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? m + "分" + (s % 60) + "秒" : s + "秒";
}

function calcAccuracy(current, correct){
    let ok = 0;
    correct.forEach((v, i) => { if (current[i] === v) ok++; });
    return Math.round(ok / correct.length * 100);
}

function startTimer(displayId, startRef){
    const el = document.getElementById(displayId);
    if (!el) return;
    startRef.value = Date.now();
    if (window._timer) clearInterval(window._timer);
    window._timer = setInterval(() => {
        el.textContent = formatTime(Date.now() - startRef.value);
    }, 500);
}

function stopTimer(){
    if (window._timer) { clearInterval(window._timer); window._timer = null; }
}

function initSmoothDrag(selector){
    var draggedCard = null;
    var ghost = null;
    var container = null;
    var startY = 0;
    var originY = 0;
    var dropLine = null;

    function cleanDrag() {
        if (ghost) { ghost.remove(); ghost = null; }
        if (dropLine) { dropLine.remove(); dropLine = null; }
        if (draggedCard) {
            draggedCard.style.opacity = "1";
            draggedCard.style.transform = "";
            draggedCard.removeEventListener("pointermove", onPointerMove);
            draggedCard.removeEventListener("pointerup", onPointerUp);
            draggedCard.removeEventListener("pointercancel", onPointerUp);
            draggedCard = null;
        }
        container = null;
    }

    function onPointerDown(e) {
        if (e.button !== 0) return;
        cleanDrag();
        var card = e.currentTarget;
        container = card.parentNode;
        var rect = card.getBoundingClientRect();

        ghost = card.cloneNode(true);
        ghost.style.cssText = "position:fixed;pointer-events:none;z-index:1000;width:" + rect.width + "px;opacity:.85;transform:scale(1.03) rotate(1deg);box-shadow:0 12px 40px rgba(0,0,0,.18);border-radius:14px;background:white;top:" + rect.top + "px;left:" + rect.left + "px;padding:14px 20px;font-size:" + getComputedStyle(card).fontSize + ";text-align:center;transition:none;";
        document.body.appendChild(ghost);

        card.style.opacity = ".35";
        card.style.transform = "scale(.97)";
        draggedCard = card;
        startY = e.clientY;
        originY = rect.top;

        card.setPointerCapture(e.pointerId);
        card.addEventListener("pointermove", onPointerMove);
        card.addEventListener("pointerup", onPointerUp);
        card.addEventListener("pointercancel", onPointerUp);
    }

    function onPointerMove(e) {
        if (!ghost || !container) return;
        ghost.style.top = (originY + e.clientY - startY) + "px";
        updateDropLine();
    }

    function updateDropLine() {
        if (!ghost || !container) return;
        var ghostRect = ghost.getBoundingClientRect();
        var ghostCenterY = ghostRect.top + ghostRect.height / 2;
        var cards = Array.from(container.children).filter(function(c) { return c !== draggedCard; });

        var insertAfter = null;
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].getBoundingClientRect();
            var cardCenterY = r.top + r.height / 2;
            if (ghostCenterY > cardCenterY) {
                insertAfter = cards[i];
            }
        }

        if (!dropLine) {
            dropLine = document.createElement("div");
            dropLine.style.cssText = "position:fixed;z-index:999;height:4px;background:#2196F3;border-radius:2px;pointer-events:none;transition:top .08s,left .08s,width .08s;box-shadow:0 0 8px rgba(33,150,243,.5);";
            document.body.appendChild(dropLine);
        }

        var containerRect = container.getBoundingClientRect();
        var padding = parseFloat(getComputedStyle(container).paddingLeft) || 0;
        dropLine.style.left = (containerRect.left + padding) + "px";
        dropLine.style.width = (containerRect.width - padding * 2) + "px";

        if (insertAfter) {
            var afterRect = insertAfter.getBoundingClientRect();
            dropLine.style.top = (afterRect.bottom + 4) + "px";
        } else {
            var first = cards[0];
            if (first) {
                dropLine.style.top = (first.getBoundingClientRect().top - 6) + "px";
            } else {
                dropLine.style.top = (containerRect.top + 4) + "px";
            }
        }
    }

    function onPointerUp(e) {
        if (!draggedCard || !container) {
            cleanDrag();
            return;
        }

        var ghostRect = ghost.getBoundingClientRect();
        var ghostCenterY = ghostRect.top + ghostRect.height / 2;
        var cards = Array.from(container.children).filter(function(c) { return c !== draggedCard; });

        var insertBefore = null;
        for (var i = 0; i < cards.length; i++) {
            var r = cards[i].getBoundingClientRect();
            var cardCenterY = r.top + r.height / 2;
            if (ghostCenterY < cardCenterY) {
                insertBefore = cards[i];
                break;
            }
        }

        if (insertBefore) {
            container.insertBefore(draggedCard, insertBefore);
        } else {
            container.appendChild(draggedCard);
        }

        cleanDrag();
    }

    var cards = document.querySelectorAll(selector);
    for (var i = 0; i < cards.length; i++) {
        cards[i].style.touchAction = "none";
        cards[i].addEventListener("pointerdown", onPointerDown);
    }
}

function teacherSay(text){
    const panel = document.getElementById("teacherText");
    if(panel){
        panel.innerHTML = text;
    }
    if(window.speechSynthesis){
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = "zh-CN";
        msg.rate = 1.3;
        speechSynthesis.speak(msg);
    }
}

function goHome(){
    location.reload();
}

/* ==========================
   学习任务单系统
   ========================== */

const taskSheets = {
    cook: {
        title: "厨房小厨神", icon: "🍅",
        questions: [
            { text: "做西红柿炒鸡蛋时应该怎样完成步骤？", options: ["必须按顺序执行", "可以随意执行"], correct: 0 },
            { text: "下面哪种做法更合理？", options: ["先炒鸡蛋再打鸡蛋", "先打鸡蛋再炒鸡蛋"], correct: 1 },
            { text: "通过本关你发现：", options: ["算法有顺序", "算法没有顺序"], correct: 0 }
        ]
    },
    library: {
        title: "图书馆小达人", icon: "📚",
        questions: [
            { text: "借书前先查询图书有什么好处？", options: ["能更快找到书", "浪费时间"], correct: 0 },
            { text: "哪种找书方法效率更高？", options: ["一排一排慢慢找", "先查询再去找"], correct: 1 },
            { text: "为什么借书需要按步骤来？", options: ["步骤可以调换", "步骤有先后顺序不可调换"], correct: 1 }
        ]
    },
    brush: {
        title: "机器人刷牙", icon: "🪥",
        questions: [
            { text: "刷牙时应该先做什么？", options: ["挤牙膏", "漱口"], correct: 0 },
            { text: "如果先漱口再刷牙会怎样？", options: ["顺序错误", "更科学"], correct: 0 },
            { text: "本关说明了什么？", options: ["算法顺序很重要", "算法可以随意执行"], correct: 0 }
        ]
    },
    branch: {
        title: "算法挑战赛", icon: "🚀",
        questions: [
            { text: "机器人回家有几种路线可以选择？", options: ["只有一种", "有多种"], correct: 1 },
            { text: "选择最快的路线说明了什么？", options: ["算法可以比较优劣", "所有路线都一样"], correct: 0 },
            { text: "如果想看风景应该选哪种路线？", options: ["最快路线", "适合自己的路线"], correct: 1 },
            { text: "下面关于算法说法正确的是？", options: ["一个问题只有一种算法", "一个问题可以有多种算法，我们选择更优的"], correct: 1 }
        ]
    }
};

function getTaskResults() {
    const saved = sessionStorage.getItem("taskResults");
    return saved ? JSON.parse(saved) : {};
}

function saveTaskResult(gameId, answers) {
    const sheet = taskSheets[gameId];
    const correct = answers.map((a, i) => a === sheet.questions[i].correct);
    const score = correct.filter(Boolean).length;
    const total = sheet.questions.length;
    const results = getTaskResults();
    results[gameId] = { answers, correct, score, total, timestamp: Date.now() };
    sessionStorage.setItem("taskResults", JSON.stringify(results));
    return { score, total, correct, answers };
}

let _taskQIndex = 0;
let _taskAnswers = {};

function showTaskSheet(gameId) {
    const sheet = taskSheets[gameId];
    if (!sheet) return;
    const existing = getTaskResults()[gameId];
    _taskQIndex = 0;
    _taskAnswers = {};
    const modal = document.createElement("div");
    modal.id = "taskSheetModal";
    modal.innerHTML = `
    <div class="taskOverlay">
      <div class="taskBox">
        <div class="taskHeader">
          <span class="taskIcon">${sheet.icon}</span>
          <h2>${sheet.title}</h2>
          <p class="taskSub">${existing ? "✅ 已完成 — 查看你的答案" : "完成挑战后，来填一填学习任务单吧！"}</p>
        </div>
        <div class="taskBody" id="taskBody"></div>
      </div>
    </div>`;
    document.body.appendChild(modal);
    const body = document.getElementById("taskBody");
    if (existing) {
        body.innerHTML = renderTaskReview(gameId, existing) + `<button class="taskCloseBtn" onclick="closeTaskSheet()">关闭</button>`;
    } else {
        body.innerHTML = renderTaskQuestion(gameId);
    }
}

function renderTaskReview(gameId, data) {
    const sheet = taskSheets[gameId];
    return sheet.questions.map((q, qi) => {
        const isCorrect = data.correct[qi];
        const selIdx = data.answers[qi];
        return `
        <div class="taskQuestion ${isCorrect ? 'taskCorrect' : 'taskWrong'}">
          <p class="taskQText">${qi+1}. ${q.text}</p>
          <div class="taskOptions">
            ${q.options.map((opt, oi) => {
                let cls = "taskOption";
                if (oi === selIdx) cls += isCorrect ? " optSelected" : " optWrong";
                if (oi === q.correct) cls += " optCorrect";
                return `<div class="${cls}" style="pointer-events:none">${oi === q.correct ? "✅ " : ""}${opt}</div>`;
            }).join("")}
          </div>
        </div>`;
    }).join("") + `
    <div class="taskResult">
      ⭐ 获得 ${data.score}/${data.total} 颗星
    </div>`;
}

function renderTaskQuestion(gameId) {
    const sheet = taskSheets[gameId];
    const q = sheet.questions[_taskQIndex];
    const allAnswered = getTaskResults()[gameId];
    if (allAnswered || _taskQIndex >= sheet.questions.length) return "";
    return `
    <div class="taskProgress">第 ${_taskQIndex+1}/${sheet.questions.length} 题</div>
    <div class="taskQuestion active">
      <p class="taskQText">${q.text}</p>
      <div class="taskOptions">
        ${q.options.map((opt, oi) =>
            `<div class="taskOption" onclick="selectTaskAnswer('${gameId}', ${oi})">${opt}</div>`
        ).join("")}
      </div>
    </div>`;
}

function selectTaskAnswer(gameId, optIdx) {
    const sheet = taskSheets[gameId];
    if (!_taskAnswers[gameId]) _taskAnswers[gameId] = [];
    _taskAnswers[gameId][_taskQIndex] = optIdx;
    if (_taskQIndex < sheet.questions.length - 1) {
        _taskQIndex++;
        document.getElementById("taskBody").innerHTML = renderTaskQuestion(gameId);
    } else {
        const { score, total, correct, answers } = saveTaskResult(gameId, _taskAnswers[gameId]);
        document.getElementById("taskBody").innerHTML = renderTaskReview(gameId, { answers, correct, score, total }) +
            `<button class="taskCloseBtn" onclick="closeTaskSheet()">返回大厅</button>`;
    }
}

function closeTaskSheet() {
    const m = document.getElementById("taskSheetModal");
    if (m) m.remove();
}

function renderGrowthRecord() {
    const raw = getTaskResults();
    const results = {};
    Object.keys(raw).filter(k => k !== '_version').forEach(k => results[k] = raw[k]);
    const totalStars = Object.values(results).reduce((s, r) => s + (r.score || 0), 0);
    const totalPossible = Object.values(taskSheets).reduce((sum, s) => sum + s.questions.length, 0);
    const m = document.createElement("div");
    m.id = "growthRecordModal";
    m.innerHTML = `
    <div class="growthOverlay">
      <div class="growthBox">
        <h1>📒 我的成长记录册</h1>
        <div class="growthGrid">
          ${Object.keys(taskSheets).map(id => {
              const r = results[id];
              const s = taskSheets[id];
              const done = !!r;
              return `
              <div class="growthCard ${done ? 'growthDone' : ''}">
                <div class="growthCardHeader">
                  <span class="growthIcon">${s.icon}</span>
                  <span class="growthTitle">${s.title}</span>
                  <span class="growthStatus">${done ? "✅ 已完成" : "⏳ 未完成"}</span>
                </div>
                ${done ? `
                  <div class="growthStars">${"⭐".repeat(r.score)}${"☆".repeat(r.total - r.score)}</div>
                  <div class="growthScore">正确 ${r.score}/${r.total} 题</div>
                  <div class="growthAnswers">${r.answers.map((a, i) =>
                      `<span class="growthAns ${r.correct[i] ? 'ansOk' : 'ansNo'}">${i+1}${r.correct[i] ? "✅" : "❌"}</span>`
                  ).join("")}</div>
                ` : `<div class="growthEmpty">尚未完成本关</div>`}
              </div>`;
          }).join("")}
        </div>
        <div class="growthSummary">⭐ 总计获得 ${totalStars}/${totalPossible} 颗星星</div>
        <div class="growthBtnArea"><button class="growthCloseBtn" onclick="closeGrowthRecord()">关闭</button></div>
      </div>
    </div>`;
    document.body.appendChild(m);
}

function closeGrowthRecord() {
    const m = document.getElementById("growthRecordModal");
    if (m) m.remove();
}

/* ==========================
   积分评价系统
   ========================== */

const GAME_SPEED_THRESHOLDS = {
    cook: 30000, library: 45000, brush: 25000, branch: 15000
};

function calculateGameChallengeScore(gameId) {
    const stats = getGameStats()[gameId];
    if (!stats || !stats.completed) return 0;
    let score = 10;
    if (stats.attempts === 1) score += 5;
    if (stats.bestTime <= GAME_SPEED_THRESHOLDS[gameId]) score += 5;
    const achieveMap = { cook: "厨房达人", library: "借书达人", brush: "刷牙达人", branch: "分支达人" };
    if (achievements[achieveMap[gameId]]) score += 5;
    return score;
}

function calculateTaskSheetScore(gameId) {
    const result = getTaskResults()[gameId];
    if (!result) return 0;
    const sheet = taskSheets[gameId];
    const totalQ = sheet.questions.length;
    const ptsPerQ = 15 / totalQ;
    return Math.round(result.correct.filter(Boolean).reduce((s, c) => s + (c ? ptsPerQ : 0), 0));
}

function calculateGrowthRecordScore(gameId) {
    const stats = getGameStats()[gameId];
    const taskDone = !!getTaskResults()[gameId];
    return (stats && stats.completed && taskDone) ? 10 : 0;
}

function getTotalScores() {
    const ids = ["cook", "library", "brush", "branch"];
    let gameScore = 0, taskScore = 0, growthScore = 0;
    let totalCorrect = 0, totalQuestions = 0;
    ids.forEach(id => {
        gameScore += calculateGameChallengeScore(id);
        taskScore += calculateTaskSheetScore(id);
        growthScore += calculateGrowthRecordScore(id);
        const tr = getTaskResults()[id];
        if (tr) {
            const sheet = taskSheets[id];
            totalCorrect += tr.correct.filter(Boolean).length;
            totalQuestions += sheet.questions.length;
        } else {
            totalQuestions += taskSheets[id].questions.length;
        }
    });
    const total = gameScore + taskScore + growthScore;
    const taskAccuracy = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
    const totalCompleted = ids.filter(id => getGameStats()[id].completed).length;
    const completionRate = Math.round(totalCompleted / 4 * 100);
    let level = 0;
    if (totalCompleted >= 2) {
        if (totalCompleted === 4 && total >= 180 && taskAccuracy >= 90 && growthScore === 40) level = 3;
        else if (totalCompleted === 4 && total >= 120 && taskAccuracy >= 80) level = 2;
        else level = 1;
    }
    const levelNames = ["", "🏆 算法探索家", "🥇 算法小达人", "👑 算法大师"];
    const levelColors = ["", "#4CAF50", "#2196F3", "#FFD700"];
    return {
        gameScore, taskScore, growthScore, total,
        taskAccuracy, totalCorrect, totalQuestions,
        totalCompleted, completionRate,
        level, levelName: levelNames[level], levelColor: levelColors[level]
    };
}

function getStudentProfile() {
    const saved = sessionStorage.getItem("studentProfile");
    return saved ? JSON.parse(saved) : null;
}

function saveStudentProfile(name, className) {
    sessionStorage.setItem("studentProfile", JSON.stringify({ name, className }));
    const d = document.getElementById("profileDisplay");
    if (d) d.textContent = name ? name + (className ? " · " + className : "") : "";
    document.getElementById("studentProfileBtn").style.display = name ? "inline-block" : "none";
}

function showProfileModal(firstTime) {
    const existing = document.getElementById("profileModal");
    if (existing) existing.remove();
    const m = document.createElement("div");
    m.id = "profileModal";
    m.innerHTML = `
    <div class="profileOverlay">
      <div class="profileBox">
        <div class="profileHeader">👋 欢迎来到算法王国</div>
        <p class="profileSub">请先告诉我你的名字和班级吧！</p>
        <div class="profileField">
          <label>我的名字</label>
          <input id="profileName" placeholder="请输入姓名" maxlength="20">
        </div>
        <div class="profileField">
          <label>我的班级</label>
          <input id="profileClass" placeholder="例如：三年级一班" maxlength="30">
        </div>
        <div class="profileField">
          <label>老师姓名（选填）</label>
          <input id="profileTeacher" placeholder="你的信息科技老师" maxlength="20">
        </div>
        <button class="profileBtn" onclick="confirmProfile()">🚀 开始冒险</button>
      </div>
    </div>`;
    document.body.appendChild(m);
}

function confirmProfile() {
    const name = document.getElementById("profileName").value.trim();
    const className = document.getElementById("profileClass").value.trim();
    const teacher = document.getElementById("profileTeacher").value.trim();
    if (!name) { alert("请输入你的名字哦！"); return; }
    saveStudentProfile(name, className + (teacher ? " · " + teacher : ""));
    document.getElementById("profileModal").remove();
}

function editProfile() {
    document.getElementById("profileModal") && document.getElementById("profileModal").remove();
    const p = getStudentProfile();
    const m = document.createElement("div");
    m.id = "profileModal";
    m.innerHTML = `
    <div class="profileOverlay">
      <div class="profileBox">
        <div class="profileHeader">✏️ 修改个人信息</div>
        <div class="profileField">
          <label>我的名字</label>
          <input id="profileName" value="${p ? p.name : ''}" maxlength="20">
        </div>
        <div class="profileField">
          <label>我的班级</label>
          <input id="profileClass" value="${p ? p.className.split(' · ')[0] || '' : ''}" maxlength="30">
        </div>
        <button class="profileBtn" onclick="confirmProfile()">✅ 确认修改</button>
        <button class="profileBtn cancelBtn" onclick="document.getElementById('profileModal').remove()">取消</button>
      </div>
    </div>`;
    document.body.appendChild(m);
}

function renderGrowthRecord() {
    const raw = getTaskResults();
    const results = {};
    Object.keys(raw).filter(k => k !== '_version').forEach(k => results[k] = raw[k]);
    const scores = getTotalScores();
    const ids = ["cook", "library", "brush", "branch"];
    const gameLabels = { cook: "🍅 厨房小厨神", library: "📚 图书馆小达人", brush: "🪥 机器人刷牙", branch: "🚦 算法挑战赛" };
    const m = document.createElement("div");
    m.id = "growthRecordModal";
    m.innerHTML = `
    <div class="growthOverlay">
      <div class="growthBox">
        <h1>📒 我的成长记录册</h1>
        <div class="growthGrid">
          ${ids.map(id => {
              const stats = getGameStats()[id];
              const r = results[id];
              const s = taskSheets[id];
              const completed = stats && stats.completed;
              const taskDone = !!r;
              const gs = calculateGameChallengeScore(id);
              const ts = calculateTaskSheetScore(id);
              const gr = calculateGrowthRecordScore(id);
              return `
              <div class="growthCard ${completed ? 'growthDone' : ''}">
                <div class="growthCardHeader">
                  <span class="growthIcon">${s.icon}</span>
                  <span class="growthTitle">${gameLabels[id]}</span>
                  <span class="growthStatus">${completed ? "✅ 已完成" : "⏳ 未完成"}</span>
                </div>
                ${completed ? `
                  <div class="growthDetail">
                    <div class="growthRow"><span>🎮 游戏挑战</span><span>${gs}/25 分</span></div>
                    <div class="growthRow"><span>📝 任务单 ${taskDone ? "✅" : "⏳"}</span><span>${ts}/15 分</span></div>
                    <div class="growthRow"><span>📒 成长记录</span><span>${gr}/10 分</span></div>
                    ${taskDone ? `
                    <div class="growthStars">${"⭐".repeat(r.score)}${"☆".repeat(r.total - r.score)}</div>
                    <div class="growthAnswers">${r.answers.map((a, i) =>
                        `<span class="growthAns ${r.correct[i] ? 'ansOk' : 'ansNo'}">${i+1}${r.correct[i] ? "✅" : "❌"}</span>`
                    ).join("")}</div>
                    ` : `<div class="growthEmpty">任务单待填写</div>`}
                    <div class="growthSubTotal">本关合计：<strong>${gs + ts + gr}/50 分</strong></div>
                  </div>
                ` : `<div class="growthEmpty">尚未完成本关挑战</div>`}
              </div>`;
          }).join("")}
        </div>
        <div class="growthSummaryBox">
          <div class="growthSummaryRow"><span>🎮 游戏挑战积分</span><span>${scores.gameScore}/100</span></div>
          <div class="growthSummaryRow"><span>📝 任务单积分</span><span>${scores.taskScore}/60</span></div>
          <div class="growthSummaryRow"><span>📒 成长记录积分</span><span>${scores.growthScore}/40</span></div>
          <div class="growthSummaryTotal">⭐ 总积分：<strong>${scores.total}/200</strong></div>
          <div class="growthSummaryRow"><span>📊 正确率</span><span>${scores.taskAccuracy}% (${scores.totalCorrect}/${scores.totalQuestions} 题)</span></div>
          <div class="growthSummaryRow"><span>🎯 完成率</span><span>${scores.completionRate}% (${scores.totalCompleted}/4 关)</span></div>
          ${scores.level > 0 ? `
          <div class="growthLevel" style="background:${scores.levelColor}33;border:2px solid ${scores.levelColor}">
            <span style="font-size:24px">${["","🏆","🥇","👑"][scores.level]}</span>
            <span style="font-weight:bold;color:${scores.levelColor};font-size:20px">${scores.levelName}</span>
          </div>
          <div class="growthLevelDetail">
            ${scores.level === 3 ? "🎉 你是算法大师！能够发现生活中的算法，比较不同算法的优劣，选择更优算法解决问题！" : ""}
            ${scores.level === 2 ? "🎉 你是算法小达人！掌握了算法的有序性、步骤性和效率思想！" : ""}
            ${scores.level === 1 ? "🎉 你是算法探索家！能够发现生活中的算法，积极参与算法王国探险！" : ""}
          </div>
          ` : '<div class="growthLevel" style="background:#f5f5f5">继续完成更多挑战，获得证书吧！</div>'}
          ${scores.level > 0 ? `<button class="growthCertBtn" onclick="closeGrowthRecord();renderCertificate()">🎓 领取电子证书</button>` : ""}
        </div>
        <div class="growthBtnArea"><button class="growthCloseBtn" onclick="closeGrowthRecord()">关闭</button></div>
      </div>
    </div>`;
    document.body.appendChild(m);
}
