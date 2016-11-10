var _ = require("underscore");
var fs = require("fs");
var esprima = require("esprima");
var walk = require("esprima-walk");
var escodegen = require("escodegen")
var launchDarklyLibrary = "ldclient-node";

/** Assumptions that would mess us up **/
//  * Library and client variables are in every file - could be imported somehow

//parseCode("test.js", "new-search-bar"); 

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

function parseCode(filePath, featureKey, discardFeature) {

	this.filePath = filePath;

	fs.readFile(filePath, (err, file) => {
 		if (err) throw err;

		this.AST = esprima.parse(file); 


		//this.libraryVarName = getLibraryVarName();
		//this.clientVarName = getClientVarName();

		console.log(this.libraryVarName);
		console.log(this.clientVarName);

		var featureCodeLeft = false; //Other feature flags are still here (used for removing library code
		_.each(getClientOnceNodes(), function(onceNode) {
			_.each(getClientVariationNodes(onceNode), function(variationNode) {
				console.log(variationNode);
				var featureName = variationNode.getFlagName();
				if(featureName == featureKey) {
					//Neeed to get flagBool somehow. For now, hardcode for testing
					var flagBool = "showFeature"; //TODO!!!
					//removeFlagCode(flagBool, variationNode, onceNode);
				} else {
					featureCodeLeft = true;
				}
			});
		});
		if(!featureCodeLeft) {
			deleteLDCode();
		}
		saveFile();

	});
}

function saveFile() {

	var wstream = fs.createWriteStream('testModified.js'); //TODO: use filename
	wstream.write(escodegen.generate(this.AST));
	wstream.end();
}

function getLibraryVarName() {
	libraryVarName = null;
	var tempAST = this.AST;
	walk.walkAddParent(tempAST, function(node){
		if(node.type == 'Literal' && node.value == launchDarklyLibrary) {
			while(node.parent){
				if(node.type == "VariableDeclarator") {
					libraryVarName =  node.id.name;
					break;
				}
				node = node.parent;
			}
		}
	});
	return libraryVarName;
}

function getClientVarName() {
	clientVarName = null;
	var that = this;
	var tempAST = this.AST;
	walk.walkAddParent(tempAST, function(node){
		if(node.object && node.object.name == that.libraryVarName 
			&& node.property && node.property.name == "init") {
			while(node.parent){
				if(node.type == "VariableDeclarator") {
					clientVarName =  node.id.name;
					break;
				}
				node = node.parent;
			}
		}
	});
	return clientVarName;
}

// Gets outer most layer of feature flag code (client.once)
function getClientOnceNodes() {
	var onceNodes = [];
 	walk(this.AST, function(subNode) {
 		//console.log(subNode);
 		if(isOnceNode(subNode, this.clientVarName)) { 
 			onceNodes.push(new OnceNode(subNode));
 		}
 	});
 	console.log(onceNodes);
 	return onceNodes;
}

// Gets feature flag layer of all feature flag code (client.variation)
function getClientVariationNodes(onceNode) {
	var variationNodes = [];
 	walk(onceNode, function(subNode) {
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
	walk(variationNode, function(subNode) {
		// TODO: what if do !showFeature
		if(subNode.type == "IfStatement" && subNode.test.name == flagBool) {
			//Move contents of if outside of if
			//Parser.attachBefore(subNode, Parser.toProgram(subNode.consequent.body));
			var insideIf = Parser.toProgram(subNode);
			//Parser.detach(subNode);
			console.log(onceNode.range);
			console.log(insideIf);
			//Parser.injectCode(this.AST, onceNode.range, subNode);
			//console.log(Parser.getCode(onceNode));
			Parser.attachAfterComment(this.AST, "attachafterme", Parser.toProgram(subNode))
		}
	});

	//TODO: handle case where more than one flag in once node
	var codeToKeep = variationNode.getCallbackContent();
	//Parser.attachBefore(onceNode, Parser.toProgram(codeToKeep));
	//Parser.detach(onceNode);
	//Parser.attachBefore(onceNode, Parser.toProgram(onceNode));
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
