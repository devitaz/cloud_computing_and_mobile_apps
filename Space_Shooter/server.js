/* Modules */
var express = require('express');
var bodyParser = require('body-parser');
var AWS = require("aws-sdk");
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bcrypt   = require('bcrypt-nodejs');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

/* Hardcoded Credentials - Used for Testing */
AWS.config.update({accessKeyId: 'AKIAIBL6OXXCO33F3FIQ', secretAccessKey: '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'});
AWS.config.region = 'us-west-2';	
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var app = express();

app.use(flash());
app.use(morgan('dev')); 	
app.use(cookieParser()); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true})); 
app.set('port', 8081);

var handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(session({ secret: 'IHAVEATINYPENIS', resave: true, saveUninitialized: true })); 	// session secret
app.use(passport.initialize());
app.use(passport.session());

var salt = bcrypt.genSaltSync(8);
var lowestUserScore;

/* getuser @function */
function getuser(email, res, callback){
	var params = {
		TableName : "user",
		Key: {
			"email" : {
				"S" : email
			}
		}
	}
	dynamodb.getItem(params, function(err, data) {
		if (err)
			console.log(err); 

		callback(data.Item.username.S, data.Item.phone.S);

	});
}
/* orderUserScores @function */
//	Sorts user scores and puts them into JSON object
function orderUserScores(data, username, phone, email, callback){
	var temp = [];
	var str = "";
	if (data.Responses.userscores[0].scores.L == null){
		str = '{"Item": {"username":{"S":"' + username + '"}, "phone":{"S":"' + phone + '"}, "email":{"S":"' + email + '"}, "scores": {"L":[]}}}';
	}
	else
	{
		size = Object.keys(data.Responses.userscores[0].scores.L).length;
		for(var i = 0; i < size; i++){
			temp[i] = data.Responses.userscores[0].scores.L[i].N
		}
	
		temp.sort(function(a, b){
			return b - a 
		});
		for(i = 0; i < size-1; i++){
			str += '{"' + i + '": "' + temp[i] + '"},' 
		}
		str += '{"' + i + '": "' + temp[size-1] + '"}'
		str = '{"Item": {"username":{"S":"' + username + '"}, "phone":{"S":"' + phone + '"}, "email":{"S":"' + email + '"}, "scores": {"L":[' + str + ']}}}';
	}

	var json = JSON.parse(str);

	callback(json);
}
/* get-account @GET-request */
//	Queries database for user account information
app.get('/get-account', function(req, res){
	var email = req.query.email;
	var uname;
	
	getuser(email, res, function(username, phone){
		uname = username;
		fone = phone;
		
		var params = {
			"TableName": "userscores",
			"KeyConditions":{
				"username":{
					"ComparisonOperator":"EQ",
					"AttributeValueList":[{"S":uname}]
				}
			}
		}
		console.log("Scanning for :"+JSON.stringify(params));

		// check if userscores  exists
		dynamodb.query(params, function(err,data){
			if (err){
				return done(err);
			}
			if (data.Items.length > 0) {
				var params = {
					RequestItems: {
						"user": {
							Keys: [ {"email": {"S": email}} ],
							AttributesToGet: [ "username", "phone"],
							ConsistentRead: false,
						},
						"userscores": {
							Keys: [ {"username": {"S": uname}} ],
							AttributesToGet: [ "scores" ],
							ConsistentRead: false,
						}   
					},
					ReturnConsumedCapacity: 'NONE'
				}
				dynamodb.batchGetItem(params, function(err, data){
					console.log("batchget: " + data);
					if (err)
						console.log(JSON.stringify(err, null, 2));
					else{
						orderUserScores(data, uname, fone, email, function(result){
							res.send(JSON.stringify(result))
						});
					}
				});
			}
			else {
				var params = {
					TableName : "user",
					Key: {
						"email" : {
							"S" : email
						}
					}
				}
				dynamodb.getItem(params, function(err, data) {
					if (err)
						console.log(err); 
					else {
						res.send(JSON.stringify(data));
					}
				});
			}		
		});
		
	});	
});
/* update-info @POST-request */
//	Queries database for account info updates
app.post('/update-info', function (req, res) {
	var params = {
		TableName : "user",
		Key:{
			"email"	: req.body.email
		},
		ExpressionAttributeNames: {
			"#u": req.body.datatype
		},  
		UpdateExpression : "SET #u = :u", 
		ExpressionAttributeValues:{
			":u": req.body.input	
		},
		ReturnValues:"UPDATED_NEW"
	}
	
	docClient.update(params, function(err, data) {
	if (err)
			console.log(err); 
		else {
			console.log(data); 
			res.send(JSON.stringify(data, null, 2));
		}
	});
}); 
/* update-password @POST-request */
//	Queries database for account password updates
app.post('/update-password', function (req, res) {
	var params = {
		TableName : "user",
		Key:{
			"email"	: req.body.email
		},
		ExpressionAttributeNames: {
			"#u": "password"
		},
		UpdateExpression : "SET #u = :u", 
		ExpressionAttributeValues:{
			":u": bcrypt.hashSync(req.body.password, salt)	
		},
	}
	
	docClient.update(params, function(err, data) {
	if (err)
			console.log(err); 
		else {
			console.log(data); 
			res.send(JSON.stringify(data, null, 2));
		}
	});
}); 
/* add-score @POST-request */
//	Queries database to add score to user account
app.post('/add-score', function(req, res){
	var score = parseInt(req.body.score);
	var username = req.body.username;
	
	var params = {
		TableName : "userscores",
		Key:{
			"username"	: username
		},
		ExpressionAttributeNames: {
			"#u": "scores"
		},  
		UpdateExpression : "SET #u = list_append(#u, :newValue)", 
		ExpressionAttributeValues:{
			":newValue": [Number(score)]
		},
		ReturnValues:"UPDATED_NEW"
	}
	
	docClient.update(params, function(err, data) {
	if (err)
			console.log(err); 
		else {
			console.log(data); 
			res.send(JSON.stringify(data, null, 2));
		}
	}); 
});
/* serializeUser @function */
//	Used to serialize the user
passport.serializeUser(function(user, done) {
	done(null, user.email.S);
});
/* deserializeUser @function */
//	Used to deserialize the user
passport.deserializeUser(function(email, done) {
	dynamodb.getItem({"TableName":"user","Key": {"email":{"S":email}}}, function(err,data){
	if (err){
		done(err,data);
	}
	done(err,data.Item)
	})
});
/* local-signup */
//	Local strategy used to verify input & check if user exists during signup
passport.use('local-signup', new LocalStrategy({
	usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true 
  },
  function(req, email, password, done) {
	console.log("username" + req.body.username);  
	
    var params = {
      "TableName": "user",
      "KeyConditions":{
        "email":{
          "ComparisonOperator":"EQ",
          "AttributeValueList":[{"S":email}]
        }
      }
    }
    console.log("Scanning for :"+JSON.stringify(params));

    // check if user already exists
    dynamodb.query(params, function(err,data){
		if (err){
			return done(err);
		}
		if (data.Items.length > 0) {
			return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
		} 
		else {
			var params = {
				RequestItems: {
					"user": [
						{
							PutRequest: {
								Item: {
									"email": email,
									"password": bcrypt.hashSync(password, salt),
									"phone": req.body.phone,
									"username": req.body.username
								}	
							}	
						}
					],
					"userscores": [
						{
							PutRequest: {
								Item: {
									"username": req.body.username,
									"scores":[]
								}
							}
						}
					]
				},
				ReturnValues: "ALL_NEW"
			};

			docClient.batchWrite(params, function(err, data){
				if (err)
					console.log(JSON.stringify(err, null, 2));
				else
					console.log(JSON.stringify(data, null, 2));
			});
		}
    });

}));
/* local-login */
//	Local strategy used for checking credentials at log in
passport.use('local-login', new LocalStrategy({
	usernameField : 'email',
	passwordField : 'password',
	passReqToCallback : true 
},
function(req, email, password, done) { 
	var params = {
		"TableName":"user",
		"KeyConditions":{
			"email":{
				"ComparisonOperator":"EQ",
				"AttributeValueList":[{"S":email}]
			}
		}
	}
	dynamodb.query(params, function(err,data){
		if (err){
			return done(err);
		}
		console.log("data");
		if (data.Items.length == 0){
			return done(null, false, req.flash('loginMessage', 'No user found.')); 
		}
		dynamodb.getItem({"TableName":"user","Key": {"email":data.Items[0]["email"]}}, function(err,data){
			if (err){
				return done(err);
			}
			if(!bcrypt.hashSync(password, salt) === data.Item.password.S){
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); 
			}
			else{
				return done(null, data.Item);
			}
		})
	});
})); 
/* signup @POST-request */
//	Creates account for new user
app.post('/signup', passport.authenticate('local-signup', {
//        successRedirect : '/profile',
        failureRedirect : '/fail',  
        failureFlash : true 
}));
app.get('/fail', function(req, res) { 
		req.flash('info', 'Email already exists, try again.');
		res.redirect('login');
});
/* login @POST-request */
//	Logs user into their account
app.post('/login', function(req,res,next){ 
	passport.authenticate('local-login', function(err,user,info){ 
		if (err) {
			return next(err); 
		}
		if (! user) {
			return res.send({ success : false, message : 'authentication failed' });
		}
		req.login(user, function(err) {
			if (err) { 
				return next(err); 
			}
	
			return res.send({ success : true, message : 'authentication succeeded' });
		});      
	})(req, res, next);
});
/* logout @GET-request */
//	Logs user out of their account
app.get('/logout', function(req, res){
	req.logout();
	res.send({ success : true, message : 'logged out' });
});
/* logout @GET-request */
//	Removes user from database
app.get('/remove-user', function(req, res) {
    var params = {
		TableName : "user",
		Key:{
			"email"	: req.query.email
        },
    }
	docClient.delete(params, function(err, data) {
		if(err)
			console.log(err); 
		else 
			res.send(JSON.stringify(data)); 
	});  
});
app.use(function(req,res){
	res.status(404);
	//	Do Something
});
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	//	Do Something
});
app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});