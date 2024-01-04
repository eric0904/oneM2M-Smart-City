///////////////Parameters/////////////////
var cseUrl = "http://127.0.0.1:7579";
var aeId = "S"+"notiapplication";
var aeName = "notiapplication";
var aeIp = "127.0.0.1";
var aePort = 4000;
var sub_Container = "/Mobius/lumi/DATA"; //
var threshold = 300;
var count = 0;
var arr_container = [];
arr_container[count] = {};
arr_container[count++].path = "/Mobius/lamp/COMMAND";
// arr_container[count] = {};
// arr_container[count++].path = "/Mobius/lamp1/COMMAND";
//////////////////////////////////////////

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.json());
app.listen(aePort, function () {
	console.log("AE Notification listening on: "+aeIp+":"+aePort);
});

var lamp_value = 0;
app.post("/"+aeId, function (req, res) {
	var req_body = req.body["m2m:sgn"].nev.rep["m2m:cin"];
	if(req_body != undefined) {
		console.log("\n[NOTIFICATION]")
		console.log(req_body);
		var content = req_body.con;
		console.log("Receieved luminosity: " + content);
		if (content > threshold && lamp_value == 1) {
			console.log("High luminosity => Switch lamp to 0");
			for (var i = 0; i < arr_container.length; i++) {
				createContenInstance(i, "0");
			}
			lamp_value = 0;
		} else if (content < threshold && lamp_value == 0) {
			console.log("Low luminosity => Switch lamp to 1");
			for (var i = 0; i < arr_container.length; i++) {
				createContenInstance(i, "1");
			}
			lamp_value = 1;
		} else {
			console.log("Nothing to do");
		}
		res.sendStatus(200);
	}
});

createAE();
function createAE(){
	console.log("\n[REQUEST]");
	var method = "POST";
	var url= cseUrl+"/Mobius";
	var resourceType=2;
	var requestId = Math.floor(Math.random() * 10000);
	var representation = {
		"m2m:ae":{
			"rn":aeName,			
			"api":"app.company.com",
			"rr":"true",
			"poa":["http://"+aeIp+":"+aePort]
		}
	};

	console.log(method+" "+url);
	console.log(representation);

	var options = {
		url: url,
		method: method,
		headers: {
			"Accept": "application/json",
			"X-M2M-Origin": aeId,
			"X-M2M-RI": requestId,
			"Content-Type": "application/json;ty="+resourceType
		},
		json: representation
	};

	request(options, function (error, response, body) {
		console.log("[RESPONSE]");
		if(error){
			console.log(error);
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==409){
				resetAE();
			}else{
				createSubscription();
			}
		}
	});
}

function resetAE(){
	console.log("\n[REQUEST]");
	var method = "DELETE";
	var url= cseUrl+"/Mobius/"+aeName;
	var requestId = Math.floor(Math.random() * 10000);

	console.log(method+" "+url);

	var options = {
		url: url,
		method: method,
		headers: {
			"Accept": "application/json",
			"X-M2M-Origin": aeId,
			"X-M2M-RI": requestId,
		}
	};

	request(options, function (error, response, body) {
		console.log("[RESPONSE]");
		if(error){
			console.log(error);
		}else{			
			console.log(response.statusCode);
			console.log(body);
			createAE();
		}
	});
}
function resetSub(){
	console.log("\n[REQUEST]");
	var method = "DELETE";
	var requestId = Math.floor(Math.random() * 10000);
	var url= cseUrl+sub_Container+'/sub';

	var options = {
		url: url,
		method: method,
		headers: {
			"Accept": "application/json",
			"X-M2M-Origin": aeId,
			"X-M2M-RI": requestId,
		}
	};

	request(options, function (error, response, body) {
		console.log("[RESPONSE]");
		if(error){
			console.log(error);
		}else{
			console.log(response.statusCode);
			console.log(body);
			createSubscription();
		}
	});
}

function createSubscription(){
	console.log("\n[REQUEST]");
	var method = "POST";
	var url= cseUrl+sub_Container;
	var resourceType=23;
	var requestId = Math.floor(Math.random() * 10000);
	var representation = {
		"m2m:sub": {
			"rn": "sub",
			"nu": ["http://"+aeIp+":"+aePort+"/"+aeId+"?ct=json"],
			"nct": 2,
			"enc": {
				"net": [3]
			}
		}
	};

	console.log(method+" "+url);
	console.log(representation);

	var options = {
		url: url,
		method: method,
		headers:{
			"Accept": "application/json",
			"X-M2M-Origin": aeId,
			"X-M2M-RI": requestId,
			"Content-Type": "application/json;ty="+resourceType
		},
		json: representation
	};
	console.log(options.headers)
	request(options, function (error, response, body) {
		console.log("[RESPONSE]");
		if(error){
			console.log(error);
		}else{
			console.log(response.statusCode);
			console.log(body);
			if(response.statusCode==409){
				resetSub();
			}
		}

	});
}

function createContenInstance(count,value){
	if(arr_container.length == 0){
		console.log("No more paths to create")
	}else{
		console.log("\n[REQUEST]");
		var method = "POST";
		var url= cseUrl+arr_container[count].path;
		var resourceType=4;
		var requestId = Math.floor(Math.random() * 10000);
		var representation = {
			"m2m:cin":{
					"con": value
				}
			};

		console.log(method+" "+url);
		console.log(representation);

		var options = {
			url: url,
			method: method,
			headers: {
				"Accept": "application/json",
				"X-M2M-Origin": aeId,
				"X-M2M-RI": requestId,
				"Content-Type": "application/json;ty="+resourceType
			},
			json: representation
		};

		request(options, function (error, response, body) {
			console.log("[RESPONSE]");
			if(error){
				console.log(error);
			}else{
				console.log(response.statusCode);
				console.log(body);
			}
		});
	}
}
