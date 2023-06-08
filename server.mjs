import express from "express";
import webpush from "web-push";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import mysql2 from "mysql";
import schedule from "node-schedule";
import multer from "multer";

dotenv.config();

const app = express();

var upload = multer({
  storage: multer.diskStorage({
      destination: function(req, file, cb){
          cb(null, `./img/${cl}`);
      },
      filename: function(req, file, cb){
          cb(null, `${name}.png`);
      }
  })
});


const httpsauth = {
  key: fs.readFileSync('./private.key.pem'),
  cert: fs.readFileSync('./domain.cert.pem')
};

const datasql = mysql2.createPool({
  host: 'localhost',
  user: 'phpadmin',
  password: '6729Aa++1',
  database: 'exam_project'
});

const sqlconnection = mysql2.createPool({
  host: 'localhost',
  user: 'phpadmin',
  password: '6729Aa++1',
  database: 'noti_endpoints'
});

app.use(express.json());

let subscriptionData = null;
let cl = null;
var time = new Date();
var name;

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_MAILTO}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

function sendNoti() {
  console.log("function sendNoti()");
  time = new Date();
  let day = time.getDate()
  let mon = time.getMonth()
  console.log("sv", mon, day)
  for(var i=1; i<=3; i++){
    for(var j=1; j<=12; j++){
      let classname = `${i}${j}`
      var endpointcnt = null
      sqlconnection.query("SELECT * FROM `"+classname+"`", function (err, result, fields) {
        if (err) throw err;
        subscriptionData = JSON.parse(JSON.stringify(result));
        endpointcnt = Object.keys(subscriptionData).length
      });
      datasql.query("SELECT * FROM `"+classname+"`", function (err, result, fields) {
        if (err) throw err;
        let examData = JSON.parse(JSON.stringify(result));
        var cnt = Object.keys(examData).length
        for(var a=0; a<cnt; a++){
          let examday = new Date(examData[a].date);
          let examdate = examday.getDate();
          let exammon = examday.getMonth();
          if(exammon == mon){            
           if(examdate == day || examdate - 1 == day || examdate - 3 == day || examdate - 7 == day){
              for(var b=0; b<endpointcnt; b++){
                 webpush.sendNotification({endpoint: subscriptionData[b].endpoint,
                    keys: {
                      "p256dh": subscriptionData[b].p256dh,
                      "auth": subscriptionData[b].auth
                     }
                   }, 
                    JSON.stringify({
                    title: examData[a].subject,
                    body: examData[a].name,
                    icon: "./src/icon.png",
                    vibrate: [20, 20]
                 })
                )
               }
             }
           }
         }
        }
     );
    }
  }
};

app.get('/send-notification', (req, res) => {
  console.log("Test Alarm Sent");
  time = new Date();
  let day = time.getDate()
  let mon = time.getMonth()
  console.log("sv", mon, day)
  let classname = `00`
  var endpointcnt = null
  sqlconnection.query("SELECT * FROM `"+classname+"`", function (err, result, fields) {
    if (err) throw err;
    subscriptionData = JSON.parse(JSON.stringify(result));
    endpointcnt = Object.keys(subscriptionData).length
  });
  datasql.query("SELECT * FROM `"+classname+"`", function (err, result, fields) {
    if (err) throw err;
    let examData = JSON.parse(JSON.stringify(result));
    var cnt = Object.keys(examData).length
    for(var a=0; a<cnt; a++){
      let examday = new Date(examData[a].date);
      let examdate = examday.getDate();
      let exammon = examday.getMonth();
      if(exammon == mon){            
        if(examdate == day || examdate - 1 == day || examdate - 3 == day || examdate - 7 == day){
          for(var b=0; b<endpointcnt; b++){
            webpush.sendNotification({endpoint: subscriptionData[b].endpoint,
              keys: {
                "p256dh": subscriptionData[b].p256dh,
                "auth": subscriptionData[b].auth
                }
              }, 
              JSON.stringify({
                title: examData[a].subject,
                body: examData[a].name,
                icon: "./src/icon.png",
                vibrate: [20, 20]
              })
            );
          }
        }
      }
    }
  });
  res.sendStatus(200); 
});

app.post("/save-subscription", async (req, res) => {
  subscriptionData = req.body.subscription;
  console.log("sub,", subscriptionData.keys.auth)
  cl = `${req.body.grade}${req.body.class}`;
  sqlconnection.query('SELECT 1 FROM `'+cl+'` WHERE auth="'+subscriptionData.keys.auth+'"', function(err, result, fields){
    if (err) throw err;
    if(result.length >= 1){
      res.sendStatus(200);
    }
    else{
      var sql = "INSERT INTO `"+cl+"` (endpoint, p256dh, auth) VALUES"+`('${subscriptionData.endpoint}', '${subscriptionData.keys.p256dh}', '${subscriptionData.keys.auth}')`;
      sqlconnection.query(sql, function(err, rows) {
      });
      res.sendStatus(200);
    }
  });
});

app.post("/remove-subscription", async (req, res) => {
  subscriptionData = req.body.subscription;
  console.log("del,", subscriptionData.keys.auth)
  cl = `${req.body.grade}${req.body.class}`;
  var sql = 'DELETE FROM `'+cl+'` WHERE auth="'+subscriptionData.keys.auth+'"';
  sqlconnection.query(sql, function(err, result) {
    if(err) throw err;
  });
  res.sendStatus(200);
});

app.post("/getdata", async (req, res) => { 
  cl = `${req.body.grade}${req.body.class}`; 
  var sql = "SELECT * FROM `"+cl+"`" 
  datasql.query(sql, function(err, result, 
  fields) {
    if (err) throw err;
    var data = JSON.stringify(result);
    res.json(data);
  });
});

app.post("/upload-data", async(req, res) => {
  cl = `${req.body.cl}`
  name = `${req.body.name}`
  var sql = "INSERT INTO `"+cl+"` (subject, sub_subject, name, date, time, info, imglink) VALUES"+`('${req.body.subject}', '${req.body.sub_subject}', '${req.body.name}', '${req.body.date}', '${req.body.time}', '${req.body.info}', '${req.body.name}')`;
  datasql.query(sql, function(err, result, 
    fields) {
      if (err) throw err;
      res.sendStatus(200);
    });
});

app.post("/upload-image", upload.single('file'), function(req, res, next){
  res.sendStatus(200);
});

const job = schedule.scheduleJob("00 00 08,18 * * *", function(){
  console.log("Alarm sent");
  sendNoti();
});

app.use("/src", express.static("img"))
app.use("/", express.static("web"));

https.createServer(httpsauth, app).listen(443);
