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

	parseCode : parseCode

	// Public function to delete a feature flag
	// discardFeature: true if you want to remove all new code
	// returns a promise
	/*deleteFeatureFlag : function(featureKey, discardFeature) {
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
		});
	} */
} 

/**************************************************/
/* Private
/**************************************************/

function parseCode(fileName, featureKey, discardFeature) {
	this.fileName = fileName;
	this.AST = Parser.parseFile(fileName); 
	Parser.parentize(AST);
	this.libraryVarName = getLibraryVarName();
	this.clientVarName = getClientVarName();

	var featureCodeLeft = false; //Other feature flags are still here (used for removing library code
	_.each(getClientOnceNodes(), function(onceNode) {
		_.each(getClientVariationNodes(onceNode), function(variationNode) {
			var featureName = variationNode.getFlagName();
			if(featureName == featureKey) {
				//Neeed to get flagBool somehow. For now, hardcode for testing
				var flagBool = "showFeature"; //TODO!!!
				removeFlagCode(flagBool, variationNode, onceNode);
			} else {
				featureCodeLeft = true;
			}
		});
	});
	if(!featureCodeLeft) {
		deleteLDCode();
	}
	saveFile();
}

function saveFile() {
	var wstream = fs.createWriteStream('testModified.js'); //TODO: use filename
	wstream.write(Parser.getCode(this.AST));
	wstream.end();
}

function getLibraryVarName() {
	libraryVarName = null;
	Parser.traverse(this.AST, function(node){
		if(node.type == 'Literal' && node.value == launchDarklyLibrary) {
			var libraryNode = Parser.getParent(node, function(upperNode){
				return upperNode.type == "VariableDeclarator";
			});
			libraryVarName = libraryNode.id.name;
		}
	});
	return libraryVarName;
}

function getClientVarName() {
	clientVarName = null;
	var that = this;
	Parser.traverse(this.AST, function(node){
		if(node.object && node.object.name == that.libraryVarName 
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
function getClientOnceNodes() {
	var onceNodes = [];
 	Parser.traverse(this.AST, function(subNode) {
 		if(isOnceNode(subNode, this.clientVarName)) { 
 			onceNodes.push(new OnceNode(subNode));
 		}
 	});
 	return onceNodes;
}

// Gets feature flag layer of all feature flag code (client.variation)
function getClientVariationNodes(onceNode) {
	var variationNodes = [];
 	Parser.traverse(onceNode, function(subNode) {
 		if(isVariationNode(subNode, this.clientVarName)) { 
 			variationNodes.push(new VariationNode(subNode));
 		}
 	}.bind(this));
 	return variationNodes;
}

function isOnceNode(node) {
	try{
		if( (node.type == "ExpressionStatement") && 
			(node.expression.callee.object.name == this.clientVarName) && 
			(node.expression.callee.property.name == "once") ) {
			return true;
		}
		return false;
	} catch(e) {
		return false;
	}
}

function isVariationNode(node) {
	try{
		if(node.type == "ExpressionStatement" &&
		node.expression.callee.object.name == this.clientVarName &&
		node.expression.callee.property.name == "variation") {
			return true;
		}
		return false;
	} catch(e) {
		return false;
	}
}

function removeFlagCode(flagBool, variationNode, onceNode, discardFeature) {
	Parser.traverse(variationNode, function(subNode) {
		// TODO: what if do !showFeature
		if(subNode.type == "IfStatement" && subNode.test.name == flagBool) {
			//Move contents of if outside of if
			Parser.attachBefore(subNode, Parser.toProgram(subNode.consequent.body));
			Parser.detach(subNode);
		}
	});

	//TODO: handle case where more than one flag in once node
	var codeToKeep = variationNode.getCallbackContent();
	//Parser.attachBefore(onceNode, Parser.toProgram(codeToKeep));
	//Parser.detach(onceNode);
	Parser.attachBefore(onceNode, Parser.toProgram(onceNode));
}

function deleteLDCode() {
	//TODO
}

/********************* Node Objects ***********************/

function OnceNode(node) {

	//TODO
	node.getFlagBool = function(){
		return "showFeature";
	}	

	return node;
}

function VariationNode(node) {

	node.getFlagName = function(){
		return node.expression.arguments[0].value;
	}

	node.getCallbackContent = function(){
		return node.expression.arguments[3].body;
	}

	return node;
}
