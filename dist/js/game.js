function teacherSay(text){

const panel=
document.getElementById(
"teacherText"
);

if(panel){

panel.innerHTML=text;

}

if(window.speechSynthesis){

const msg=
new SpeechSynthesisUtterance(
text
);

msg.lang="zh-CN";

speechSynthesis.speak(msg);

}

}

function goHome(){

location.reload();

}