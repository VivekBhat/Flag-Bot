var LaunchDarkly = require('ldclient-node');
var request = require('request');
var client = LaunchDarkly.init("sdk-5a27f3aa-f69b-487c-ad59-b590aa1c34c5");
var user = {
  "firstName": "Bob",
  "lastName": "Loblaw",
  "key": "bob@example.com",
  "custom": {"groups": "beta_testers"}
};
client.once('ready', function() {
  client.variation("new-search-bar", user, false, function(err, showFeature) {
    var test = "This should not be deleted.";
    if (showFeature) {
      // application code to show the feature
      console.log("Showing your feature to " + user.key );
    } else {
      // the code to run if the feature is off
      console.log("Not showing your feature to " + user.key);
    }

    client.flush(function() {
      client.close();
    });
  });
});
var options = {
  url: 'https://app.launchdarkly.com/api/v2/flags/default',
  method: 'GET',
  headers: {
	  "content-type": "application/json",
	  "Authorization": 'api-094a8936-af14-4ac3-82ce-51e9f2a6e42f'
  }
};
request(options, function (error, response, body) 
{
  console.log("Status code: " + response.statusCode);
  console.log(body);
});

