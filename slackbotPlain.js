var SlackBot = require('slackbots');

// create a bot 
var bot = new SlackBot({
    // Add a bot https://my.slack.com/services/new/bot and put the token  
    token: token, 
    name: 'weatherbot'
});
 
bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage 
    var params = {
        icon_emoji: ':cat:'
    };
    
    // define channel, where bot exist. You can adjust it there https://my.slack.com/services  
    // define existing username instead of 'user_name' 
    bot.postMessageToUser('katiebrey', 'meow!', params); 
    bot.getChannels().then(function(channels)
    {
        console.log(JSON.stringify(channels, null, 3))
    });
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm 
    if( data.type == 'message' && getUser(data.user).name != bot.name )
    {
		var message = data.text;
		
		// List flags
        if( message.contains('list flags') )
        {
			//TODO
			reply(data, "Don't tell me what to do!");
        } 
		
		//Create flag
		else if( message.contains('create flag') ) {
			//TODO
			reply(data, "Don't tell me what to do!");
		} 
		
		else {
			reply(data, "Are you talking to me? Please type 'help' to " +
			"see the list of commands I will respond to.");
		}
    }
});

function reply(data, msg)
{
    var channel = getChannel(data.channel)
    if( channel )
    {
        //console.log( "replying in channel ")
        bot.postMessageToChannel(channel.name, msg, {as_user: true});    
    }
    else
    {
        var user = getUser(data.user)
        bot.postMessageToUser(user.name, msg, {as_user: true} );
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
