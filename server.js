//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');

var flagStateFileName = "flagState.json";

getFlagState(function(data){
	var flagState = console.log(data); //JSON.parse(string)
	flagState.flagName = datetime; //now
});

//Lets define a port we want to listen to
const PORT=40676; 

//We need a function which handles requests and send response
function handleRequest(request, response){
		console.dir(request.param);

		// kind : flag
		// titleVerb : turned on
		// action : updateOn
    if (request.method == 'POST') {
		
        console.log("POST");
        var body = '';
        request.on('data', function (data) {
            body += data;
            console.log("Partial body: " + body);
        });
        request.on('end', function () {
            console.log("Body: " + body);
        });
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('post received');
    }
    else
    {
        console.log("GET");
        var html = '<html><body><form method="post" action="http://cutegirls.servebeer.com:40676">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        //var html = fs.readFileSync('index.html');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(html);
    }
}

function getFlagState(callback) {
	return fs.readFile(flagStateFileName, 'utf8', (err, data) => {
		if(err) {
			console.log("Error: " + err.stack);
		}
		console.log("File: " + data);
		callback(data);
	});
}

function saveFlagState(flagState) {
	fs.writeFile(flagStateFileName, flagState, (err) => {
	  if (err) throw err;
	  console.log('It\'s saved!');
	});
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});
