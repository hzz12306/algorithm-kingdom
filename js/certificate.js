/* ==========================
   分级证书系统
   ========================== */

function renderCertificate(){
    const scores = getTotalScores();
    const profile = getStudentProfile();
    const levelTitles = ["", "算法探索家", "算法小达人", "算法大师"];
    const levelEmojis = ["", "🏆", "🥇", "👑"];
    const levelBgs = ["", "#4CAF50", "#2196F3", "#FFD700"];
    const levelDescs = [
        "",
        "能够发现生活中的算法，\n积极参与算法王国探险。",
        "掌握算法的有序性、\n步骤性和效率思想。",
        "能够发现生活中的算法，\n比较不同算法的优劣，\n选择更优算法解决问题。"
    ];

    document.body.innerHTML = `
    <div class="certificateScene">
        <h1>${levelEmojis[scores.level]} 算法王国证书</h1>
        <div class="certLevelSelect">
            ${[1,2,3].map(l => `
                <button class="certLevelTab ${l === scores.level ? 'active' : ''}"
                    onclick="renderCertificateLevel(${l})"
                    style="${l === scores.level ? 'background:' + levelBgs[l] + ';color:' + (l===3?'#333':'white') : ''}">
                    ${levelEmojis[l]} ${levelTitles[l]}
                </button>
            `).join("")}
        </div>
        <div class="nameInputBox">
            <input id="studentName" placeholder="请输入学生姓名"
                value="${profile ? profile.name : ''}">
            <button onclick="generateCertificate()">🎨 生成证书</button>
        </div>
        <canvas id="certificateCanvas" width="1200" height="850"></canvas>
        <div class="certActions">
            <button onclick="downloadCertificate()">📥 下载证书</button>
            <button onclick="printCertificate()">🖨 打印证书</button>
            <button onclick="goHome()">🏰 返回大厅</button>
        </div>
    </div>`;
}

function renderCertificateLevel(level) {
    const tabs = document.querySelectorAll(".certLevelTab");
    tabs.forEach((t, i) => {
        const l = i + 1;
        const bgs = ["", "#4CAF50", "#2196F3", "#FFD700"];
        t.className = "certLevelTab" + (l === level ? " active" : "");
        t.style.background = l === level ? bgs[l] : "";
        t.style.color = l === level ? (l === 3 ? "#333" : "white") : "";
    });
}

