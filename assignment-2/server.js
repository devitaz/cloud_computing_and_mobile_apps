var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'aapado9rksw4nr.ckruwojhhxik.us-west-2.rds.amazonaws.com',
  user            : 'devitaz',
  password        : '*********',
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

app.get('/', function(req, res){
	res.render('registration');
});
app.get('/home', function(req, res){
	res.redirect('registration');
});

app.get('/account', function(req, res){
	var context = {};
	if(!req.query.id){
		pool.query('SELECT id, User_Name, Email, First_Name, Last_Name, Password, Street, City, State, Zip, Gender FROM ebdb.registration', 
		function(err, rows, fields){
			if(err){
				console.log(err);
				return;
			}
			context.results = JSON.stringify(rows);
			res.send(context);
		});
	}else{
		console.log(req.query.id);
		pool.query('SELECT id, User_Name, Email, First_Name, Last_Name, Password, Street, City, State, Zip, Gender FROM ebdb.registration WHERE id = ' + req.query.id, 
		function(err, rows, fields){
			if(err){
				console.log(err);
				return;
			}
			context.results = JSON.stringify(rows);
			res.send(context);
		});
	}
});

app.put('/update', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var street = req.body.street;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var gender = req.body.gender;
	var id = req.body.id;
	pool.query('UPDATE ebdb.registration SET User_Name=?, Email=?, Password=?, First_Name=?, Last_Name=?, Street=?, City=?, State=?, Zip=?, Gender=?, WHERE id=? ', 
	[username, email, password, firstname, lastname, street, city, state, zip, gender, id], 
	function(err, result){
		if(err){
			console.log(err);
			return;
		}
		res.render('home');
	});
});

app.post('/storeuser', function(req, res){
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var street = req.body.street === '' ? null : req.body.street;
	var city = req.body.city === '' ? null : req.body.city;
	var state = req.body.state === '' ? null : req.body.state;
	var zip = req.body.zip === '' ? null : req.body.zip;
	var gender = req.body.gender === 'male' ? 0 : 1;
	var values = "'" + username + "', '" + email + "', '" + password + "', '" + firstname + "', '" + lastname + "', '" + street + "', '" + city + "', '" + state + "', '" + zip + "', '" + gender + "'";
	pool.query('INSERT INTO ebdb.registration(`User_Name`, `Email`, `Password`, `First_Name`, `Last_Name`, `Street`, `City`, `State`, `Zip`, `Gender`) VALUES (' + values + ');', 
	function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		var data = JSON.stringify(rows);
		res.send(data);
	});
});

app.post('/', function(req, res){
	res.render('home');
});

app.delete('/remove-account', function(req, res){
	var context = {};
	pool.query('DELETE FROM ebdb.registration WHERE id = ' + req.query.id, function(err, rows, fields){
		if(err){
			console.log(err);
			return;
		}
		context.results = JSON.stringify(rows);
		res.send(context);
	});
});

app.get('/reset-table',function(req,res,next){
	var context = {};
	pool.query("DROP TABLE IF EXISTS ebdb.registration", function(err){
		var createString = "CREATE TABLE ebdb.registration(" +
		"id INT PRIMARY KEY AUTO_INCREMENT," +
		"User_Name VARCHAR(45) NOT NULL," +
		"Email VARCHAR(45) NOT NULL," +
		"Password VARCHAR(45) NOT NULL," +
		"First_Name VARCHAR(45) NOT NULL," +
		"Last_Name VARCHAR(45) NOT NULL," +
		"Street VARCHAR(255)," +
		"City VARCHAR(45)," +
		"State CHAR(2)," +
		"Zip DECIMAL(7,0)," +
		"Gender BOOLEAN)";
		pool.query(createString, function(err){
			context.results = "Table reset";
			res.render('home',context);
		})
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