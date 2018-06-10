var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'spaceshooter.ckruwojhhxik.us-west-2.rds.amazonaws.com',
  user            : 'devitaz',
  password        : 'fuckujul1',
  port        	  : 3306
});

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8081);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/get-scores', function(req, res){
	var context = {};
	pool.query('SELECT `name`, `score` FROM SpaceShooter.Scores ORDER BY score DESC', 
	function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		
		context.results = JSON.stringify(rows);
		console.log("I was executed");
		res.send(context);	
	});
});
app.post('/add-score', function(req, res){
	console.log("I'm in post");
	var name = req.body.name;
	var score = req.body.score;
	var values = "'" + name + "', " + score;
	console.log(values);
	pool.query('INSERT INTO SpaceShooter.Scores(`name`, `score`) VALUES (' + values + ');', 
	function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		var data = JSON.stringify(rows);
		console.log(data);
		res.send(data);
	});
	
	pool.query('DELETE FROM SpaceShooter.Scores ORDER BY score LIMIT 1', 
	function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		console.log("Lowest score removed");
	});
});

app.use(function(req,res){
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});