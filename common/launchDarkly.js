var _ = require('underscore');
var request = require("request");
var baseURL = "https://app.launchdarkly.com/api/v2";
var flagURL = baseURL + '/flags/default';

var fs = require("fs");
var config = JSON.parse(fs.readFileSync("../config.JSON", 'utf8'));
var LDAuth = config.ldToken;

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

	    
	turnOnFlag : function(flagKey, callback) {
        
        var options = {
			url: flagURL + "/" + flagKey,
			method: 'PATCH',
			headers: {
			  "content-type": "application/json",
			  "Authorization": LDAuth
			},
			json: [
                    { 
                        "op": "replace", 
                        "path" : "/environments/production/on",
                        "value": true 
                    },
                    { 
                        "op": "replace", 
                        "path" : "/environments/test/on",
                        "value": true 
                    }
                  ]		      
	    };
        
        request(options, function (error, response, body) {
	         var successful = false;
	    	 if(response.statusCode == 200 )
	    		successful = true;
	         callback(successful);
	    });   
    },        
  
    
	turnOffFlag : function(flagKey, callback) {
    
        var options = {
			url: flagURL + "/" + flagKey,
			method: 'PATCH',
			headers: {
			  "content-type": "application/json",
			  "Authorization": LDAuth
			},
			json: [
                    { 
                        "op": "replace", 
                        "path" : "/environments/production/on",
                        "value": false 
                    },
                    { 
                        "op": "replace", 
                        "path" : "/environments/test/on",
                        "value": false 
                    }
                  ]		      
	    };
        
        request(options, function (error, response, body) {
	         var successful = false;
	    	 if(response.statusCode == 200 )
	    		successful = true;
	         callback(successful);
	    });   
	}

}

