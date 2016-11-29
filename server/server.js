/*================================================
 * Important Notes
 *
 * 1. The webhook on launchdarkly has had a policy instantiated so that only flag based posts
 *      will be sent to the bot (testing still exists just in case in the handlePost() function)
 * 2. If the PROJKEY or ENVIORN constants are changed, getFlag() must also be updated (check
 *      function internal comments)
 *================================================*/

/*================================================
 * Imports
 *================================================*/


var http = require('http');
var fs = require('fs');
var request = require('request');

// removed until import error repaired
var slackbot = require('../slack/slackbot');
var slackbotReady = slackbot.readyPromise;


/*================================================
 * Global Variables/Constants
 *================================================*/


const PORT=40676; // This is the port # that the server will be listening for request on
const URLROOT = "https://app.launchdarkly.com/api/v2/";
const TOKEN = "api-094a8936-af14-4ac3-82ce-51e9f2a6e42f";

// Refer to important notes when changing these
const PROJKEY = "default";
const ENVIRON = "production";

var flagStateFileName = "flagStates.json";
var flagStatesJSONArray;

var timeoutArray = new Array();


/*================================================
 * Server functions
 *================================================*/


// This function handles when a post or get request is made to the node server
function handleRequest(serverRequest, response){

    if (serverRequest.method == 'POST') {
        
        console.log("POST");
        var body = '';
        serverRequest.on('data', function (data) {
            body += data;
            //console.log("Partial body: " + body);
            /*fs.writeFile("Partial_body.json", data, (err) => {
                if(err) console.log("Error wr <asdfioiting partial body");
                else console.log("Partial body writing succesful");
            });*/
        });
        serverRequest.on('end', function () {
            //console.log("Body: " + body);
            /*fs.writeFile("body.json", body, (err) => {
                if(err) console.log("Error writing body");
                else console.log("Body writing succesful");
            })*/

            handlePost(body);            
        });

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('post received');
    }
    else
    {
        console.log("GET");
        //var html = '<html><body><form method="post" action="http://cutegirls.servebeer.com:40676">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
        //var html = fs.readFileSync('index.html');
        var html = '<html><body><h1>This server does not accept GET requests besides this.</h1></body>';
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(html);
    }
}

// This function handles when a POST is made to the server
function handlePost(postJSON) {
    var post = JSON.parse(postJSON);

    //console.log(post);

    // NOTE
    // - The launchdarkly webhook policy (set on the site for the specific webhook) should eliminate the need for this test,
    //      but kept just in case
    if(post.kind === 'flag') {
        var flagKey;
        var flagCreationDate;
        var flagJSON;
        var flagUpdateDate = post.date;

        switch(post.titleVerb) {
            case 'turned on':
                flagKey = post.currentVersion.key;
                flagCreationDate = post.currentVersion.creationDate;
                flagJSON = {"key":flagKey, "createDate":flagCreationDate, "isOn":true, "activationDate":flagUpdateDate};
                updateFlagState(flagJSON);

                createFlagTimeout(flagKey);
                break;

            case 'turned off':
                flagKey = post.currentVersion.key;
                flagCreationDate = post.currentVersion.creationDate;
                flagJSON = {"key":flagKey, "createDate":flagCreationDate, "isOn":false, "activationDate":flagUpdateDate};
                updateFlagState(flagJSON);

                deleteFlagTimeout(flagKey);
                break;

            case 'created flag':
                flagKey = post.currentVersion.key;
                flagCreationDate = post.currentVersion.creationDate;
                flagJSON = {"key":flagKey, "createDate":flagCreationDate, "isOn":false, "activationDate":flagUpdateDate};
                updateFlagState(flagJSON);
                break;

            case 'deleted flag':
                flagKey = post.previousVersion.key;
                deleteFlag(flagKey);
                slackbotReady.then(function(){   
                slackbot.notifyDeletedFlag(flagKey);
                });

                deleteFlagTimeout(flagKey);
                break;

            default:
                console.log("The flag was modified, but its activation state was not affected");
        }
    } else {
        console.log("Post was not feature flag related");
    }
}


/*================================================
 * Local file maintenance functions
 *================================================*/


// This checks to see if the flagName provided exists in the saved flag file
//  The index is returned if true, else -1;
function doesFlagExist(flagKey) {
    for(i=0; i < flagStatesJSONArray.length; i++){
        if(flagStatesJSONArray[i].key == flagKey) {
            return i;
        }
    }
    return -1;
}

function deleteFlag(flagKey) {
    var flagIndex = doesFlagExist(flagKey);

    if(flagIndex >= 0) {
        flagStatesJSONArray.splice(flagIndex, 1);
    } else {
        throw { name: 'NonExistentFlag', message: 'The flag to be deleted did not exist in the flag state file!' };
    }

    saveFlagStates();
}

