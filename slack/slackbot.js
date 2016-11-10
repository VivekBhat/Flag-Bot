var _ = require('underscore');
var SlackBot = require('slackbots');
var LDAccess = require("../common/launchDarkly");
var Parser = require("../parser/parser");

var notificationChannels = ["C2QHSD89J", "C2SA5Q458"];
var sendAsUser = false;

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

// create a bot 
var bot = new SlackBot({
    // Add a bot https://my.slack.com/services/new/bot and put the token  
    token: "xoxb-92608187490-1D8dc3X5vPjn6LPbjZucNEGx", 
    name: 'FlagLag Bot'
});
 
bot.on('start', function() {    
    notify(getCommands());
});

var commands = [
"list flags",
"create flag",
"delete flag",
"turn on flag",
"turn off flag",
"integrate feature",
"discard feature"
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

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm 
    // Check that it is a message type, not a bot, and the user is not the bot
    if( data.type == 'message' && data.user && getUser(data.user).name != bot.name )
    {
        var message = data.text;

        // TODO: bot not working in the channel.
        // not a direct message so must mention bot
        if(getChannel(data.channel)) { 
            var botMention = "<@" + bot.self.id + ">";
            //not talking to the bot
            if (!message.includes(botMention)) { 
                return;
            } else {
                // Strip out mention, left with command
                message = message.replace(botMention,""); 
            }
        }

        // Find command in list and pull out argument
        //TODO does not ensure there is space after command
        var command;
        var argument;
        _.each(commands, function(commandStr) {
            if(message.includes(commandStr)) {
                command = commandStr;
                // +1 accounts for space after command
                var commandStart = message.toLowerCase().indexOf(command + " ");
                if(commandStart != -1) {
                    var argStart =  commandStart + command.length + 1;
                    argument = message.substr(argStart).toLowerCase().trim();
                }
            }
        });

        switch(command) {

            case 'list flags':
                LDAccess.getFlags(function(flagArray) {
                    if(flagArray.length == 0) {
                        reply(data, "No flags were found.")
                    } else {
                        var botReply = "Your feature flags:\n";
                        _.each(flagArray,function(flag){
                            botReply += flag + "\n";
                        });
                        reply(data, botReply);
                    }
                });
                break;

            case 'create flag':
                if(argument) {
                    if(argument.split(" ").length > 1) {
                        reply(data, "Your flag key cannot have spaces.");
                        break;
                    }
                    LDAccess.createFlag(argument, function(successful) {
                         //console.log("attempt made? \n")
                        var botReply = "Your flag ("+ argument +") was created!\n";
                        if(!successful) {
                            //console.log("Got up to here \n");
                            botReply = "Sorry, there was a problem creating your flag.\n"
                        }
                        reply(data, botReply);
                    });
                } else {
                    reply(data, "Please provide an argument.");
                }
                break;

            case 'delete flag':
                if(argument) {
                    LDAccess.deleteFlag(argument, function(successful) {
                        var botReply = "Your flag ("+ argument +") was deleted!\n";
                        if(!successful) {
                            botReply = "Sorry, there was a problem deleting your flag. Make sure the key provided exists.\n"
                        }
                        reply(data, botReply);
                    });
                } else {
                    reply(data, "Please provide an argument.");
                }
                break;

            case 'turn on flag':
                LDAccess.turnOnFlag(argument, function(successful) {
                    if(successful) {
                        reply(data, "Success! Your feature flag was turned on.");
                    } else {
                         reply(data, "Sorry, there was a problem turning your flag on.");
                    }
                });
                break;

            case 'turn off flag':
                LDAccess.turnOffFlag(argument, function(successful) {
                    if(successful) {
                        reply(data, "Success! Your feature flag was turned off.");
                    } else {
                         reply(data, "Sorry, there was a problem turning your flag off");
                    }
                });
                break;

            case 'integrate feature':
                integrateFeature(argument);                
                break;

            case 'discard feature':
                discardFeature(argument);
                break;

            default :
                reply(data,getCommands());
        }
    }
});

//Posts message to notificationChannels array defined at top
function notify(msg) {
    _.each(notificationChannels, function(channelId) {
        var channel = getChannel(channelId);
        if( channel ) 
        {
            bot.postMessageToChannel(channel.name, msg, {as_user: sendAsUser});    
        }
    });
}

function reply(data, msg)
{
    var channel = getChannel(data.channel)
    if( channel )
    {
        //console.log( "replying in channel ")
        bot.postMessageToChannel(channel.name, msg, {as_user: sendAsUser});    
    }
    else
    {
        var user = getUser(data.user)
        bot.postMessageToUser(user.name, msg, {as_user: sendAsUser} );
    }
}

function getChannel(channelId)
{
    return bot.channels.filter(function (item) 
    {
        return item.id === channelId;
    })[0];
}

function getUser(userId)
{
    return bot.users.filter(function (item) 
    {
        return item.id === userId;
    })[0];
}

module.exports = {
    notify : notify
}

/***************** Bot Actions *******************/

function integrateFeature(flagKey){
    var flagDeletedPromise = Parser.deleteFeatureFlag(flagKey);
    flagDeletedPromise.then( function(val) {
        reply(data, "Success! Your feature was integreted into your code.");
    })
    .catch( function(err) {
        reply(data, "Sorry, there was a problem integrating your feature.");
    });
}

function discardFeature(flagKey){
    var flagDeletedPromise = Parser.deleteFeatureFlag(flagKey, true);
    flagDeletedPromise.then( function(val) {
        reply(data, "Success! Your feature was discarded from your code.");
    })
    .catch( function(err) {
        reply(data, "Sorry, there was a problem discarding your feature.");
    });
}