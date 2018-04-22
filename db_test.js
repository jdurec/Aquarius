var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "gary",
  password: "plants need water",
  database: "aquarius"
}); 

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  con.query("SELECT * FROM plants", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});