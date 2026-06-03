/* ==========================
   教师模式 (Teacher Mode)
   v1.0 - 算法王国大冒险
   ========================== */

const TEACHER_ACCOUNT = "admin";
const TEACHER_PASSWORD = "123456";
let teacherActiveTab = "dashboard";

/* ==========================
   登录系统
   ========================== */
function showTeacherLogin() {
    const m = document.createElement("div");
    m.id = "teacherLoginModal";
    m.innerHTML = `
    <div class="tmOverlay">
      <div class="tmLoginBox">
        <div class="tmLoginIcon">👨‍🏫</div>
        <h1>教师模式</h1>
        <p class="tmLoginSub">算法王国大冒险 · 教师管理后台</p>
        <div class="tmField">
          <label>账号</label>
          <input id="tmUser" value="${TEACHER_ACCOUNT}" placeholder="请输入教师账号">
        </div>
        <div class="tmField">
          <label>密码</label>
          <input id="tmPass" type="password" placeholder="请输入密码" onkeydown="if(event.key==='Enter')teacherLogin()">
        </div>
        <button class="tmLoginBtn" onclick="teacherLogin()">🔓 登录后台</button>
        <button class="tmLoginCancel" onclick="document.getElementById('teacherLoginModal').remove()">取消</button>
      </div>
    </div>`;
    document.body.appendChild(m);
    setTimeout(() => document.getElementById("tmPass").focus(), 300);
}

function teacherLogin() {
    const u = document.getElementById("tmUser").value.trim();
    const p = document.getElementById("tmPass").value.trim();
    if (u !== TEACHER_ACCOUNT || p !== TEACHER_PASSWORD) {
        alert("账号或密码错误！\n默认账号: admin  密码: 123456");
        return;
    }
    document.getElementById("teacherLoginModal").remove();
    renderTeacherDashboard();
}

function teacherLogout() {
    const m = document.getElementById("teacherDashboard");
    if (m) m.remove();
}

/* ==========================
   数据读取辅助
   ========================== */
function tmGetStudent() {
    return getStudentProfile ? getStudentProfile() : null;
}
function tmGetStats() {
    return typeof getGameStats === "function" ? getGameStats() : null;
}
function tmGetAchievements() {
    if (typeof achievements !== "undefined") return achievements;
    return {};
}
function tmGetTaskResults() {
    return typeof getTaskResults === "function" ? getTaskResults() : {};
}
function tmGetLeaderboard() {
    return typeof getLeaderboard === "function" ? getLeaderboard() : [];
}
function tmGetScores() {
    return typeof getTotalScores === "function" ? getTotalScores() : null;
}

/* ==========================
   教师后台首页
   ========================== */
function renderTeacherDashboard() {
    if (document.getElementById("teacherDashboard")) return;
    const scores = tmGetScores() || {};
    const stats = tmGetStats() || {};
    const leaderboard = tmGetLeaderboard();
    const student = tmGetStudent();
    const tasks = tmGetTaskResults();
    const achieve = tmGetAchievements();

    const totalGames = 4;
    const completedCount = stats.total ? stats.total.completed : 0;
    const tasksDone = Object.keys(tasks).filter(k => tasks[k] && tasks[k].score !== undefined).length;

    const levelCounts = { 1: 0, 2: 0, 3: 0 };
    leaderboard.forEach(r => { if (r.grade >= 1 && r.grade <= 3) levelCounts[r.grade]++; });

    const top3 = leaderboard.slice(0, 3);
    const allScores = leaderboard.map(r => r.score);
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const maxScore = allScores.length ? Math.max(...allScores) : 0;
    const minScore = allScores.length ? Math.min(...allScores) : 0;

    const d = document.createElement("div");
    d.id = "teacherDashboard";
    d.innerHTML = `
    <div class="tmFull">
      <div class="tmHeader">
        <span class="tmLogo">👨‍🏫 教师模式</span>
        <span class="tmHeaderRight">
          <button class="tmHeaderBtn" onclick="tmExportCSV()">📥 导出CSV</button>
          <button class="tmHeaderBtn" onclick="teacherLogout();location.reload()">🚪 退出</button>
        </span>
      </div>
      <div class="tmBody">
        <div class="tmSidebar">
          <div class="tmTab ${teacherActiveTab === 'dashboard' ? 'active' : ''}" onclick="tmSwitchTab('dashboard')">📊 数据总览</div>
          <div class="tmTab ${teacherActiveTab === 'students' ? 'active' : ''}" onclick="tmSwitchTab('students')">👥 学生管理</div>
          <div class="tmTab ${teacherActiveTab === 'tasks' ? 'active' : ''}" onclick="tmSwitchTab('tasks')">📝 学习单管理</div>
          <div class="tmTab ${teacherActiveTab === 'leaderboard' ? 'active' : ''}" onclick="tmSwitchTab('leaderboard')">🏆 排行榜管理</div>
          <div class="tmTab ${teacherActiveTab === 'growth' ? 'active' : ''}" onclick="tmSwitchTab('growth')">📒 成长记录册</div>
          <div class="tmTab ${teacherActiveTab === 'certificates' ? 'active' : ''}" onclick="tmSwitchTab('certificates')">🎓 证书管理</div>
          <div class="tmTab ${teacherActiveTab === 'classroom' ? 'active' : ''}" onclick="tmSwitchTab('classroom')">🎮 课堂控制</div>
          <div class="tmTab ${teacherActiveTab === 'analysis' ? 'active' : ''}" onclick="tmSwitchTab('analysis')">📈 数据分析</div>
          <div class="tmTab ${teacherActiveTab === 'data' ? 'active' : ''}" onclick="tmSwitchTab('data')">💾 数据管理</div>
        </div>
        <div class="tmContent" id="tmContent">
          ${tmRenderDashboard()}
        </div>
      </div>
    </div>`;
    document.body.appendChild(d);
}

