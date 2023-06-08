let obj = null;

const grade = 2
const classname = 11

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

Element.prototype.hide = function() {
  this.style.display = 'none';
}
Element.prototype.show = function() {
  this.style.display = '';
}


async function run() {
  var ckExist = document.cookie.indexOf('key');

    const data = await fetch("/getdata", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            class: classname,
            grade: grade
        })
      });
    obj = await data.json();
    createTable(obj);

    const registration = await navigator.serviceWorker.register(
      "serviceworker.js",
      {
        scope: "./",
      }
    );

    const addbutton = document.getElementById("addbutton");
    addbutton.addEventListener("click", async () => {
      window.location.href = `./add${grade}${classname}.html`;
    });

    const sbutton = document.getElementById("subscribe");
    if(ckExist == 0){
      sbutton.innerText = "알림 취소";
    }

    sbutton.addEventListener("click", async () => {
    const result = await window.Notification.requestPermission();
    if (result === "granted") {
        const subscription = await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(
            "BHPAYD0XcuT8NYmun-VXn0W4PGwErEowElMN6TfO5hqE_iTbR66PNigG4joV6dWmixIth48J6-dcGlih0TnhO_I"
          ),
          userVisibleOnly: true,
    });
    ckExist = document.cookie.indexOf('key'); 
    if(ckExist == 0){
      await fetch("/remove-subscription", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bool: true,
          subscription: subscription,
          class: classname,
          grade: grade
        })
      });
      document.cookie = "key=true; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      alert("알림 구독이 취소되었습니다.");
      sbutton.innerText = "알림 받기";
    }
    else{
  
      await fetch("/save-subscription", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bool: true,
          subscription: subscription,
          class: classname,
          grade: grade
        })
      });
      alert("알림 구독되었습니다."); 
      document.cookie = "key=true; expires=Mon, 01 Jan 2024 00:00:00 UTC;";
      sbutton.innerText = "알림 취소";
    }
  }
});
};

function showTable(){
  location.reload();
}

function scription(data){
  let tbl = document.getElementById("table");
  tbl.hide()
  document.write(`<br><button id="backbtn">뒤로가기</button>`);
  let backbtn = document.getElementById("backbtn");
  backbtn.onclick = (function() {return function() {showTable();}})()
  document.write(`<br><p>과목: ${data.subject} - ${data.sub_subject}</p>`);
  document.write(`<br><p>제목: ${data.name}</p>`);
  document.write(`<br><p>일시: ${data.date} - ${data.time}교시</p>`);
  document.write(`<br><p>설명: ${data.info}</p>`);
  document.write(`<br><p><img id="image" src="./src/noimage.svg"></p>`);
  var image = document.images[0];
  var downloadingImage = new Image();
  image.style.width = "100%";
  image.style.objectFit = "contain";
  downloadingImage.onload = function(){
    image.src = this.src;   
  };
  downloadingImage.src = `./src/${grade}${classname}/${data.imglink}.png`;
}

function createTable(obj) {
  const tbl = document.createElement("table");
  tbl.id = "table"
  tbl.class = "table"
  const tblBody = document.createElement("tbody");
  var mydata = JSON.parse(obj);
  let cnt = Object.keys(mydata).length;
  for(let a=0; a<=cnt; a++){
    const row = document.createElement("tr");
    for(let i=0; i<6; i++){
      const cell = document.createElement("td");
      var cellData = null;
      if(a==0){
        if(i==0){
          cellData = "과목";
        }
        if(i==1){
          cellData = "세부 과목";
        }
        if(i==2){
          cellData = "제목";
        }
        if(i==3){
          cellData = "날짜";
        }
        if(i==4){
          cellData = "교시";
        }
        if(i==5){
          cellData = "자세히 보기";
        }
      }
      else{
        let dateData = new Date(mydata[a-1].date);
        let datedata = dateData.toLocaleDateString("ko-KR");
        if(i==0){
          cellData = mydata[a-1].subject;
        }
        if(i==1){
          cellData = mydata[a-1].sub_subject;
        }
        if(i==2){
          cellData = mydata[a-1].name;
        }
        if(i==3){
          cellData = datedata;
          mydata[a-1].date = datedata
        }
        if(i==4){
          cellData = mydata[a-1].time;
        }
        if(i==5){
          let data = mydata[a-1];
          let btn = document.createElement('button');
          btn.innerText = "자세히";
          btn.className = "btn";
          btn.onclick = (function(data) {return function() {scription(data);}})(data);
          cell.append(btn);
        }
      }
      if(i!=5){
        const cellText = document.createTextNode(cellData);
        cell.appendChild(cellText);
      }
      row.appendChild(cell);
    }
    tblBody.appendChild(row);
  }
  tbl.appendChild(tblBody);
  document.body.appendChild(tbl);
  tbl.setAttribute("border", "2");
};

run();