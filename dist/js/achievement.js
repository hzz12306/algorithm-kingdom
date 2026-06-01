const achievements={

"厨房达人":false,

"借书达人":false,

"刷牙达人":false,

"分支达人":false

};

function unlockAchievement(name){

if(
achievements[name]
) return;

achievements[name]=true;

updateAchievementPanel();

}

function updateAchievementPanel(){

const badges=
document.querySelectorAll(
".badge"
);

badges.forEach(item=>{

const text=
item.innerText;

if(
achievements[text]
){

item.innerHTML=
"⭐ "+text;

item.style.background=
"#C8E6C9";

}

});

}