function tmSwitchTab(tab) {
    teacherActiveTab = tab;
    document.querySelectorAll(".tmTab").forEach(t => t.classList.toggle("active", t.textContent.includes({
        dashboard: "数据总览", students: "学生管理", tasks: "学习单管理",
        leaderboard: "排行榜管理", growth: "成长记录册", certificates: "证书管理",
        classroom: "课堂控制", analysis: "数据分析", data: "数据管理"
    }[tab])));
    // 学生管理标签时同步服务器数据
    if (tab === "students") {
        tmSyncStudents().then(() => {
            document.getElementById("tmContent").innerHTML = tmRenderStudents();
        });
        return;
    }
    document.getElementById("tmContent").innerHTML = {
        dashboard: tmRenderDashboard(),
        students: tmRenderStudents(),
        tasks: tmRenderTasks(),
        leaderboard: tmRenderLeaderboard(),
        growth: tmRenderGrowth(),
        certificates: tmRenderCertificates(),
        classroom: tmRenderClassroom(),
        analysis: tmRenderAnalysis(),
        data: tmRenderData()
    }[tab] || "<p>加载中...</p>";
    tmBindEvents(tab);
}

function tmBindEvents(tab) {
    if (tab === "classroom") {
        const gs = document.querySelectorAll(".tmGameLock");
        gs.forEach(btn => btn.onclick = function() {
            this.classList.toggle("locked");
            this.textContent = this.classList.contains("locked") ? "🔒 已锁定" : "🔓 开放";
        });
    }
}

/* ==========================
   数据总览面板
   ========================== */
