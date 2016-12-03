var fs = require("fs");

var configFD = fs.openSync("./config.json", 'r');
var configData = fs.readFileSync(configFD, 'utf8');

var parsedConfig = JSON.parse(configData);


var TOKEN = '';
TOKEN = parsedConfig.slackToken;

var LDAuth = '';
LDAuth = parsedConfig.ldToken;

var githubURL = '';
githubURL = parsedConfig.githubURL;

while(TOKEN == '' || LDAuth == '' || getGithubURL == '') console.log("tokenLoader : waiting...");		// SCB - Not sure if this helps, but maybe :P

fs.closeSync(configFD);


var getToken = function getToken() {
	return TOKEN;
}

var getLDAuth = function getLDAuth() {
	return LDAuth;
}

var getGithubURL = function getGithubURL() {
	return githubURL;
}

module.exports.getToken = getToken
module.exports.getLDAuth = getLDAuth;
module.exports.getGithubURL = getGithubURL;
