var _ = require('underscore');
var request = require("request");

var LDAuth = "api-094a8936-af14-4ac3-82ce-51e9f2a6e42f";
var baseURL = "https://app.launchdarkly.com/api/v2";
var flagURL = baseURL + '/flags/default';

module.exports = {

	getFlags : function(callback) {
	    var options = {
	      url: flagURL,
	      method: 'GET',
	      headers: {
	          "content-type": "application/json",
	          "Authorization": LDAuth
	      }
	    };

	    request(options, function (error, response, body) 
	    {;
	        var flagNames = [];
	        _.each(JSON.parse(body).items, function(item) {
	        	flagNames.push(item.key);
	        })
	        callback(flagNames);
	    });
	},

	createFlag : function(flagName, callback) {

		var options = {
			url: flagURL,
			method: 'POST',
			headers: {
			  "content-type": "application/json",
			  "Authorization": LDAuth
			},
			body: {
				"name": flagName,
				"key": flagName.toLowerCase().replace(" ","-"),
				"description": "A new feature!",
				"variations": [
					{
					  "value": true,
					  "name": "True",
					  "description": "The true variation"
					},
					{
					  "value": false,
					  "name": "False",
					  "description": "The false variation"
					}
				],
			}

	    };

	    request(options, function (error, response, body) 
	    {;
	        console.log(body);
	    });

		var sucessful = true;
		callback(sucessful);
	},

	deleteFlag : function(flagKey, callback) {

		var options = {
	      url: flagURL,
	      method: 'DELETE',
	      headers: {
	          "content-type": "application/json",
	          "Authorization": LDAuth
	      }
	    };

	    // request(options, function (error, response, body) 
	    // {;
	    //     var flagNames = [];
	    //     _.each(JSON.parse(body).items, function(item) {
	    //     	flagNames.push(item.key);
	    //     })
	    //     callback(flagNames);
	    // });

		var sucessful = true;
		callback(sucessful)
	}

}