function tmRenderDashboard() {
    const leaderboard = tmGetLeaderboard();
    const scores = tmGetScores() || {};
    const stats = tmGetStats() || {};
    const tasks = tmGetTaskResults();
    const student = tmGetStudent();
    const achieve = tmGetAchievements();

    const totalStudents = leaderboard.length;
    const allScores = leaderboard.map(r => r.score);
    const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
    const maxScore = allScores.length ? Math.max(...allScores) : 0;
    const minScore = allScores.length ? Math.min(...allScores) : 0;
    const levelCounts = { 1: 0, 2: 0, 3: 0 };
    leaderboard.forEach(r => { if (r.grade >= 1 && r.grade <= 3) levelCounts[r.grade]++; });
    const top3 = leaderboard.slice(0, 3);
    const tasksDone = Object.keys(tasks).filter(k => k !== "_version" && tasks[k] && tasks[k].score !== undefined).length;

    return `
    <div class="tmSection">
      <h2>📊 班级学习数据总览</h2>
      <div class="tmDashGrid">
        <div class="tmDashCard"><span class="tmDashNum">${totalStudents}</span><span class="tmDashLabel">学生总人数</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${tasksDone === 4 ? 1 : 0}</span><span class="tmDashLabel">完成全部任务</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${avgScore}</span><span class="tmDashLabel">平均分</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${maxScore}</span><span class="tmDashLabel">最高分</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${minScore}</span><span class="tmDashLabel">最低分</span></div>
        <div class="tmDashCard"><span class="tmDashNum" style="color:#4CAF50">${levelCounts[1]}</span><span class="tmDashLabel">🏆 探索家</span></div>
        <div class="tmDashCard"><span class="tmDashNum" style="color:#2196F3">${levelCounts[2]}</span><span class="tmDashLabel">🥇 小达人</span></div>
        <div class="tmDashCard"><span class="tmDashNum" style="color:#FFD700">${levelCounts[3]}</span><span class="tmDashLabel">👑 大师</span></div>
      </div>
      ${top3.length ? `
      <h3 style="margin-top:16px">🥇 排行榜前三名</h3>
      <table class="tmTable">
        <tr><th>🏅</th><th>姓名</th><th>总分</th><th>等级</th></tr>
        ${top3.map((r, i) => `<tr><td>${["🥇","🥈","🥉"][i]||(i+1)}</td><td>${r.name}</td><td>${r.score}</td><td>${r.levelName}</td></tr>`).join("")}
      </table>` : '<p style="color:#999;margin-top:12px">暂无排行榜数据</p>'}
      ${student ? `<div class="tmCurrentUser">👤 当前学生：${student.name} ${student.className || ""}</div>` : ""}
    </div>`;
}

/* ==========================
   学生管理
   ========================== */
let _tmAllStudents = [];

async function tmSyncStudents() {
    _tmAllStudents = [];
    // 加载本地学生
    const local = tmGetStudent();
    if (local) _tmAllStudents.push(local);
    // 从服务器加载
    try {
        const res = await fetch(window.location.origin + "/api/students");
        if (res.ok) {
            const cloud = await res.json();
            cloud.forEach(s => {
                if (!_tmAllStudents.find(e => e.name === s.name)) {
                    _tmAllStudents.push(s);
                }
            });
        }
    } catch {}
}

function tmRenderStudents() {
    const leaderboard = tmGetLeaderboard();
    const tasks = tmGetTaskResults();
    const stats = tmGetStats();

    if (_tmAllStudents.length === 0 && leaderboard.length === 0) {
        return `
        <div class="tmSection">
          <h2>👥 学生管理</h2>
          <p class="tmEmpty">暂无学生数据，完成游戏后会自动记录</p>
        </div>`;
    }

    let rows = leaderboard.map((r, i) => {
        const info = _tmAllStudents.find(s => s.name === r.name);
        const cls = info ? info.className || "" : "";
        return `
        <tr>
          <td>${i + 1}</td>
          <td>${r.name}${cls ? "<br><small>" + cls + "</small>" : ""}</td>
          <td>${r.date}</td>
          <td>${r.totalScore || r.score || 0}/200</td>
          <td>${r.levelName}</td>
          <td class="tmActions">
            <button onclick="tmViewStudent('${r.name}')" title="查看">👁️</button>
            <button onclick="tmEditStudent('${r.name}')" title="编辑">✏️</button>
            <button onclick="tmDeleteStudent('${r.name}')" title="删除">🗑️</button>
          </td>
        </tr>`;
    }).join("");

    return `
    <div class="tmSection">
      <h2>👥 学生管理 (${_tmAllStudents.length} 人)</h2>
      <table class="tmTable">
        <tr><th>#</th><th>姓名/班级</th><th>日期</th><th>总分</th><th>等级</th><th>操作</th></tr>
        ${rows}
      </table>
      <div class="tmNote">💡 点击 👁️ 查看详情，✏️ 编辑，🗑️ 删除</div>
    </div>`;
}

function tmViewStudent(name) {
    const lb = tmGetLeaderboard();
    const r = lb.find(x => x.name === name);
    if (!r) { alert("未找到该学生数据"); return; }
    const scores = tmGetScores();
    const tasks = tmGetTaskResults();
    const stats = tmGetStats();

    let taskHtml = Object.keys(tasks).filter(k => k !== "_version").map(id => {
        const sheet = taskSheets && taskSheets[id];
        const t = tasks[id];
        if (!t || !sheet) return "";
        return `<div class="tmMiniCard">${sheet.icon || "📝"} ${sheet.title || id}: ${t.score}/${t.total} 正确率 ${Math.round(t.correct.filter(Boolean).length / t.total * 100)}%</div>`;
    }).join("");

    alert(`📋 ${r.name} 的学习报告\n\n总分: ${r.score}/200\n证书等级: ${r.levelName}\n日期: ${r.date}\n\n任务单:\n${taskHtml || "暂无任务单数据"}`);
}

