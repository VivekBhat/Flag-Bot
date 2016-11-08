var _ = require("underscore");
var Parser = require("esprima-ast-utils");
var fs = require("fs");
var Esp = require ("esprima");
var launchDarklyLibrary = "ldclient-node";

/** Assumptions that would mess us up **/
//  * Library and client variables are in every file - could be imported somehow
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
	Parser.parentize(AST);
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

function getLibraryVarName(AST) {
	libraryVarName = null;
	Parser.traverse(AST, function(node){
		if(node.type == 'Literal' && node.value == launchDarklyLibrary) {
			var libraryNode = Parser.getParent(node, function(upperNode){
				return upperNode.type == "VariableDeclarator";
			});
			libraryVarName = libraryNode.id.name;
		}
	});
	return libraryVarName;
}

function getClientVarName(AST, libraryVarName) {
	clientVarName = null;
	Parser.traverse(AST, function(node){
		if(node.object && node.object.name == libraryVarName 
			&& node.property && node.property.name == "init") {
			var clientNode = Parser.getParent(node, function(upperNode){
				return upperNode.type == "VariableDeclarator";
			});
			clientVarName = clientNode.id.name;
		}
	});
	return clientVarName;
}

// Gets outer most layer of feature flag code (client.once)
function getClientOnceContent(node, clientVarName) {
	var onceNodes = [];
 	Parser.traverse(node, function(subNode) {
 		if(isOnceNode(subNode, clientVarName)) { 
 			//Add contents of function callback
 			onceNodes.push(subNode.expression.arguments[1].body);
 		}
 	});
 	return onceNodes;
}

function isOnceNode(node, clientVarName) {
	try{
		if( (node.type === "ExpressionStatement") && 
			(node.expression.callee.object.name === clientVarName) && 
			(node.expression.callee.property.name === "once") ) {
			console.log(node);
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
 		if(isVariationNode(subNode, clientVarName)) { 
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
	Parser.detach(variationNode);
}

function deleteLDCode() {
	//TODO
}
