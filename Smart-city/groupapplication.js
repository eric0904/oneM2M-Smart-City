///////////////Parameters/////////////////
var cseUrl = "http://127.0.0.1:7579";
var aeId = "S"+"groupapplication";
var group_name = "grlamp";
// var aeName = "groupapplication";
var group_path = "/Mobius/"+group_name+"/fopt";
var request = require('request');
var i = 0;
function start_interval(){
	setInterval(function () {
		if(i==1){
			createContenInstance(group_path,i);
			i=0;
		}
		else{
			createContenInstance(group_path,i);
			i=1;
		}
	},3000);
}

createGroup();
function createGroup(){
	console.log("\n[REQUEST]");
	var method = "POST";
	var url= cseUrl+"/Mobius";
	var resourceType=9;
	var requestId = Math.floor(Math.random() * 10000);
	var representation = {
		"m2m:grp":{
			"rn":group_name,
			"mid":[
				"Mobius/lamp1/COMMAND",
				"Mobius/lamp2/COMMAND"
			],
			"mnm":10
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
				resetGroup();
				console.log(response.statusCode);
			}else{
				start_interval();

			}
		}
	});
}

function resetGroup(){
	console.log("\n[REQUEST]");
	var method = "DELETE";
	var url= cseUrl+"/Mobius/"+group_name;
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
			createGroup();
		}
	});
}

function createContenInstance(path,value){
	console.log("\n[REQUEST]");
	var method = "POST";
	var url= cseUrl+path;
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