function tmEditStudent(name) {
    const lb = tmGetLeaderboard();
    const idx = lb.findIndex(x => x.name === name);
    if (idx === -1) { alert("未找到该学生"); return; }
    const newScore = prompt(`修改 ${name} 的总分（当前: ${lb[idx].score}）:`, lb[idx].score);
    if (newScore === null) return;
    const s = parseInt(newScore);
    if (isNaN(s) || s < 0 || s > 200) { alert("请输入0-200之间的分数"); return; }
    let grade = 0;
    if (s >= 180) grade = 3;
    else if (s >= 120) grade = 2;
    else if (s >= 0) grade = 1;
    const grades = ["", "🏆 算法探索家", "🥇 算法小达人", "👑 算法大师"];
    lb[idx].score = s;
    lb[idx].grade = grade;
    lb[idx].levelName = grades[grade];
    localStorage.setItem("algorithmKingdomLeaderboard", JSON.stringify(lb));
    tmSwitchTab("students");
}

function tmDeleteStudent(name) {
    if (!confirm(`确定删除 ${name} 的所有数据？`)) return;
    const lb = tmGetLeaderboard();
    const newLB = lb.filter(x => x.name !== name);
    localStorage.setItem(LB_KEY, JSON.stringify(newLB));
    // 同步删除到服务器
    try {
        fetch(window.location.origin + "/api/students/" + encodeURIComponent(name), { method: "DELETE" });
    } catch {}
    tmSwitchTab("students");
}

/* ==========================
   学习单管理
   ========================== */
function tmRenderTasks() {
    const tasks = tmGetTaskResults();
    const taskIds = Object.keys(tasks).filter(k => k !== "_version");
    if (!taskIds.length) return '<div class="tmSection"><h2>📝 学习单管理</h2><p class="tmEmpty">暂无任务单数据，完成游戏后会自动记录</p></div>';

    return `
    <div class="tmSection">
      <h2>📝 学习单管理</h2>
      ${taskIds.map(id => {
          const t = tasks[id];
          const sheet = taskSheets && taskSheets[id];
          if (!t || !sheet) return "";
          const correctCount = t.correct ? t.correct.filter(Boolean).length : 0;
          const total = t.total || sheet.questions.length;
          const rate = Math.round(correctCount / total * 100);
          return `
          <div class="tmTaskCard">
            <div class="tmTaskHeader">${sheet.icon || "📝"} ${sheet.title || id} — 正确率 ${rate}% (${correctCount}/${total})</div>
            ${sheet.questions.map((q, qi) => `
              <div class="tmTaskQ ${t.correct && t.correct[qi] ? 'tmQCorrect' : 'tmQWrong'}">
                <span class="tmQNum">Q${qi+1}</span>
                <span class="tmQText">${q.text}</span>
                <span class="tmQAns">${t.correct && t.correct[qi] ? "✅" : "❌"} 选择了: ${q.options[t.answers ? t.answers[qi] : 0] || "未作答"}</span>
              </div>
            `).join("")}
            <div class="tmTaskFooter">完成时间: ${t.timestamp ? new Date(t.timestamp).toLocaleString() : "未知"}</div>
          </div>`;
      }).join("")}
    </div>`;
}

/* ==========================
   排行榜管理
   ========================== */
