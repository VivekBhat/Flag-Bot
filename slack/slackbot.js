var _ = require('underscore');
var LDAccess = require("../common/launchDarkly");
var FileFinder = require("../parser/parser.js");
var Botkit = require('botkit');
var request = require('request');

var notificationChannels = ["featureflags"];
var sendAsUser = false;
var botName = "flaglagbot";

var fs = require("fs");
var config = JSON.parse(fs.readFileSync("../config.JSON", 'utf8'));
var TOKEN = config.slackToken;

//TESTING!
/**************************************************************************/ 
var testing = false;
if(testing) {
    var nock = require('nock');
    var fs = require('fs');
    var mockData = JSON.parse(fs.readFileSync(__dirname + '/../common/mockdata.json', 'utf8'));

    //MOCK SERVICES
    var listFlags = nock("https://app.launchdarkly.com").persist()
    .get("/api/v2/flags/default")
    .reply(200, JSON.stringify(mockData.listFlags) );

    var createFlag = nock("https://app.launchdarkly.com").persist()
    .post("/api/v2/flags/default")
    .reply(201, JSON.stringify(mockData.createFlag) );

    var deleteFlag = nock("https://app.launchdarkly.com").persist()
    .filteringPath(function(path) {
       return "/api/v2/flags/default";
     })
    .delete("/api/v2/flags/default")
    .reply(200, JSON.stringify(mockData.deleteFlag) );

    var turnOnOffFlag = nock("https://app.launchdarkly.com").persist()
    .filteringPath(function(path) {
       return "/api/v2/flags/default";
     })
    .patch("/api/v2/flags/default")
    .reply(200);
}
/**************************************************************************/ 

var controller = Botkit.slackbot({
  debug: false
});

var readyPromise = new Promise(function(resolve, reject){
    console.log("promising...");
    controller.spawn({
      token: TOKEN,
    }).startRTM(function(err) {
        if(err) {
            reject(err);
        } else {
            resolve();
        }
    });
});

readyPromise.then(function(){
    console.log("Bot is ready!");
    notify(getCommands());
}).catch(function(err) {
    console.log(err);
});

var commands = [
{name:"list flags", expectsArg:false},
{name:"create flag", expectsArg:true},
{name:"delete flag", expectsArg:true},
{name:"turn on flag", expectsArg:true},
{name:"turn off flag", expectsArg:true},
{name:"integrate feature", expectsArg:true},
{name:"discard feature", expectsArg:true}
];

function getCommands() {
    var commandsMessage = "Here are your options. To see them again, type 'help'.\n\n";
    commandsMessage += "To see all of your LaunchDarkly flags, type \'list flags\'.\n";
    commandsMessage += "To create a LaunchDarkly flag, type \'create flag <flag-key>\'.\n";
    commandsMessage += "To delete a LaunchDarkly flag, type \'delete flag <flag-key>\'.\n";

    commandsMessage += "To turn on LaunchDarkly flag, type \'turn on flag <flag-key>\'.\n";
    commandsMessage += "To turn off LaunchDarkly flag, type \'turn off flag <flag-key>\'.\n";

    commandsMessage += "To integrate a feature in your code, type \'integrate feature <flag-key>\'.\n";
    commandsMessage += "To discard a feature in your code, type \'discard feature <flag-key>\'.\n";
    return commandsMessage;
}

