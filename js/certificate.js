/* ==========================
   算法大师证书
========================== */

function renderCertificate(){

document.body.innerHTML=`

<div class="certificateScene">

    <h1>

    🏆 算法大师证书

    </h1>

    <br>

    <div class="nameInputBox">

        <input
        id="studentName"
        placeholder="请输入学生姓名">

        <button
        onclick="generateCertificate()">

        生成证书

        </button>

    </div>

    <br>

    <canvas
    id="certificateCanvas"
    width="1200"
    height="800">

    </canvas>

    <br>

    <button
    onclick="downloadCertificate()">

    📥 下载证书

    </button>

    <button
    onclick="printCertificate()">

    🖨 打印证书

    </button>

    <button
    onclick="goHome()">

    🏰 返回大厅

    </button>

</div>

`;

}

function generateCertificate(){

const name=
document.getElementById(
"studentName"
).value;

if(!name){

alert("请输入姓名");

return;

}

const canvas=
document.getElementById(
"certificateCanvas"
);

const ctx=
canvas.getContext("2d");

/* 背景 */

ctx.fillStyle="#FFF8DC";

ctx.fillRect(
0,
0,
canvas.width,
canvas.height
);

/* 外框 */

ctx.strokeStyle="#FFD700";

ctx.lineWidth=12;

ctx.strokeRect(
20,
20,
1160,
760
);

/* 标题 */

ctx.fillStyle="#B8860B";

ctx.font=
"bold 60px Microsoft YaHei";

ctx.textAlign="center";

ctx.fillText(

"算法大师证书",

600,

120

);

/* 正文 */

ctx.fillStyle="#333";

ctx.font=
"36px Microsoft YaHei";

ctx.fillText(

name+" 同学",

600,

250

);

ctx.fillText(

"成功完成算法王国全部挑战",

600,

330

);

ctx.fillText(

"掌握了算法的概念并分析问题找到解决问题的算法",

600,

400

);

ctx.fillText(

"特授予",

600,

500

);

ctx.fillStyle="#E53935";

ctx.font=
"bold 70px Microsoft YaHei";

ctx.fillText(

"算法大师",

600,

620

);

/* 徽章 */

ctx.font="80px serif";

ctx.fillText(

"👑",

600,

710

);

/* 日期 */

ctx.fillStyle="#666";

ctx.font=
"28px Microsoft YaHei";

const date=
new Date().toLocaleDateString();

ctx.fillText(

date,

600,

760

);

teacherSay(
"恭喜获得算法大师证书！"
);

}

function downloadCertificate(){

const canvas=
document.getElementById(
"certificateCanvas"
);

const link=
document.createElement("a");

link.download=
"算法大师证书.png";

link.href=
canvas.toDataURL();

link.click();

}

function printCertificate(){

const canvas=
document.getElementById(
"certificateCanvas"
);

const image=
canvas.toDataURL();

const win=
window.open("");

win.document.write(

"<img src='"+image+"' width='100%'>"

);

win.print();

}

