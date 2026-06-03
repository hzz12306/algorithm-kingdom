/* ==========================
   排行榜系统
   支持本地 + 云端同步
   ========================== */

const LB_KEY = "algorithmKingdomLeaderboard";
const LEVEL_NAMES = ["", "🏆 算法探索家", "🥇 算法小达人", "👑 算法大师"];
const SERVER_URL = window.location.origin + "/api/leaderboard";

function getLeaderboard() {
    const saved = localStorage.getItem(LB_KEY);
    return saved ? JSON.parse(saved) : [];
}

async function saveToLeaderboard(studentName, totalScore, grade) {
    if (!studentName) return;
    const entry = {
        name: studentName,
        totalScore: totalScore,
        grade: grade,
        levelName: LEVEL_NAMES[grade] || "算法探索家",
        date: new Date().toLocaleDateString("zh-CN")
    };
    // 本地保存
    const list = getLeaderboard();
    const idx = list.findIndex(e => e.name === entry.name);
    if (idx >= 0) {
        list[idx] = entry;
    } else {
        list.push(entry);
    }
    list.sort((a, b) => (b.totalScore || b.score || 0) - (a.totalScore || a.score || 0));
    localStorage.setItem(LB_KEY, JSON.stringify(list));
    // 云端同步（如果服务器在运行）
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry)
        });
    } catch {}
}

async function syncLeaderboard() {
    try {
        const res = await fetch(SERVER_URL);
        if (!res.ok) return;
        const cloud = await res.json();
        if (Array.isArray(cloud) && cloud.length > 0) {
            localStorage.setItem(LB_KEY, JSON.stringify(cloud));
        }
    } catch {}
}

function clearLeaderboard() {
    localStorage.removeItem(LB_KEY);
}

async function showLeaderboard() {
    await syncLeaderboard();
    const existing = document.getElementById("lbModal");
    if (existing) existing.remove();

    const list = getLeaderboard();
    const modal = document.createElement("div");
    modal.id = "lbModal";
    modal.innerHTML = `
    <div class="lbOverlay">
      <div class="lbBox">
        <h1>📊 算法王国排行榜</h1>
        <p class="lbSub">看看谁是最厉害的算法大师！</p>
        ${list.length === 0 ? '<div class="lbEmpty">还没有成绩记录，快去完成挑战吧！</div>' : `
        <div class="lbTableWrap">
          <table class="lbTable">
            <thead>
              <tr>
                <th>🏅 排名</th>
                <th>👤 姓名</th>
                <th>⭐ 总分</th>
                <th>🎖️ 证书等级</th>
                <th>📅 日期</th>
              </tr>
            </thead>
            <tbody>
              ${list.map((r, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
                  const isTop3 = i < 3;
                  return `
                  <tr class="lbRow ${isTop3 ? 'lbTop' : ''} ${isTop3 ? 'lbTop' + (i+1) : ''}">
                    <td class="lbRank">${medal}</td>
                    <td class="lbName">${r.name}</td>
                    <td class="lbScore">${r.totalScore || r.score || 0}</td>
                    <td class="lbGrade">${r.levelName}</td>
                    <td class="lbDate">${r.date}</td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
        <div class="lbCount">共 ${list.length} 位同学</div>
        `}
        <div class="lbBtns">
          <button class="lbCloseBtn" onclick="document.getElementById('lbModal').remove()">关闭</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(modal);
}