// Updates flag if it exists in the flag state file, or adds it if not
function updateFlagState(flagJSON) {
    var flagIndex = doesFlagExist(flagJSON.key);

    if(flagIndex >= 0) {
        if(flagStatesJSONArray[flagIndex].isOn != flagJSON.isOn) {

            flagStatesJSONArray[flagIndex].isOn = flagJSON.isOn;
            if(flagJSON.isOn) {
                //NOTE
                // - If flag was activated while bot was not running, then it is assumed that the last mod date was activation date
                flagStatesJSONArray[flagIndex].activationDate = flagJSON.activationDate;
            }/* else {
                NOTE 
                - Uncomment this if the activationDate should be updated even if flag is off (no perceived benefit of doing this)
                - This entire if/else statment can be removed if decided that the activationDate will be updated anytime the file
                    does not match launchdarkly (keep assignment statement though)
            }*/
        }/* else {
            NOTE - Uncomment this section if the flag state is the same since last file update, but the mod date
                is different and reaction to this is desired

            if(flagStatesJSONArray[flagIndex].activationDate != flagJSON.activationDate) {
            
            }
        }*/
    } else {
        flagStatesJSONArray.push(flagJSON);
    }
    saveFlagStates();
}

// Gets the flags and their states from the flag state file
function loadFlagStates(callback) {    
    fs.readFile(flagStateFileName, 'utf8', (err, data) => {
        if(err) {
            fs.writeFile(flagStateFileName, '', function(err) {
                if(err) {
                    console.log("Error the file was not able to be created: ", err.stack);
                }
            });
            console.log("The file was created!");
            callback("");
        } else callback(data);
    });
}

// Saves the flag state file
function saveFlagStates() {
    fs.writeFile(flagStateFileName, JSON.stringify(flagStatesJSONArray), (err) => {
      if (err) throw err;
      console.log('Flag stats saved.');
    });
}

/*================================================
 * Launchdarkly API functions
 *================================================*/

// Retrieves all flags from launchdarkly & updates the flag state file
function getAllFlags() {
    var options = {
      url: URLROOT + 'flags/' + PROJKEY + "?env=" + ENVIRON,
      method: 'GET',
      headers: {
        "content-type": "application/json",
        "Authorization": TOKEN
      }
    };

    // Send a http request to url and specify a callback that will be called upon its return.
    request(options, function (error, response, body) 
    {
        var flags = JSON.parse(body);
        for( var i = 0; i < flags.items.length; i++ )
        {
            var flagKey = flags.items[i].key;
            //console.log(flagKey);
            getFlag(flagKey, function (flagJSON) {
                //console.log(flag);
                updateFlagState(flagJSON);

                if(flagJSON.isOn ) { createFlagTimeout(flagJSON.key, 10000); }
            });
        }
    });
}

// Retrieves the specified flag from launchdarkly & returns it in slackbot JSON format of relevant info
function getFlag(flagKey, callback) {
    var options = {
      url: URLROOT + 'flags/' + PROJKEY + "/" + flagKey + "?env=" + ENVIRON,
      method: 'GET',
      headers: {
        "content-type": "application/json",
        "Authorization": TOKEN
      }
    };

    // Send a http request to url and specify a callback that will be called upon its return.
    request(options, function (error, response, body) 
    {
        var flag = JSON.parse(body);

        //NOTE
        // - if the ENVIRON key is changed the "production" component must be also
        // - if the keys of this array are updated, the flag state file must be recreated as empty & updateFlagState() must be updated
        // - activationDate defaults to the lastModified date of flag if the flag was created while bot was not running (whether flag is on or not)
        var flagJSON = {"key":flag.key, "createDate":flag.creationDate, "isOn":flag.environments.production.on, "activationDate":flag.environments.production.lastModified};
        
        callback(flagJSON);
    });
}

/*================================================
 * Timer functions
 *================================================*/

// This function is called upon a flag timeout
function flagTimedOut(flagKey, msTimeout) {
    //console.log("Timed out " + flagKey + msTimeout + "ms");
    slackbotReady.then(function(){
        slackbot.notifyTimedOutFlag(flagKey, msTimeout);
    });
}

// Use this function to create a timeout for the specified flag
// if a timeout in milliseconds is not specified then defaults to 7 days
function createFlagTimeout(flagKey, msTimeout) {
    msTimeout = (typeof msTimeout === 'undefined') ? 600000000 : msTimeout;

    var newTimeout = setTimeout(flagTimedOut(flagKey, msTimeout), msTimeout);

    timeoutArray.push({flagkey:newTimeout});

    console.log("Timeout for " + flagKey + " created");
    //console.log("timeout array = " + timeoutArray);
}

// Deletes a time out for the specified flag
function deleteFlagTimeout(flagKey) {
    timeoutArray.splice(flagKey, 1);

    console.log("Timeout for " + flagKey + " deleted");
    //console.log("timeout array = " + timeoutArray);
}

/*function mockNotification() {
    slackbotReady.then(function(){
        slackbot.notify("MOCK: A feature flag has been deleted. What would you like to do? (Need button options for either integrating or discarding feature)");
    });
}

setInterval(mockNotification, 20000);*/


/*================================================
 * Server Init
 *================================================*/

function serverInit() {
    // Lets loaded our saved flag data
    loadFlagStates(function(data){
        if(data != "") {
            flagStatesJSONArray = JSON.parse(data);
            console.log("Flag states file loaded.");         
        } else {
            flagStatesJSONArray = new Array();
            console.log("Flag stats file was empty.");
        }
    });

    // Lets ensure that our flag state file is up-to-date
    getAllFlags();


    //Lets create the server
    var server = http.createServer(handleRequest);

    //Lets start our server
    server.listen(PORT, function(){
        //Callback triggered when server is successfully listening. Hurray!
        console.log("Server listening on: http://localhost:%s", PORT);
    });
}

serverInit();
