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

	createFlag : function(flagKey, callback) {

		var options = {
			url: flagURL,
			method: 'POST',
			json: true,
			headers: {
			  "content-type": "application/json",
			  "Authorization": LDAuth
			},
			body: {
				"name": flagKey,
				"key": flagKey,
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
	    {
	    	var successful = false;
	    	if(response.statusCode == 201 && body.key)
	    		successful = true;
	        callback(successful);
	    });
		
	},

	deleteFlag : function(flagKey, callback) {

		var options = {
	      url: flagURL + "/" + flagKey,
	      method: 'DELETE',
	      headers: {
	          "content-type": "application/json",
	          "Authorization": LDAuth
	      }
	    };

	    request(options, function (error, response, body) {
	    	var sucessful = false;
	    	if(!error && response.statusCode >=200 && response.statusCode < 300)
	    		sucessful = true;
	        callback(sucessful);
	    });
	},

	/***************************************************************************/
	/* Still need to implement the rest!
	/***************************************************************************/

	turnOnFlag : function(flagKey, callback) {
		// TODO
	},

	turnOffFlag : function(flagKey, callback) {
		// TODO
	}

}

