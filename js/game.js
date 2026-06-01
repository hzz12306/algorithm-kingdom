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
    stats.total.time = (stats.cook.bestTime === Infinity ? 0 : stats.cook.bestTime)
                     + (stats.library.bestTime === Infinity ? 0 : stats.library.bestTime)
                     + (stats.brush.bestTime === Infinity ? 0 : stats.brush.bestTime)
                     + (stats.branch.bestTime === Infinity ? 0 : stats.branch.bestTime);
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

    const formatBestTime = (t) => t === Infinity ? "--" : formatTime(t);
    const totalGames = 4;
    const progress = Math.round(stats.total.completed / totalGames * 100);

    const bar = panel.querySelector(".statProgressBar");
    const label = panel.querySelector(".statProgress span");
    if (bar) bar.style.width = progress + "%";
    if (label) label.textContent = "完成进度 " + stats.total.completed + "/" + totalGames;

    const items = panel.querySelectorAll(".statItem strong");
    if (items[0]) items[0].textContent = stats.total.attempts + " 次";
    if (items[1]) items[1].textContent = formatTime(stats.total.time);
    if (items[2]) items[2].textContent = Math.max(stats.cook.bestAccuracy, stats.library.bestAccuracy, stats.brush.bestAccuracy) + "%";

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
