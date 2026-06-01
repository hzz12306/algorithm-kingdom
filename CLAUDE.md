# 算法王国大冒险

## 项目概述

一个面向小学生（1-3年级）的算法思维启蒙网页游戏。通过4个生活化互动场景，将抽象的"算法"概念转化为孩子能理解的"完成任务的步骤"，寓教于乐。

- **目标用户**：小学低年级学生
- **核心教学法**：游戏化学习 + AI语音教师引导 + 即时反馈成就系统
- **部署方式**：纯静态前端，可直接用浏览器打开 `index.html` 运行

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 结构 | HTML5（单页应用，动态替换 `document.body.innerHTML`） |
| 样式 | CSS3（原生样式，无预处理器） |
| 逻辑 | 原生 JavaScript（ES6+，无框架无构建工具） |
| 语音 | Web Speech API (`speechSynthesis`) |
| 图形 | HTML5 Canvas（证书生成） |

---

## 文件结构

```
algorithm-kingdom-project/
├── index.html          # 游戏大厅：地图入口、AI教师面板、成就栏
├── css/
│   └── style.css       # 全局样式 + 4个游戏场景的专属样式
└── js/
    ├── game.js         # 通用函数：teacherSay() 语音播报、goHome() 返回大厅
    ├── cookGame.js     # 游戏1：厨房小厨神（有序性）
    ├── libraryGame.js  # 游戏2：图书馆达人（有序性）
    ├── brushGame.js    # 游戏3：机器人刷牙（有序性）
    ├── branchGame.js   # 游戏4：算法岔路口（分支思想 + 流程图）
    ├── achievement.js  # 成就系统：解锁徽章、更新面板状态
    └── certificate.js  # 证书生成：Canvas 绘制、下载 PNG、打印
```

---

## 游戏设计

### 大厅地图（index.html）

- 顶部绿色标题栏 + 中央浮动城堡 Emoji
- 左侧 **AI 小智老师**：头像 + 文字提示 + 🔊 语音讲解按钮，页面加载后自动播报欢迎语
- 中央 4 个游戏节点卡片，点击进入对应游戏
- 右侧 **成就面板**：4 个徽章（初始灰色 ⚪，解锁后变金色 ⭐）
- 左下角 **教师模式** 按钮（预留入口）

### 游戏1：厨房小厨神（cookGame.js）

**知识点**：算法的**有序性**（步骤必须按正确顺序执行）

- 场景：帮助机器人做西红柿炒鸡蛋
- 玩法：将打乱的 7 个步骤卡片（准备食材 → 装盘）拖拽排序
- 反馈：正确则出现成功框 + 星星飘落动画 + 解锁「厨房达人」；错误则提示"锅烧糊啦"

### 游戏2：图书馆达人（libraryGame.js）

**知识点**：算法的**有序性** + 信息检索

- 场景：帮同学完成图书馆借书
- 玩法：
  1. 输入书名查询 → 显示书架位置（A区 3排 5号）
  2. 点击方向按钮移动角色 👧 到 A 区
  3. 将 6 个借书步骤卡片拖拽排序
- 反馈：正确解锁「借书达人」

### 游戏3：机器人刷牙（brushGame.js）

**知识点**：算法的**有序性**（重复巩固）

- 场景：帮助机器人正确刷牙
- 玩法：将 4 个刷牙步骤卡片拖拽排序
- 反馈：正确后机器人嘴巴从 😬 变成 😁✨，解锁「刷牙达人」

### 游戏4：算法岔路口（branchGame.js）

**知识点**：算法的**分支结构**（条件判断）

- 场景：想借的书已借出，如何做决策？
- 玩法：三选一按钮（预约借书 / 换一本书 / 回家）
- 反馈：
  - 选"预约"或"换一本" → 成功，展示 ASCII 流程图解释分支思想
  - 选"回家" → 失败，提示无法完成任务
- 完成后弹出「算法大师」总成就弹窗，可进入证书页面

---

## 核心机制

### 拖拽排序（Drag & Drop）

三个有序性游戏共用同一套拖拽模式：

```javascript
let dragged = null;
card.addEventListener('dragstart', () => dragged = card);
card.addEventListener('dragover',  e => e.preventDefault());
card.addEventListener('drop',      e => {
    e.preventDefault();
    card.parentNode.insertBefore(dragged, card);
});
```

答案校验使用 `JSON.stringify` 对比当前 DOM 文本顺序与预定义的正确顺序数组。

### AI 语音教师（teacherSay）

- 所有游戏场景共用 `js/game.js` 中的 `teacherSay(text)`
- 同时做两件事：更新左侧教师面板文字 + 调用 `speechSynthesis` 朗读
- 自动在场景切换、玩家操作后给出引导性反馈

### 成就系统（achievement.js）

```javascript
const achievements = {
    "厨房达人": false,
    "借书达人": false,
    "刷牙达人": false,
    "分支达人": false
};
```

- `unlockAchievement(name)` 解锁并实时更新大厅徽章样式（灰 → 金绿）
- 成就状态保存在内存中，页面刷新后重置（符合单次课堂使用场景）

### 证书生成（certificate.js）

- 使用 HTML5 Canvas 绘制带金色边框的「算法大师证书」
- 包含：学生姓名、完成描述、授予称号、👑 徽章、日期
- 支持 `downloadCertificate()` 下载 PNG 和 `printCertificate()` 调用打印对话框

---

## 样式约定

- 每个游戏场景占据全屏（`width: 100vw; height: 100vh`）
- 使用渐变色背景区分场景：
  - 厨房：`#FFF8E1 → #FFE0B2`（暖橙）
  - 图书馆：`#E3F2FD → #BBDEFB`（淡蓝）
  - 刷牙：`#E1F5FE → #B3E5FC`（青蓝）
  - 岔路口：`#FFF8E1 → #FFE082`（金黄）
- 卡片统一风格：白底圆角 + 轻微阴影，悬停放大 `scale(1.08)`
- 成功框：`#C8E6C9`（浅绿）；错误框：`#FFCDD2`（浅红）

---

## 扩展建议

1. **数据持久化**：将 `achievements` 存入 `localStorage`，支持跨会话保存进度
2. **更多游戏关卡**：增加「循环结构」主题（如「每日早晨流程」重复几天）
3. **教师模式**：实现左下角按钮功能，提供课堂管控（重置进度、查看全班完成情况）
4. **响应式优化**：当前布局使用固定像素定位，可改用 Flex/Grid 适配平板
5. **音效补充**：在成功/失败时添加除语音外的音效反馈
6. **无障碍**：为拖拽操作增加键盘替代方案（上下箭头调整顺序）

---

## 运行方式

无需构建，无需依赖：

```bash
# 直接用浏览器打开
open index.html

# 或启动本地服务器
npx serve .
```

推荐在现代浏览器（Chrome / Edge / Safari）中运行，以确保 Web Speech API 正常工作。
