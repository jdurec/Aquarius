var mysql = require('mysql');
var con;

exports.SetupDB = function ()
{

    con = mysql.createConnection({
      host: "localhost",
      user: "gary",
      password: "plants need water",
      database: "aquarius"
    }); 

    con.connect(function(err) {
    if (err) throw err;
    console.log("DB Connected");

        
    });
}

exports.LogHumidity  = function (plantId, counter, level) {

    var sql = "INSERT INTO humidityMeasurements (time,plantID, value, detectorTypeID) VALUES (NOW(),?,?,1); ";
   con.query(sql,[plantId,level], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        });
} 

exports.GetHumidityCalib = function(detectorID) {
    var sql = "SELECT calibLevelAir, calibLevelWater FROM detectors WHERE detectorID = ?";
    con.query(sql,[detectorID], function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        });

}
