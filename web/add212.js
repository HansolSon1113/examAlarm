var val = null;
var subject = "국어";
var sub_val = null;
var time = 1;
var name = null;
var info = null;
var file;
let sub_list = document.getElementById("sub_subject");
const cl = 212;

function loadFile(input) {
    var file = input.files[0];

    var newImage = document.createElement("img");
    newImage.setAttribute("id", 'img');

    newImage.src = URL.createObjectURL(file);   

    newImage.style.width = "70%";
    newImage.style.visibility = "hidden";
    newImage.style.objectFit = "contain";

    var container = document.getElementById('image-show');
    container.appendChild(newImage);
    var newImage = document.getElementById('image-show').lastElementChild;

    newImage.style.visibility = "visible";

    image_exist = true;
};

function changeTime(){
    let sel = document.getElementById("time");
    val_t = sel.options[document.getElementById("time").selectedIndex].value;
    time = val_t
}

function changeSub(){
    let sel = document.getElementById("subject");
    val = sel.options[document.getElementById("subject").selectedIndex].value;

    var i, L = sub_list.options.length - 1;
    for(i = L; i >= 0; i--) {
       sub_list.remove(i);
    }

    var arr = []

    if(val == "국어"){
        arr = ["국어", "문학", "언어와 매체", "독서"]; 
    }
    else if(val == "수학"){
        arr = ["수학", "수학1", "수학2", "기하", "미적분", "확률과 통계"];
    }
    else if(val == "영어"){
        arr = ["영어", "영어1", "영어2", "영어 작문과 독해"];
    }
    else if(val == "과학"){
        arr = ["통합과학", "물리학1", "화학", "생명과학1", "지구과학1", "물리학2", "화학2", "생명과학 2", "지구과학2"];
    }
    else if(val == "사회"){
        arr = ["통합사회", "세계사", "동아시아사", "세계지리", "한국지리", "경제", "정치와 법", "사회문화", "생활과 윤리", "윤리와 사상"];
    }
        else if(val == "기타"){
        arr = ["기타(국어)", "기타(수학)", "기타(영어)", "기타(과학)", "기타(사회)", "기타(예체능)"];
    }

    for(var i = 0; i < arr.length; i++){
        var option = document.createElement("option");
        option.value = arr[i];
        option.text = arr[i]
        sub_list.appendChild(option);
    }

    subject = val;
}

function changeName(){
    name = document.getElementById("name").value;
}

function changeInfo(){
    info = document.getElementById("info").value;
}

async function run(){

    const back = document.getElementById("back");
    back.addEventListener("click", async() => {
        history.back()
    });

    const fin = document.getElementById("fin");
    fin.addEventListener("click", async () => {   
        var date = document.getElementById("date").value;
        console.log(date) 
        sub_val = sub_list.options[document.getElementById("sub_subject").selectedIndex].value;  
        if(name != null && date && info != null){ 
             fin.setAttribute("hidden", "hidden");
             await fetch("/upload-data", {
                 method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cl: cl,
                    subject: subject,
                    sub_subject: sub_val,
                    date: date,
                    time: time,
                    name: name,
                    info: info,
                })
            });
            let formData = new FormData();
            var file = document.getElementById('chooseFile').files[0];
            formData.append('file', file);
            await fetch("/upload-image",{
                method:"POST",
                body: formData
            });
            alert("완료되었습니다.")
            window.location.href = `./web${cl}.html`;
        }
        else{alert("입력되지 않은 정보가 있습니다.")}
    });
}

run();
