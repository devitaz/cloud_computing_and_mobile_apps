var express = require('express');
var bodyParser = require('body-parser');
var AWS = require("aws-sdk");
var path = require('path');

AWS.config.update({accessKeyId: 'AKIAJMOOOX542KOCUTRA', secretAccessKey: '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'});
var credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
var dynasty = require('dynasty')(credentials);
AWS.config.region = 'us-west-2';	

var app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true})); 

app.set('port', 8081);
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

/* function updateCount(operand, callback) {
		var params = {
		TableName : "counter",
		Key: {
			"type" : {
				"S" : "student"
			}
		}
	} */
/* 	dynamodb.getItem(params, function(err, data) {
	
	var count = parseInt(data.Item.position.N);
	//console.log(typeof(parseInt(data.Item.position.N)));
	//console.log(result);
	if (err)
			console.log(err); 
		else {
			callback(count);
		}
	});
}  */
//getCount();
//console.log(getCount());

/* function updateCount(operand, callback) {
	var current = getCount(count, callback2);
	//console.log(current);
	var params = {
		TableName : "counter",
		Key:{
			"type" : {
				"S" : "student"
			}
		},
		UpdateExpression : "SET :pos = :pos ADD :o", 
		/* ExpressionAttributeNames: {
			"#p": "position"
		} */
		/*ExpressionAttributeValues:{
			":pos": "pos", ":o": operand	
		},
		ReturnValues:"UPDATED_NEW"
	}
	
	docClient.update(params, callback); , function(err, data) {*/
	/* if (err)
			console.log(err); 
		else {
			console.log(data); 
			res.send(JSON.stringify(data, null, 2));
		}
	}); */
//}
//updateCount(1);

//	query entire student database
app.get('/student', function (req, res) {
	var params = {
		TableName: 'student'
	};
	dynamodb.scan(params, function(err, data) {
		if(err) {
			console.log(err); 
		}
		else 
			res.send(JSON.stringify(data, null, 2)); 
	}); 
});
//	query entire class database
app.get('/class', function (req, res) {
	var params = {
		TableName: 'class'
	}
	dynamodb.scan(params, function(err, data) {
		if(err) 
			console.log(err); 
		else 
			res.send(JSON.stringify(data, null, 2)); 
	}); 
});

//	query individual student by id
app.get('/student-lookup', function (req, res) {
	var params = {
		TableName : "student",
		Key: {
			"student_id" : {
				"N" : req.query.student_id
			}
		}
	}
	dynamodb.getItem(params, function(err, data) {
	if (err)
			console.log(err); 
		else {
			console.log(data); 
			res.send(JSON.stringify(data, null, 2));
		}
	});
});
//	gets a list of all classes taken by a student
function getClasses(student_id){
	var params = {
		TableName : "student",
		Key: {
			"student_id" : {
				"N" : student_id
			}
		}
	}
	var arr = [];
	dynamodb.getItem(params, function(err, data){
		if (err)
			console.log(err); 
		else {
			var i = 0;
			data.Item.course.L.forEach(function(item){
				arr[i]=item.S;
				i++;
			});
		}
	});
	return arr;
}
//	query information about student classes
app.get('/student-classes', function (req, res) {
	getClasses(req.query.student_id, function(response){
		var params2 = {
			RequestItems: {
				"student": {
					Key: {
						"student_id" : { "N" : req.query.student_id }
					},
					ProjectionExpression: "name, student_id"
				},
				"class": {
					
				}

			}
		}
	});
});
//	batch request for student's and their classes
app.get('/all', function (req, res) {
	getClasses(req.query.student_id, function(response){
		var params = {
			RequestItems: {
				"student": {
					Key: {
						"student_id" : { "N" : req.query.student_id }
					},
					ProjectionExpression: "name, student_id"
				},
				"class": {
					Key: {
						"course" : { "N" : req.query.student_id }
					},
					ProjectionExpression: "course, instructor" 
				}

			},
			"ReturnConsumedCapacity": "TOTAL"
		}
		
	});
});

//	update student name
app.post('/update-student', function (req, res) {
	var params = {
		TableName : "student",
		Key:{
			"student_id"	: Number(req.query.student_id)
		},
		ExpressionAttributeNames: {
			"#n": "name"
		},
		UpdateExpression : "SET #n = :n", //course = :c",
		ExpressionAttributeValues:{
			":n": req.query.name	//,
			//":c":["psy101", "art221", "pe141"]
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

//app.post('/update-class', function (req, res) {

app.put('/add-student', function (req, res) {
	//var id_num = updateCount("counter", "type", "student", 1);
	var id = crypto.randomBytes(10);
	console.log(id);
	var params = {
		TableName : "student",
		
		Item:{
			"student_id"	: {"N": id},
			"name"    		: {"S": req.query.name}
        },
		"ConditionExpression": "attribute_not_exists(student_id) and attribute_not_exists(name)"
    }
	dynamodb.putItem(params, function(err, data) {
		if(err)
			console.log(err); 
		else 
			console.log(JSON.stringify(data)); 
	}); 
	/* dynamoDB.putItem(
{
    "TableName": "student",
    "Item": {
        "student_id"	: {"N": req.query.student_id},
		"name"    		: {"S": req.query.name}
    }
}, function(result) {
    result.on('data', function(chunk) {
        console.log("" + chunk);
    });
});
console.log("Items are succesfully ingested in table .................."); */ 
});
app.delete('/remove-student', function (req, res) {
	var params = {
		TableName : "student",
		Key:{
			"student_id"	: Number(req.query.student_id)
        },
    }
	docClient.delete(params, function(err, data) {
		if(err)
			console.log(err); 
		else 
			res.send(JSON.stringify(data)); 
	}); 
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});