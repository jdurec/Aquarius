var http = require('http');
var request = require('request');
var url = require("url");
var EventSource = require('eventsource');

var accessToken = "6ac9459dede84ca5f102ef7718aaac0631f6db5f";
var plants = {};


var db = require('./db');
db.SetupDB();

var calib = db.GetHumidityCalib(1);



console.log("Starting");
var es = new EventSource("https://api.particle.io/v1/devices/events?access_token=6ac9459dede84ca5f102ef7718aaac0631f6db5f");

console.log(".");
var statusHandler = function(event) {

  //console.log("Got status " + event.data);
  var data = JSON.parse(event.data);
  var record = JSON.parse(data.data);
  if (typeof plants[data.coreid] == "undefined") plants[data.coreid] = {};
  plants[data.coreid][record.id] = {
    id: record.id,
    counter: record.counter,
    level: record.level,
    published_at: new Date(data.published_at)
  };
  console.log(data);
  var calib = db.GetHumidityCalib(data.coreid);
  db.LogHumidity(record.id,record.counter,record.level);
  //console.log(plants);
  console.log("#")
};
es.addEventListener('status', statusHandler, false);

console.log(".");
es.onerror = function(err) {
console.log(".");
  console.log(err);
console.log(".");
};

var server = http.createServer(function(req, res) {
  var requestUri = url.parse(req.url).pathname;
  if ("/" == requestUri) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<html><head><meta http-equiv="refresh" content="5"></head>\
    <style>\
table {\
    border-collapse: collapse;\
    width: 100%;\
}\
\
th, td {\
    text-align: left;\
    padding: 8px;\
}\
\
tr:nth-child(even){background-color: #f2f2f2}\
th {\
    background-color: #4CAF50;\
    color: white;\
}\
</style>\
    <body><h2>Plants:</h2>\
    <table><thead><th></th><th>Plant #</th><th>Count</th><th>Moisture</th><th>Updated</th><thead>');
    for (var coreid in plants) {
      for (var id in plants[coreid]) {
        var plant = plants[coreid][id];
        res.write('<tr><td><a href="/water/' + coreid + '/' + plant.id + '">Water</a></td><td>'
         + plant.id + '</td><td>' + plant.counter + '</td><td>' + plant.level + '</td><td>' 
         + plant.published_at.toLocaleTimeString("en-us", {  
    weekday: "long", year: "numeric", month: "short",  day: "numeric", hour: "2-digit", minute: "2-digit"  }  ) + '</td></tr>');
      }
    }
    res.write('</table></body></html>');
    res.end();
  }
  if (requestUri.lastIndexOf('/water/', 0) === 0) {
    var data = requestUri.split("/");
    request.post('https://api.spark.io/v1/devices/' + data[2] + '/waterPlant', {form:{access_token: accessToken, args: data[3]}}, function(error, response, body) {
      console.log(error);
    });
    res.writeHead(302, {'Location':'/'});
    res.end();
  }
  //console.log(requestUri);
});
server.listen(9000);