controller.on(['direct_message','direct_mention','mention'], function(bot, data) {

    // all ingoing events https://api.slack.com/rtm 
    // Check that it is a message type, not a bot, and the user is not the bot
        var message = data.text;

        // Finds command in list and pull out argument
        //TODO test edge cases
        var command;
        var argument;
        _.each(commands, function(commandObj) {
            if(message.includes(commandObj.name)) {
                command = commandObj;
                var commandStart = message.toLowerCase().indexOf(command.name + " ");
                if(commandStart != -1) {
                    // +1 accounts for space after command
                    var argStart =  commandStart + command.name.length + 1;
                    argument = message.substr(argStart).toLowerCase().trim();
                }
            }
        });

        if(!command){
            bot.reply(data,{text:getCommands()});
            return;
        }

        if(command.expectsArg && !argument) {
            bot.reply(data, {text:"Please provide a flagkey."});
            return;
        }

        switch(command.name) {

            case 'list flags':
                LDAccess.getFlags(function(flagArray) {
                    if(flagArray.length == 0) {
                        bot.reply(data, {text:"No flags were found."});
                    } else {
                        var botReply = "Your feature flags:\n";
                        _.each(flagArray,function(flag){
                            botReply += flag + "\n";
                        });
                        bot.reply(data, {text:botReply});
                    }
                });
                break;

            case 'create flag':
                LDAccess.createFlag(argument, function(successful) {
                     //console.log("attempt made? \n")
                    var botReply = "Your flag ("+ argument +") was created!\n";
                    if(!successful) {
                        //console.log("Got up to here \n");
                        botReply = "Sorry, there was a problem creating your flag.\n"
                    }
                    bot.reply(data, {text:botReply});
                });
                break;

            case 'delete flag':
                flagKeyExists(argument, function(flagKeyExists) {
                    if(!flagKeyExists) {
                        bot.reply(data, {text: "That flag key does not exist."});
                        return;
                    }
                    LDAccess.deleteFlag(argument, function(successful) {
                        var botReply = "Your flag ("+ argument +") was deleted!\n";
                        if(!successful) {
                            botReply = "Sorry, there was a problem deleting your flag. Make sure the key provided exists.\n"
                        }
                        bot.reply(data, {text:botReply});
                    });
                });
                break;

            case 'turn on flag':
                flagKeyExists(argument, function(flagKeyExists) {
                    if(!flagKeyExists) {
                        bot.reply(data, {text: "That flag key does not exist."});
                        return;
                    }
                    LDAccess.turnOnFlag(argument, function(successful) {
                        if(successful) {
                            bot.reply(data, {text:"Success! Your feature flag was turned on."});
                        } else {
                            bot.reply(data, {text:"Sorry, there was a problem turning your flag on."});
                        }
                    });
                });
                break;

            case 'turn off flag':
                flagKeyExists(argument, function(flagKeyExists) {
                    if(!flagKeyExists) {
                        bot.reply(data, {text: "That flag key does not exist."});
                        return;
                    }
                    LDAccess.turnOffFlag(argument, function(successful) {
                        if(successful) {
                            bot.reply(data, {text: "Success! Your feature flag was turned off."});
                        } else {
                            bot.reply(data, {text:"Sorry, there was a problem turning your flag off"});
                        }
                    });
                });
                break;

            case 'integrate feature':
                flagKeyExists(argument, function(flagKeyExists) {
                    if(!flagKeyExists) {
                        bot.reply(data, {text: "That flag key does not exist."});
                        return;
                    }
                    var flagDeletedPromise = FileFinder.deleteFeatureFlag(argument, false);
                    flagDeletedPromise.then( function(val) {
                        LDAccess.deleteFlag(argument, function(successful) {
                            bot.reply(data, {text: "Success! Your feature was integrated into your code."});
                        });
                    })
                    .catch( function(err) {
                        bot.reply(data, {text:"Sorry, there was a problem integrating your feature."});
                    }) 
                });
                break;

            case 'discard feature':
                flagKeyExists(argument, function(flagKeyExists) {
                    if(!flagKeyExists) {
                        bot.reply(data, {text: "That flag key does not exist."});
                        return;
                    }
                    var flagDeletedPromise = FileFinder.deleteFeatureFlag(argument, true);
                    flagDeletedPromise.then( function(val) {
                        LDAccess.deleteFlag(argument, function(successful) {
                            bot.reply(data, {text: "Success! Your feature was discarded from your code."});
                        });
                    })
                    .catch( function(err) {
                        bot.reply(data, {text: "Sorry, there was a problem discarding your feature."});
                    });
                });
                break;

            default :
                bot.reply(data,{text:getCommands()});
        }
});

function flagKeyExists(argument, callback) {
    LDAccess.getFlags(function(flagArray) {
        callback(flagArray.includes(argument));
    });
}

//Posts message to notificationChannels array defined at top
function notify(msg) {
    for(var cha in notificationChannels) {
        var options = {
            url: 'https://slack.com/api/chat.postMessage' + 
                '?token=' + TOKEN +
                '&channel=' + notificationChannels[cha] + 
                '&text=' + msg,
            method: 'GET',
            headers: {
            "content-type": "application/json"
            },
        };

        // Send a http request to url and specify a callback that will be called upon its return.
        request(options, function (error, response, body) 
        {
            if(error) {
                console.log(error);
            }      
        });
    }
}

function notifyDeletedFlag(flagKey) {
    notify("The flag " + flagKey + " has been deleted. Type 'integrate feature <flag-key>'" + 
        "to integrate feature, or 'discard feature <flag-key> to remove feature from code");
}

function notifyTimedOutFlag(flagKey, msTimeout) {
    notify("The flag " + flagKey + " has been activated for " + msTimeout + "ms what would you like to do?");
}

/***************** Exports *******************/
module.exports = {
    readyPromise : readyPromise,
    notify : notify, 
    notifyDeletedFlag : notifyDeletedFlag,
    notifyTimedOutFlag : notifyTimedOutFlag
}



