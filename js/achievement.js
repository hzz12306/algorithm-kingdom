const achievements={
    "厨房达人":false,
    "借书达人":false,
    "刷牙达人":false,
    "分支达人":false
};

function unlockAchievement(name){
    if (achievements[name]) return;
    achievements[name]=true;
    saveAchievements();
    updateAchievementPanel();
    checkAllAchievements();
}

function saveAchievements(){
    localStorage.setItem("achievements", JSON.stringify(Object.assign({}, achievements, { _version: 2 })));
}

function loadAchievements(){
    const saved = localStorage.getItem("achievements");
    if (saved) {
        const data = JSON.parse(saved);
        if (data._version === 2) {
            Object.keys(data).forEach(key => {
                if (key !== "_version") achievements[key] = data[key];
            });
        }
    }
    updateAchievementPanel();
    checkAllAchievements();
    updateStatsPanel();
}

function updateAchievementPanel(){
    const badges = document.querySelectorAll(".badge");
    badges.forEach(item => {
        const text = item.innerText.replace(/^[^\s]+\s*/, "");
        if (achievements[text]) {
            item.innerHTML = "⭐ " + text;
            item.style.background = "#C8E6C9";
        } else {
            item.innerHTML = "⚪ " + text;
            item.style.background = "#FFF8E1";
        }
    });
}

function checkAllAchievements(){
    const allDone = Object.values(achievements).every(v => v === true);
    const btn = document.getElementById("certificateBtn");
    if (btn) {
        btn.style.display = allDone ? "inline-block" : "none";
    }
}