function tmRenderLeaderboard() {
    const lb = tmGetLeaderboard();
    const searchBox = `<input class="tmSearchBox" id="lbSearch" placeholder="🔍 搜索学生姓名..." oninput="tmFilterLeaderboard()">`;

    return `
    <div class="tmSection">
      <h2>🏆 排行榜管理</h2>
      ${searchBox}
      ${!lb.length ? '<p class="tmEmpty">暂无排行榜数据</p>' : `
      <table class="tmTable" id="lbTable">
        <tr><th>🏅 排名</th><th>👤 姓名</th><th>⭐ 总分</th><th>🎖️ 等级</th><th>📅 日期</th></tr>
        ${lb.map((r, i) => `
          <tr class="lbRow" data-name="${r.name}">
            <td>${["🥇","🥈","🥉"][i] || (i+1)}</td>
            <td>${r.name}</td>
            <td><strong>${r.score}</strong></td>
            <td>${r.levelName}</td>
            <td>${r.date}</td>
          </tr>`).join("")}
      </table>`}
      <div class="tmBtnRow">
        <button class="tmBtn" onclick="if(confirm('确定清空排行榜？')){clearLeaderboard();tmSwitchTab('leaderboard');}">🗑️ 清空排行榜</button>
        <button class="tmBtn" onclick="tmExportLeaderboard()">📥 导出排行榜</button>
      </div>
    </div>`;
}

function tmFilterLeaderboard() {
    const q = document.getElementById("lbSearch").value.trim().toLowerCase();
    document.querySelectorAll("#lbTable .lbRow").forEach(row => {
        row.style.display = q ? (row.dataset.name.toLowerCase().includes(q) ? "" : "none") : "";
    });
}

function tmExportLeaderboard() {
    const lb = tmGetLeaderboard();
    if (!lb.length) { alert("暂无数据可导出"); return; }
    let csv = "排名,姓名,总分,证书等级,日期\n";
    lb.forEach((r, i) => { csv += `${i+1},${r.name},${r.score},${r.levelName},${r.date}\n`; });
    tmDownloadCSV(csv, "排行榜数据.csv");
}

/* ==========================
   成长记录册管理
   ========================== */
function tmRenderGrowth() {
    const tasks = tmGetTaskResults();
    const scores = tmGetScores() || {};
    const stats = tmGetStats() || {};
    const student = tmGetStudent();
    const achieve = tmGetAchievements();

    const ids = ["cook", "library", "brush", "branch"];
    const labels = { cook: "🍅 厨房小厨神", library: "📚 图书馆小达人", brush: "🪥 机器人刷牙", branch: "🚦 机器人回家" };

    let teacherEval = localStorage.getItem("tmTeacherEval") || "";

    return `
    <div class="tmSection">
      <h2>📒 成长记录册管理</h2>
      ${!student ? '<p class="tmEmpty">当前没有学生数据，请先完成个人信息填写。</p>' : `
      <div class="tmStudentHeader">👤 ${student.name} ${student.className || ""}</div>
      <div class="tmGrowthGrid">
        ${ids.map(id => {
            const t = tasks[id];
            const s = taskSheets && taskSheets[id];
            const gs = stats[id];
            const completed = gs && gs.completed;
            if (!t || !s) return `<div class="tmMiniCard">${labels[id]} — ⏳ 未完成</div>`;
            return `
            <div class="tmMiniCard ${completed ? 'tmDone' : ''}">
              <div class="tmMiniTitle">${labels[id]}</div>
              <div>⭐ ${t.score}/${t.total} 颗星</div>
              <div>📊 正确率 ${Math.round((t.correct || []).filter(Boolean).length / (t.total || 1) * 100)}%</div>
              <div class="tmMiniAns">${(t.answers || []).map((a, i) => `<span class="tmAnsDot ${(t.correct||[])[i] ? 'ansOk' : 'ansNo'}">${i+1}</span>`).join("")}</div>
            </div>`;
        }).join("")}
      </div>
      <div class="tmScoreSummary">
        <span>⭐ 总积分: <strong>${scores.total || 0}/200</strong></span>
        <span>🎖️ 等级: <strong>${scores.levelName || "--"}</strong></span>
        <span>🏆 成就: ${Object.keys(achieve).filter(k => achieve[k]).map(k => "⭐" + k).join(" ") || "无"}</span>
      </div>
      <div class="tmEvalArea">
        <h3>📝 教师评价</h3>
        <select id="tmEvalSelect" onchange="tmSaveEval()">
          <option value="">-- 选择评价 --</option>
          <option value="优秀" ${teacherEval === "优秀" ? "selected" : ""}>🌟 优秀</option>
          <option value="良好" ${teacherEval === "良好" ? "selected" : ""}>👍 良好</option>
          <option value="继续努力" ${teacherEval === "继续努力" ? "selected" : ""}>💪 继续努力</option>
        </select>
        <div class="tmAutoEval">${tmAutoEvaluate(scores)}</div>
      </div>`}
    </div>`;
}

