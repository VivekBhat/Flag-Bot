var fs = require("fs");
var Parser = require("./parser.js");
var utils = require('util')
var exec = require('child_process').exec;

child = exec("find . -type f -name '*.js' > '" + __dirname + "/output.txt'");

deleteFeatureFlag("new-search-bar",false);

// discardFeature: true if you want to remove all new code
// returns a promise
function deleteFeatureFlag(featureKey, discardFeature) {
	return new Promise ( function(resolve, reject) { 
		// executes `find for all .js files`
		console.log(__dirname);
		child = exec("find . -type f -name '*.js' > '" + __dirname + "/output.txt'"); //TODO: point to git repo folder
		var lineReader = require('readline').createInterface({
			input: require('fs').createReadStream(__dirname + '/output.txt')
		});
		var fileCount = 0;
		lineReader.on('line', function (line) {
			fileCount++;
			Parser.parseCode(line, featureKey, discardFeature);
		});
		if(fileCount == 0) {
			reject("No files were found.");
			return;
		}
		resolve();
	});
}

module.exports = {

	deleteFeatureFlag : deleteFeatureFlag
} 