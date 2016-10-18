var _ = require('underscore');
var SlackBot = require('slackbots');
var LDAccess = require("./launchDarkly");

var notificationChannels = ["C2QHSD89J"];
var sendAsUser = false;

// create a bot 
var bot = new SlackBot({
    // Add a bot https://my.slack.com/services/new/bot and put the token  
    token: "xoxb-92608187490-1D8dc3X5vPjn6LPbjZucNEGx", 
    name: 'FlagLag Bot'
});
 
bot.on('start', function() {    
    //notify(getCommands());
});

var commands = [
"list flags",
"create flag",
"delete flag"
];

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm 
    // Check that it is a message type, not a bot, and the user is not the bot
    if( data.type == 'message' && data.user && getUser(data.user).name != bot.name )
    {
        var message = data.text;

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
                var argStart = message.toLowerCase().indexOf(command + " ") + command.length + 1;
                argument = message.substr(argStart).toLowerCase().trim();
            }
        });

        switch(command) {

            case 'list flags':
            //TODO! dosen't work for channel case
                if(!argument) {
                    LDAccess.getFlags(function(flagArray) {
                        var botReply = "Your feature flags:\n";
                        _.each(flagArray,function(flag){
                            botReply += flag + "\n";
                        });
                        reply(data, botReply);
                    });
                } else {
                    reply(data, "Please do not provide an argument.");
                }
                break;

            case 'create flag':
                if(argument) {
                    if(argument.split(" ").length > 1) {
                        reply(data, "Your flag key cannot have spaces.");
                        break;
                    }
                    LDAccess.createFlag(argument, function(successful) {
                        var botReply = "Your flag ("+ argument +") was created!\n";
                        if(!successful) {
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

function getCommands() {
    var commandsMessage = "Here are your options. To see them again, type 'help'.\n\n";
    commandsMessage += "To see all of your flags, type \'list flags\'.\n"
    commandsMessage += "To create a flag, type \'create flag <flag-key>\'.\n"
    commandsMessage += "To delete a flag, type \'delete flag <flag-key>\'.\n"
    return commandsMessage;
}