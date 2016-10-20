//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');
var slackbot = require('../slack/slackbot');

var flagStateFileName = "flagStates.json";
var flagStateJSON;

/* This is the port # that the server will be listening for request on */
const PORT=40676; 

/* This function handles when a post or get request is made to the node server */
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
            //console.log("Partial body: " + body);
            /*fs.writeFile("Partial_body.json", data, (err) => {
                if(err) console.log("Error wr <asdfioiting partial body");
                else console.log("Partial body writing succesful");
            });*/
        });
        request.on('end', function () {
            //console.log("Body: " + body);
            fs.writeFile("body.json", body, (err) => {
                if(err) console.log("Error writing body");
                else console.log("Body writing succesful");
            })

            handlePost(body);            
        });

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('post received');
    }
    else
    {
        console.log("GET");
        //var html = '<html><body><form method="post" action="http://cutegirls.servebeer.com:40676">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        var html = '<html><body><h1>This server does not accept GET requests besides this.</h1></body>';
        //var html = fs.readFileSync('index.html');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(html);
    }
}

/* This function handles when a POST is made to the server */
function handlePost(postJSON) {
    var post = JSON.parse(postJSON);

    if(post.kind === 'flag') {
        var flagName = post.name;
        var flagDate = post.date;
        var flagVerb = post.titleVerb;

        //console.log("flag: " + flagName + " " + flagDate + " " + flagVerb);
        var flagIndex = doesFlagExist(flagName);
        if(flagIndex >= 0) {
            flagStateJSON[flagIndex].date = flagDate;
            flagStateJSON[flagIndex].verb = flagVerb;
        } else {
            //var newFlagJson = {"name":flagName, "date":flagDate, "verb":flagVerb};
            //var newFlagJson = {"name":flagName, "date":flagDate, "verb:flagVerb};
            flagStateJSON.push(newFlagJson);
        }

        saveFlagStates(JSON.stringify(flagStateJSON));
    } else {
        console.log("Post was not feature flag related");
    }
}

/* This checks to see if the flagName provided exists in the saved flag file
    The index is returned if true, else -1;
*/
function doesFlagExist(flagName) {
    for(i=0; i < flagStateJSON.length; i++){
        if(flagStateJSON[i].name == flagName) {
            return i;
        }
    }
    return -1;
}

/* Gets the flags and their states from the saved file */
function getFlagStates(callback) {    
    return fs.readFile(flagStateFileName, 'utf8', (err, data) => {
        if(err) {
            console.log("Error: " + err.stack);
        }
        callback(data);
    });
}

/* Saves the flag states */
function saveFlagStates(flagState) {
    fs.writeFile(flagStateFileName, flagState, (err) => {
      if (err) throw err;
      console.log('Flag stats saved.');
    });
}


function mockNotification() {
    slackbot.notify("MOCK: A feature flag has been deleted. What would you like to do? (Need button options for either integrating or discarding feature)");
}

setInterval(mockNotification, 10000);

/*
// Lets loaded our saved flag data
getFlagStates(function(data){
    if(data != "") {
        flagStateJSON = JSON.parse(data);
        console.log("Flag states file loaded.");         
    } else {
        flagStateJSON = new Array();
        console.log("Flag stats file was empty.");
    }
});

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});*/
