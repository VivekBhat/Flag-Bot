var Parser = require("esprima-ast-utils");
var fs = require("fs");
var Esp = require ("esprima");


/**************************************************/
/* Public
/**************************************************/

module.exports = {

	// Public function to delete a feature flag
	// discardFeature: true if you want to remove all new code
	// returns a promise
	deleteFeatureFlag : function(featureKey, discardFeature) {
		
		return new Promise ( function(resolve, reject) { 
			// Promise doc: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
			// Logic Flow:
			// Remove feature flag code
			if(discardFeature) {
				//leave old code, remove new feature code
			} else {
				//leave new code, remove any old feature code for if feature is not on
			} 
		} );
		
	} 
}

/**************************************************/
/* Private
/**************************************************/

function removeFlagCode(fileName, featureKey, discardFeature) {
	var AST = Parser.parseFile("test.js"); //change to fileName
	Parser.traverse(AST, function(node) {
		if(node.type == "something...") {
			// Parser.replace();
		}
	});
	var wstream = fs.createWriteStream('testModified.js');
	wstream.write(Parser.getCode(AST));
	wstream.end();
}

// Returns files that use the feature flags, using simple string 
// matching with the feature flag key.
function findFilesWithFeature() {
	return [];
}

function findlibraryName() {

}

function findClientVarible() {
	//uses find library name
}
