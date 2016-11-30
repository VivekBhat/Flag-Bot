
var request = require('request');
var Promise = require('bluebird');
var parse = require('parse-link-header');

var token = "token " + "a13436a61ce97c77629c82f789d49313002e9cc5";
var userId = "flaglag";
var testRepo = "TestCodeFlagBot";
var urlRoot = "https://api.github.com";


// POST /repos/:owner/:repo/pulls

//createPull(userId, testRepo);

cloneRepo(userId, testRepo);
// POST /repos/:owner/:repo/pulls

//POST /repos/:owner/:repo/issues


/* Get - Clone the repository */
function cloneRepo(userName, testRepo){
	var options = {
		url: urlRoot + "/repos/" + userName + "/" + testRepo + "/pulls",
    method: 'GET',
    headers: {
      "User-Agent": "EnableIssues",
      "content-type": "application/json",
      "Authorization": token
    }
  };

  // Send a http request to url and specify a callback that will be called upon its return.
	request(options, function (error, response, body) 
	{
		var obj = JSON.parse(body);
		console.log( obj );
		for( var i = 0; i < obj.length; i++ )
		{
			var name = obj[i].name;
			console.log( name );
		}
	});




}

/* Creates a pull requestfor the given user's repo */
function createPull(userName, testRepo) {
	var options = {
		url: urlRoot + "/repos/" + userName + "/" + testRepo + "/pulls",
    method: 'POST',
    headers: {
      "User-Agent": "EnableIssues",
      "content-type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({
		 "title": "Amazing new feature",
		  "body": "Please pull this in!",
		  "head": "octocat:new-feature",
		  "base": "master"
		})
  };


	// Send a http request to url and specify a callback that will be called upon its return.
	request(options, function (error, response, body) 
	{
		if (error) {
			console.log("Post error: ", error);
		} else {
			// var obj = JSON.parse(body);
			// var url = obj.url;
			// var title = obj.title;
			// console.log("issue:\n", url, title);
			console.log("No issues :/");
			var fs = require('fs');
			var json = JSON.stringify(data, null, 2);
			fs.writeFile("dataGitBot.json", json);
	
		}
	});	
}
