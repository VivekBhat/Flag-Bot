var SlackBot = require('slackbots');
var notificationChannels = ["C2QHSD89J"];
var sendAsUser = false;

// create a bot 
var bot = new SlackBot({
    // Add a bot https://my.slack.com/services/new/bot and put the token  
    token: "", 
    name: 'FlagLag Bot'
});
 
//TODO: change image
bot.on('start', function() {    
    notify(getCommands());
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm 
    // Check that it is a message type, not a bot, and the user is not the bot
    if( data.type == 'message' && data.user && getUser(data.user).name != bot.name )
    {
        if(getChannel(data.channel) && !data.text.includes("<@" + bot.self.id + ">")) {
            return;
        }

        var command = data.text.toLowerCase().trim();
		
        switch(command) {
            case 'list flags':
                reply(data, "Don't tell me what to do!");
                break;
            case 'create flag':
                reply(data, "Don't tell me what to do!");
                break;
            case 'delete flag':
                reply(data, "Don't tell me what to do!");
                break;
            default :
                reply(data,getCommands());
        }
    }
});

//Posts message to notificationChannels array defined at top
function notify(msg) {
    for(var i = 0; i < notificationChannels.length; i++) {
        var channel = getChannel(notificationChannels[i]);
        if( channel ) 
        {
            bot.postMessageToChannel(channel.name, msg, {as_user: sendAsUser});    
        }
    }
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

//Usage:
    // more information about additional params https://api.slack.com/methods/chat.postMessage 
    // var params = {
    //     icon_emoji: ':cat:'
    // };
    // bot.getChannels().then(function(channels)
    // {
    //     console.log(JSON.stringify(channels, null, 3))
    // });
function getCommands() {
    return "Here are your options.\n\nThat's right, none. Sorry.";
}
