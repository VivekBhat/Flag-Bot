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
	var libraryVarName = getLibraryVarName(AST);
	var clientVarName = getClientVarName(AST, libraryVarName);

	var featureCodeLeft = false; //Other feature flags are still here (used for removing library code
	_.each(getClientOnceContent(AST, clientVarName), function(onceNode) {
		console.log("Once node found");
		_.each(getClientVariationNodes(onceNode, clientVarName), function(variationNode) {
			console.log("Variation node found");
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
function getLibraryVarName(AST) {
	libraryVarName = null;
	Parser.traverse(AST, function(node){
		if(node.type == 'Literal' && node.value == launchDarklyLibrary) {
		//now try to get the variable name of the library call
		console.log("Found library call.");
		var libraryVariable = Parser.getParent(node, function(upperNode){
			return upperNode.type == "identifier";
		});
		//libraryVarName = libraryVariable.name;
	}
	});
	libraryVarName = "LaunchDarkly"; //TODO: remove when works
	return libraryVarName;
}

function getClientVarName(AST, libraryVarName) {
	//uses find library name
	return "client";//TODO
}

// Gets outer most layer of feature flag code (client.once)
function getClientOnceContent(node, clientVarName) {
	var onceNodes = [];
 	Parser.traverse(node, function(subNode) {
 		if(isOnceNode(subNode)) { 
 			//Add contents of function callback
 			onceNodes.push(subNode.expression.arguments[1].body);
 		}
 	});
 	return onceNodes;
}

function isOnceNode(node, clientVarName) {
	try{
		if(node.type == "ExpressionStatement" &&
		node.expression.callee.object.name == clientVarName &&
		node.expression.callee.property.name == "once") {
			return true;
		}
	} catch(e) {
		return false;
	}
	return false;
}

// Gets feature flag layer of all feature flag code (client.variation)
function getClientVariationNodes(node, clientVarName) {
	var variationNodes = [];
 	Parser.traverse(node, function(subNode) {
 		if(isVariationNode(subNode)) { 
 			//Add contents of function callback
 			variationNodes.push(subNode);
 		}
 	});
 	return variationNodes;
}

function isVariationNode(node, clientVarName) {
	try{
		if(node.type == "ExpressionStatement" &&
		node.expression.callee.object.name == clientVarName &&
		node.expression.callee.property.name == "variation") {
			return true;
		}
	} catch(e) {
		return false;
	}
	return false;
}

function getVariationFlagName(variationNode) {
	return variationNode.expression.arguments[0].value;
}

function removeFlagCode(variationNode, discardFeature) {
	Parser.traverse(variationNode, function(subNode) {
		// Look for node with...
		// type - "IfStatement"
		// alternate - else content
	});
	Parser.replace(variationNode, "//Node replaced\n");
}

function deleteLDCode() {
	//TODO
}