function tmSaveEval() {
    const v = document.getElementById("tmEvalSelect").value;
    localStorage.setItem("tmTeacherEval", v);
}

function tmAutoEvaluate(scores) {
    if (!scores || !scores.total) return "💡 完成游戏后，系统将自动生成评价建议。";
    const l = scores.level;
    const t = scores.taskAccuracy || 0;
    if (l === 3) return "🌟 能够掌握算法的基本特征，积极参与游戏挑战，比较不同算法并选择更优方案。表现优异！";
    if (l === 2) return "👍 能够理解算法的有序性和步骤性，掌握了借书等生活场景的算法应用。建议进一步提升算法优化意识。";
    if (l === 1) return "💪 初步了解算法的概念，能够按照步骤完成任务。建议多练习，尝试比较不同方法的优劣。";
    return "💡 继续完成挑战，系统将根据表现生成个性化评价。";
}

/* ==========================
   证书管理
   ========================== */
function tmRenderCertificates() {
    const lb = tmGetLeaderboard();
    const student = tmGetStudent();

    return `
    <div class="tmSection">
      <h2>🎓 证书管理</h2>
      ${!lb.length ? '<p class="tmEmpty">暂无证书数据</p>' : `
      <table class="tmTable">
        <tr><th>#</th><th>姓名</th><th>等级</th><th>总分</th><th>操作</th></tr>
        ${lb.map((r, i) => `
          <tr>
            <td>${i+1}</td>
            <td>${r.name}</td>
            <td>${r.levelName}</td>
            <td>${r.score}</td>
            <td class="tmActions">
              <button onclick="alert('请先在首页输入学生姓名生成证书')">🎨 生成</button>
              <button onclick="alert('请先在首页生成证书后下载')">📥 下载</button>
            </td>
          </tr>`).join("")}
      </table>`}
      <div class="tmNote">💡 生成和下载证书请在首页「🎓 领取证书」中操作</div>
    </div>`;
}

/* ==========================
   课堂控制中心
   ========================== */
let tmClassroomState = "idle";
let tmPickTimer = null;

function tmRenderClassroom() {
    const student = tmGetStudent();
    return `
    <div class="tmSection">
      <h2>🎮 课堂控制中心</h2>
      <div class="tmClassroomStatus">
        课堂状态: <span class="tmStatusBadge ${tmClassroomState}">${{"idle":"⏸️ 未开始","active":"▶️ 进行中","paused":"⏸️ 已暂停","ended":"🔚 已结束"}[tmClassroomState]}</span>
      </div>
      <div class="tmBtnRow">
        <button class="tmBtn tmBtnGreen" onclick="tmSetClassState('active')">▶️ 开始课堂</button>
        <button class="tmBtn tmBtnOrange" onclick="tmSetClassState('paused')">⏸️ 暂停</button>
        <button class="tmBtn tmBtnRed" onclick="tmSetClassState('ended')">🔚 结束</button>
      </div>

      <h3 style="margin-top:16px">🔒 游戏控制</h3>
      <div class="tmGameGrid">
        ${["🍅 厨房小厨神","📚 图书馆小达人","🪥 机器人刷牙","🚦 算法挑战赛"].map((g, i) =>
          `<div class="tmGameLockBtn"><span>${g}</span><button class="tmGameLock">🔓 开放</button></div>`
        ).join("")}
      </div>

      <h3 style="margin-top:16px">🎲 随机点名</h3>
      <div class="tmPickArea">
        <div class="tmPickDisplay" id="tmPickDisplay">${student ? `👤 ${student.name}` : "🎯 点击抽取"}</div>
        <div class="tmBtnRow">
          <button class="tmBtn" onclick="tmRandomPick()">🎲 随机抽取</button>
          <button class="tmBtn tmBtnOrange" onclick="tmStopPick()">⏹️ 停止</button>
        </div>
      </div>

      <h3 style="margin-top:16px">⚡ 课堂抢答</h3>
      <div class="tmBtnRow">
        <button class="tmBtn tmBtnGreen" onclick="tmStartQuiz()">🚩 开始抢答</button>
        <button class="tmBtn tmBtnRed" onclick="tmEndQuiz()">⏹️ 结束抢答</button>
      </div>
      <div id="tmQuizDisplay" style="margin-top:8px;font-size:18px;text-align:center">点击「开始抢答」后，按 Enter 键抢答</div>

      <div class="tmCurrentUser" style="margin-top:12px">👤 当前学生：${student ? student.name : "未设置"}</div>
    </div>`;
}

