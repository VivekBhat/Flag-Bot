var _ = require("underscore");
var Parser = require("esprima-ast-utils");
var fs = require("fs");
var Esp = require ("esprima");
var launchDarklyLibrary = "ldclient-node";

parseCode("test.js", "new-search-bar");

/**************************************************/
/* Public
/**************************************************/

module.exports = {

	// Public function to delete a feature flag
	// discardFeature: true if you want to remove all new code
	// returns a promise
	deleteFeatureFlag : function(featureKey, discardFeature) {
		return new Promise ( function(resolve, reject) { 
			var files = findFilesWithFlag();
			if(files.length == 0) {
				reject("No feature flag '" + featureKey + "' was found.");
				return;
			}
			_.each(files, function(file) {
				parseCode(file, featureKey, discardFeature);
			})
			resolve();
			// Promise doc: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
		});
	} 
}

/**************************************************/
/* Private
/**************************************************/

function parseCode(fileName, featureKey, discardFeature) {
	var AST = Parser.parseFile(fileName); 

	var featureCodeLeft = false; //Other feature flags are still here (used for removing library code
	_.each(getClientOnceNodes(AST), function(onceNode) {
		_.each(getClientVariationNodes(onceNode), function(variationNode) {
			var featureName = getVariationFlagName(variationNode);
			if(featureName == featureKey) {
				removeFlagCode(variationNode);
			} else {
				featureCodeLeft = true;
			}
		});
	});
	if(!featureCodeLeft) {
		deleteLDCode();
	}

	Parser.traverse(AST, getLibraryName);
	var wstream = fs.createWriteStream('testModified.js');
	wstream.write(Parser.getCode(AST));
	wstream.end();
}

// Returns files that use the feature flags, using simple string 
// matching with the feature flag key.
function findFilesWithFlag() {
	return []; //TODO
}

// Function passed to parser that deleted LD library call code.
// Should only be used if there are is no LD code left! (not always deleted)
function getLibraryName(node) {
	if(node.type == 'Literal' && node.value == launchDarklyLibrary) {
		//now try to get the variable name of the library call
		console.log("Found library call.");
		var libraryVariable = Parser.getParent(node, function(upperNode){
			return upperNode.type == "identifier";
		});
		console.log(JSON.stringify(libraryVariable));
	}
}

function findClientVarible() {
	//uses find library name
}

// Gets outer most layer of feature flag code (client.once)
function getClientOnceNodes(node) {
	var onceNodes = [];
 	Parser.traverse(node, function(subNode) {
 		if(subNode.type == "IDK") { //TODO
 			onceNodes.push(subNode);
 		}
 	});
}

// Gets feature flag layer of all feature flag code (client.variation)
function getClientVariationNodes(node) {
	var variationNodes = [];
 	Parser.traverse(node, function(subNode) {
 		if(subNode.type == "IDK") { //TODO
 			variationNodes.push(subNode);
 		}
 	});
}

function getVariationFlagName(variationNode) {
	//TODO
	return "fakename";
}

function removeFlagCode(variationNode, discardFeature) {
	Parser.traverse(variationNode, function(subNode) {
		if(subNode.type == "IfStatment" && !discardFeature){

		}
		// Somehow get the 'else'
	});
}

function deleteLDCode() {
	//TODO
}
