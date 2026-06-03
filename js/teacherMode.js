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
    const getScore = r => r.totalScore || r.score || 0;
    const allScores = leaderboard.map(r => getScore(r));
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
    const getScore = r => r.totalScore || r.score || 0;
    const allScores = leaderboard.map(r => getScore(r));
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
        ${top3.map((r, i) => `<tr><td>${["🥇","🥈","🥉"][i]||(i+1)}</td><td>${r.name}</td><td>${getScore(r)}</td><td>${r.levelName}</td></tr>`).join("")}
      </table>` : '<p style="color:#999;margin-top:12px">暂无排行榜数据</p>'}
      ${student ? `<div class="tmCurrentUser">👤 当前学生：${student.name} ${student.className || ""}</div>` : ""}
    </div>`;
}

/* ==========================
   学生管理
   ========================== */
const _tmScore = r => r.totalScore || r.score || 0;
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
    if (_tmAllStudents.length === 0) {
        return `
        <div class="tmSection">
          <h2>👥 学生管理</h2>
          <p class="tmEmpty">暂无学生数据，学生填写信息后会自动出现在这里</p>
        </div>`;
    }

    let rows = _tmAllStudents.map((s, i) => {
        return `
        <tr>
          <td>${i + 1}</td>
          <td>${s.name}${s.className ? "<br><small>" + s.className + "</small>" : ""}</td>
          <td>${s.time ? new Date(s.time).toLocaleDateString("zh-CN") : "--"}</td>
          <td>--</td>
          <td>--</td>
          <td class="tmActions">
            <button onclick="tmDeleteStudent('${s.name}')" title="删除">🗑️</button>
          </td>
        </tr>`;
    }).join("");

    return `
    <div class="tmSection">
      <h2>👥 学生管理 (${_tmAllStudents.length} 人)</h2>
      <div class="tmNote">💡 学生填写信息后自动收录，排行榜数据需学生完成游戏后提交</div>
      <table class="tmTable">
        <tr><th>#</th><th>姓名/班级</th><th>填写时间</th><th>总分</th><th>等级</th><th>操作</th></tr>
        ${rows}
      </table>
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

    alert(`📋 ${r.name} 的学习报告\n\n总分: ${_tmScore(r)}/200\n证书等级: ${r.levelName}\n日期: ${r.date}\n\n任务单:\n${taskHtml || "暂无任务单数据"}`);
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
            <td><strong>${_tmScore(r)}</strong></td>
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
    lb.forEach((r, i) => { csv += `${i+1},${r.name},${_tmScore(r)},${r.levelName},${r.date}\n`; });
    tmDownloadCSV(csv, "排行榜数据.csv");
}

function tmExportScoreDetail() {
    const lb = tmGetLeaderboard();
    if (!lb.length) { alert("暂无数据可导出"); return; }
    let csv = "排名,姓名,总分,证书等级,日期\n";
    lb.forEach((r, i) => { csv += `${i+1},${r.name},${_tmScore(r)},${r.levelName},${r.date}\n`; });
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