function tmSetClassState(state) {
    tmClassroomState = state;
    const badge = document.querySelector(".tmStatusBadge");
    if (badge) {
        badge.className = "tmStatusBadge " + state;
        badge.textContent = {"active":"▶️ 进行中","paused":"⏸️ 已暂停","ended":"🔚 已结束","idle":"⏸️ 未开始"}[state];
    }
}

function tmRandomPick() {
    const lb = tmGetLeaderboard();
    if (!lb.length) { alert("暂无学生数据"); return; }
    const display = document.getElementById("tmPickDisplay");
    let idx = 0;
    if (tmPickTimer) clearInterval(tmPickTimer);
    tmPickTimer = setInterval(() => {
        idx = Math.floor(Math.random() * lb.length);
        display.textContent = `🎯 ${lb[idx].name}`;
    }, 80);
    setTimeout(() => {
        if (tmPickTimer) { clearInterval(tmPickTimer); tmPickTimer = null; }
        display.textContent = `🎉 ${lb[idx].name}`;
    }, 2000);
}

function tmStopPick() {
    if (tmPickTimer) { clearInterval(tmPickTimer); tmPickTimer = null; }
}

let tmQuizActive = false;
function tmStartQuiz() {
    tmQuizActive = true;
    document.getElementById("tmQuizDisplay").textContent = "🚩 抢答开始！按 Enter 键抢答！";
    document.addEventListener("keydown", tmQuizKeyHandler);
}
function tmEndQuiz() {
    tmQuizActive = false;
    document.removeEventListener("keydown", tmQuizKeyHandler);
    document.getElementById("tmQuizDisplay").textContent = "⏹️ 抢答已结束";
}
function tmQuizKeyHandler(e) {
    if (e.key === "Enter" && tmQuizActive) {
        tmQuizActive = false;
        document.removeEventListener("keydown", tmQuizKeyHandler);
        const student = tmGetStudent();
        document.getElementById("tmQuizDisplay").textContent = `🎉 ${student ? student.name : "当前学生"} 抢答成功！+10 ⭐`;
    }
}

/* ==========================
   数据分析
   ========================== */
function tmRenderAnalysis() {
    const scores = tmGetScores() || {};
    const stats = tmGetStats() || {};
    const tasks = tmGetTaskResults();
    const achieve = tmGetAchievements();
    const lb = tmGetLeaderboard();

    const maxScore = lb.length ? Math.max(...lb.map(r => r.score)) : 0;
    const minScore = lb.length ? Math.min(...lb.map(r => r.score)) : 0;
    const avgScore = lb.length ? Math.round(lb.reduce((s, r) => s + r.score, 0) / lb.length) : 0;
    const levelDist = { 1: 0, 2: 0, 3: 0 };
    lb.forEach(r => { if (r.grade >= 1 && r.grade <= 3) levelDist[r.grade]++; });

    const taskRates = Object.keys(tasks).filter(k => k !== "_version").map(id => {
        const t = tasks[id];
        const sheet = taskSheets && taskSheets[id];
        if (!t || !sheet) return 0;
        return Math.round((t.correct || []).filter(Boolean).length / (t.total || 1) * 100);
    });

    const taskLabels = ["厨房", "图书馆", "刷牙", "挑战赛"];

    const barHtml = (label, pct, color) => `
      <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
        <span style="width:60px;font-size:13px;color:#666">${label}</span>
        <div style="flex:1;height:20px;background:#F0F0F0;border-radius:10px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:10px;transition:width .6s"></div>
        </div>
        <span style="width:40px;font-size:13px;font-weight:bold;color:#333">${pct}%</span>
      </div>`;

    return `
    <div class="tmSection">
      <h2>📈 数据分析</h2>
      <h3>📊 成绩概览</h3>
      <div class="tmDashGrid">
        <div class="tmDashCard"><span class="tmDashNum">${avgScore}</span><span class="tmDashLabel">平均成绩</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${maxScore}</span><span class="tmDashLabel">最高成绩</span></div>
        <div class="tmDashCard"><span class="tmDashNum">${minScore}</span><span class="tmDashLabel">最低成绩</span></div>
      </div>

      <h3 style="margin-top:16px">📝 任务单正确率</h3>
      ${taskRates.length ? taskRates.map((r, i) => barHtml(taskLabels[i] || "游戏" + (i+1), r, ["#FF7043","#42A5F5","#26A69A","#FFA726"][i] || "#66BB6A")).join("") : '<p class="tmEmpty">暂无数据</p>'}

      <h3 style="margin-top:16px">🎖️ 证书等级分布</h3>
      ${barHtml("🏆 探索家", levelDist[1] ? Math.round(levelDist[1]/lb.length*100) : 0, "#4CAF50")}
      ${barHtml("🥇 小达人", levelDist[2] ? Math.round(levelDist[2]/lb.length*100) : 0, "#2196F3")}
      ${barHtml("👑 大师", levelDist[3] ? Math.round(levelDist[3]/lb.length*100) : 0, "#FFD700")}

      <div class="tmNote" style="margin-top:12px">💡 数据基于当前排行榜中 ${lb.length} 名学生的记录</div>
    </div>`;
}

