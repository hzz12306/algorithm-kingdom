/* ==========================
   排行榜系统
   使用 localStorage 持久化保存
   ========================== */

const LB_KEY = "algorithmKingdomLeaderboard";
const LEVEL_NAMES = ["", "🏆 算法探索家", "🥇 算法小达人", "👑 算法大师"];

function getLeaderboard() {
    const saved = localStorage.getItem(LB_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveToLeaderboard(studentName, totalScore, grade) {
    if (!studentName) return;
    const list = getLeaderboard();
    list.push({
        name: studentName,
        score: totalScore,
        grade: grade,
        levelName: LEVEL_NAMES[grade] || "算法探索家",
        date: new Date().toLocaleDateString("zh-CN")
    });
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(LB_KEY, JSON.stringify(list));
}

function clearLeaderboard() {
    localStorage.removeItem(LB_KEY);
}

function showLeaderboard() {
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
                    <td class="lbScore">${r.score}</td>
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