function generateCertificate() {
    const name = document.getElementById("studentName").value.trim();
    if (!name) { alert("请输入姓名"); return; }
    const scores = getTotalScores();
    const profile = getStudentProfile();
    const level = scores.level;

    const canvas = document.getElementById("certificateCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const levelTitles = ["", "算法探索家", "算法小达人", "算法大师"];
    const levelEn = ["", "Algorithm Explorer", "Algorithm Star", "Algorithm Master"];
    const levelColors = ["", "#4CAF50", "#2196F3", "#FF8F00"];
    const levelBgs = ["", "#E8F5E9", "#E3F2FD", "#FFF8E1"];
    const levelBorders = ["", "#4CAF50", "#2196F3", "#FFD700"];
    const levelDescs = [
        "",
        "能够发现生活中的算法，积极参与算法王国探险。",
        "掌握算法的有序性、步骤性和效率思想。",
        "能够发现生活中的算法，比较不同算法的优劣，选择更优算法解决问题。"
    ];

    // 背景
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#FFFDE7");
    grad.addColorStop(0.5, "#FFF8E1");
    grad.addColorStop(1, "#FFFDE7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 装饰边框
    ctx.strokeStyle = levelBorders[level];
    ctx.lineWidth = 14;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    // 内框
    ctx.strokeStyle = levelBorders[level] + "66";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    // 四角星星装饰
    ctx.font = "36px serif";
    ctx.textAlign = "center";
    const corners = [[70,70],[W-70,70],[70,H-70],[W-70,H-70]];
    corners.forEach(([x,y]) => { ctx.fillText("⭐", x, y+10); });

    // 标题
    ctx.fillStyle = levelColors[level];
    ctx.font = "bold 52px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(levelTitles[level] + " 证书", W / 2, 130);

    // 英文
    ctx.fillStyle = "#999";
    ctx.font = "20px Microsoft YaHei, sans-serif";
    ctx.fillText(levelEn[level] + " Certificate", W / 2, 170);

    // 学生姓名区域
    const nameBg = ctx.createLinearGradient(W/2-160, 0, W/2+160, 0);
    nameBg.addColorStop(0, "transparent");
    nameBg.addColorStop(0.5, levelBgs[level]);
    nameBg.addColorStop(1, "transparent");
    ctx.fillStyle = nameBg;
    ctx.fillRect(W/2 - 160, 200, 320, 60);

    ctx.fillStyle = "#333";
    ctx.font = "bold 40px Microsoft YaHei, sans-serif";
    ctx.fillText(name + " 同学", W / 2, 245);

    // 分隔线
    ctx.strokeStyle = levelColors[level] + "44";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 280);
    ctx.lineTo(W - 200, 280);
    ctx.stroke();

    // 成就展示
    ctx.fillStyle = "#555";
    ctx.font = "22px Microsoft YaHei, sans-serif";
    ctx.fillText("总积分：", W/2 - 200, 325);
    ctx.fillStyle = levelColors[level];
    ctx.font = "bold 32px Microsoft YaHei, sans-serif";
    ctx.fillText(scores.total + " / 200", W/2 - 20, 325);

    ctx.fillStyle = "#555";
    ctx.font = "22px Microsoft YaHei, sans-serif";
    ctx.fillText("任务正确率：", W/2 - 200, 370);
    ctx.fillStyle = levelColors[level];
    ctx.font = "bold 32px Microsoft YaHei, sans-serif";
    ctx.fillText(scores.taskAccuracy + "%", W/2 - 20, 370);

    ctx.fillStyle = "#555";
    ctx.font = "22px Microsoft YaHei, sans-serif";
    ctx.fillText("完成情况：", W/2 - 200, 415);
    ctx.fillStyle = levelColors[level];
    ctx.font = "bold 32px Microsoft YaHei, sans-serif";
    ctx.fillText(scores.totalCompleted + " / 4 关", W/2 - 20, 415);

    // 成就徽章
    ctx.fillStyle = "#555";
    ctx.font = "22px Microsoft YaHei, sans-serif";
    ctx.fillText("获得成就：", W/2 - 200, 465);
    ctx.font = "36px serif";
    ctx.textAlign = "left";
    const achieveIcons = ["厨房达人","借书达人","刷牙达人","分支达人"]
        .map(a => achievements[a] ? "⭐" : "⚪").join("  ");
    ctx.fillText(achieveIcons, W/2 - 20, 465);
    ctx.textAlign = "center";

    // 证书描述
    ctx.fillStyle = "#666";
    ctx.font = "22px Microsoft YaHei, sans-serif";
    const descLines = levelDescs[level].split("\n");
    descLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, 520 + i * 35);
    });

    // 授予信息
    ctx.fillStyle = "#888";
    ctx.font = "18px Microsoft YaHei, sans-serif";
    const profileData = getStudentProfile();
    const cls = profileData ? profileData.className : "";
    ctx.fillText("授予" + (cls ? " " + cls + " " : " ") + name, W/2, 640);

    // 日期
    const now = new Date();
    const dateStr = now.getFullYear() + "年" + (now.getMonth()+1) + "月" + now.getDate() + "日";
    ctx.fillStyle = "#999";
    ctx.font = "18px Microsoft YaHei, sans-serif";
    ctx.fillText("发证日期：" + dateStr, W/2, 685);

    // 教师签名区
    ctx.fillStyle = "#ddd";
    ctx.font = "20px Microsoft YaHei, sans-serif";
    ctx.fillText("教师签名：______________", W/2 - 180, 740);
    ctx.fillText("学校盖章：______________", W/2 + 80, 740);

    // 底部小字
    ctx.fillStyle = "#ccc";
    ctx.font = "14px Microsoft YaHei, sans-serif";
    ctx.fillText("算法王国大冒险 · 信息科技启蒙课程", W/2, 795);

    // 等级徽章（右上角）
    const badgeEmojis = ["", "🏆", "🥇", "👑"];
    ctx.font = "72px serif";
    ctx.textAlign = "center";
    ctx.fillText(badgeEmojis[level], W - 100, 130);

    if (typeof saveToLeaderboard === "function" && level > 0) {
        saveToLeaderboard(name, scores.total, level);
    }
    teacherSay("恭喜" + name + "获得" + levelTitles[level] + "证书！");
}

function downloadCertificate(){
    const canvas = document.getElementById("certificateCanvas");
    const link = document.createElement("a");
    link.download = "算法王国证书.png";
    link.href = canvas.toDataURL();
    link.click();
}

function printCertificate(){
    const canvas = document.getElementById("certificateCanvas");
    const win = window.open("");
    win.document.write("<html><body style='margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5'>");
    win.document.write("<img src='" + canvas.toDataURL() + "' style='max-width:100%;box-shadow:0 4px 30px rgba(0,0,0,.15);border-radius:8px'>");
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
}