/* ==========================
   数据管理
   ========================== */
function tmRenderData() {
    return `
    <div class="tmSection">
      <h2>💾 数据管理</h2>
      <div class="tmBtnRow">
        <button class="tmBtn" onclick="tmExportCSV()">📥 导出 CSV</button>
        <button class="tmBtn" onclick="tmExportJSON()">📥 导出 JSON</button>
      </div>
      <div class="tmBtnRow">
        <button class="tmBtn tmBtnOrange" onclick="tmImportJSON()">📤 导入数据</button>
        <button class="tmBtn tmBtnRed" onclick="if(confirm('确定要清空所有数据吗？包括排行榜、游戏记录、任务单等。')){localStorage.clear();sessionStorage.clear();alert('已清空所有数据');location.reload();}">🗑️ 清空全部数据</button>
      </div>
      <div class="tmNote" style="margin-top:12px">
        💡 导出CSV可用Excel打开<br>
        💡 导出JSON包含完整数据，可用于备份和恢复<br>
        💡 排行榜数据保存在 localStorage，学生进度保存在 sessionStorage（关闭页面后自动清除）
      </div>
    </div>`;
}

function tmExportCSV() {
    const lb = tmGetLeaderboard();
    const tasks = tmGetTaskResults();
    if (!lb.length) { alert("暂无排行榜数据可导出"); return; }
    let csv = "排名,姓名,总分,证书等级,日期\n";
    lb.forEach((r, i) => { csv += `${i+1},${r.name},${r.score},${r.levelName},${r.date}\n`; });
    if (Object.keys(tasks).length > 1) {
        csv += "\n任务单数据\n游戏,得分,总数,正确率\n";
        Object.keys(tasks).filter(k => k !== "_version").forEach(id => {
            const t = tasks[id];
            const sheet = taskSheets && taskSheets[id];
            if (t && sheet) {
                const rate = Math.round((t.correct || []).filter(Boolean).length / (t.total || 1) * 100);
                csv += `${sheet.title || id},${t.score},${t.total},${rate}%\n`;
            }
        });
    }
    tmDownloadCSV(csv, "算法王国数据导出.csv");
    alert("CSV 导出完成！");
}

function tmExportJSON() {
    const data = {
        leaderboard: tmGetLeaderboard(),
        gameStats: tmGetStats(),
        achievements: tmGetAchievements(),
        taskResults: tmGetTaskResults(),
        exportTime: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.download = "算法王国数据备份.json";
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
}

function tmImportJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.leaderboard) localStorage.setItem("algorithmKingdomLeaderboard", JSON.stringify(data.leaderboard));
                if (data.gameStats) sessionStorage.setItem("gameStats", JSON.stringify(data.gameStats));
                if (data.achievements) sessionStorage.setItem("achievements", JSON.stringify(data.achievements));
                if (data.taskResults) sessionStorage.setItem("taskResults", JSON.stringify(data.taskResults));
                alert("✅ 数据导入成功！请刷新页面查看。");
                location.reload();
            } catch(err) {
                alert("❌ 数据格式错误：" + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function tmDownloadCSV(csv, filename) {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    URL.revokeObjectURL(a.href);
}
