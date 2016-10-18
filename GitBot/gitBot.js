
var request = require('request');
var Promise = require('bluebird');
var parse = require('parse-link-header');

var token = "token " + process.env.NCSU_GH_Token;
var urlRoot = "https://github.ncsu.edu/api/v3";
var userId = "vbhat";

var testRepo = "test"


// POST /repos/:owner/:repo/pulls

//createPull(userId, testRepo);


// POST /repos/:owner/:repo/pulls

//POST /repos/:owner/:repo/issues

/* Creates an issue for the given user's repo */
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

			var fs = require('fs');
			var json = JSON.stringify(data, null, 2);
			fs.writeFile("dataGitBot.json", json);
	
		}
	});	
}
