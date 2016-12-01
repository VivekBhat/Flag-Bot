var _ = require("underscore");
var fs = require("fs");
var esprima = require("esprima");
var walk = require("esprima-walk");
var escodegen = require("escodegen")
var estraverse = require('estraverse');
var launchDarklyLibrary = "ldclient-node";
var fs = require("fs");
var utils = require('util')
var execSync = require('child_process').execSync;
var slash = require('slash');
var gitFunctions = require('../git/gitBot.js');
var LineReaderSync = require("line-reader-sync");

var mypath = slash(__dirname); //current directory
var gitRepo = mypath + "/" + "Repo"; //directory of git repo
var dirsToExclude = ["node_modules"];

var changesMade = false;

/** Assumptions **/
//  * Library and client variables are in every file
//  * LD Code is inside client.once and client.variation.

/**************************************************/
/* Public
/**************************************************/
module.exports = {
	deleteFeatureFlag: function(featureKey, discardFeature) {

		return new Promise ( function(resolve, reject) { 

			gitFunctions.cloneRepo().then(function() {

				// executes `find for all .js files`
				console.log(mypath);
				execSync("find " + gitRepo + " -type f -name '*.js' > " + mypath + "/output.txt"); 

				lrs = new LineReaderSync(mypath + "/output.txt");
				var files = lrs.toLines();
				if(files.length == 0) {
					reject("No files were found.");
					return;
				}

				for(var f in files) {
					var file = files[f];
					// Leave out files if should be left out (eg library files)
					var excluded = false;
					for(var d in dirsToExclude) {
						var excludedDir = dirsToExclude[d];
						if(file.includes("/" + excludedDir + "/")) {
							excluded = true;
							console.log("Not parsing file: " + file);
							break;
						}
					}
					// Parse code
					if(!excluded) {
						parseCode(file, featureKey, discardFeature);
					}
				}

				if(changesMade) {
					gitFunctions.pushChanges().then(function() {
						console.log("Pushed changes!");
						changesMade = false; //reset for next time;
						resolve();
					}).catch(function() {
						reject("Failed to push changes.");
					});
				} else {
					reject("No feature flag code was found for key: " + featureKey + ".");
				}
						
			});
		});
	}
} 

//Used for testing
//parseCode("TestRepo/test.js","new-search-bar",false);
//module.exports.deleteFeatureFlag("new-search-bar",false);

/**************************************************/
/* Private
/**************************************************/

function parseCode(filePath, featureKey, discardFeature) {

	var file = fs.readFileSync(filePath);
	if(file != null) {

		this.AST = esprima.parse(file); 
		this.libraryVarName = getLibraryVarName();
		this.clientVarName = getClientVarName();

		// Return if either var name is null
		if (!this.libraryVarName || !this.clientVarName) {
			console.log(filePath);
			console.log("LD variable not found. Will not parse.");
			return;
		}

		var LDCodeLeft = false; //Other feature flag code is still in file
		_.each(getClientOnceNodes(), function(onceNode) {
			var featureCodeLeft = false;
			_.each(getClientVariationNodes(onceNode), function(variationNode) {
				var featureName = variationNode.getFlagName();
				if(featureName == featureKey) {
					removeFlagCode(variationNode, discardFeature);
				} else {
					featureCodeLeft = true; // code in once node
					LDCodeLeft = true; // code in whole file
				}
			});
			// Delete once node if no longer contains variation nodes
			if(!featureCodeLeft) 
				onceNode.delete();
		});
		
		if(!LDCodeLeft) {
			console.log("Deleting LD code");
			deleteLDCode();
		}
		saveFile(filePath);
	}
}

function saveFile(filePath) {
	if(changesMade) {
		console.log("saving file: " + filePath);
		var savename = filePath.replace(/(\.[\w\d_-]+)$/i, 'modified$1');
		var wstream = fs.createWriteStream(savename);
		wstream.write(escodegen.generate(this.AST));
		wstream.end();
	}
}

function getLibraryVarName() {
	libraryVarName = null;
	var tempAST = JSON.parse(JSON.stringify(this.AST));
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
	var tempAST = JSON.parse(JSON.stringify(this.AST));
	walk.walkAddParent(tempAST, function(node){
		if(node.object && node.object.name == that.libraryVarName 
			&& node.property && node.property.name == "init") {
			while(node.parent){
				if(node.type == "VariableDeclarator") {
					that.clientDeclarator = node; //Used to delete it later
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
 		if(isOnceNode(subNode, this.clientVarName)) { 
 			onceNodes.push(new OnceNode(subNode));
 		}
 	});
 	return onceNodes;
}

// Gets feature flag layer of all feature flag code (client.variation)
function getClientVariationNodes(onceNode) {
	var variationNodes = [];
 	estraverse.traverse(onceNode, {
		enter: function (subNode) {
			if(isVariationNode(subNode, this.clientVarName)) { 
	 			variationNodes.push(new VariationNode(subNode));
	 		}
		}
	});
 	return variationNodes;
}

function isClientCall(node) {
	if(node.expression.callee.object.name == this.clientVarName) {
		console.log("Found client call");
		return true;
	}
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

function removeFlagCode(variationNode, discardFeature) {
	changesMade = true;
	if(!discardFeature) {
		variationNode.replaceWithNewFeature(this.AST);
	} else {
		variationNode.replaceWithOldFeature(this.AST);
	}
}

//Deletes extra LD code like library call and client variable
function deleteLDCode() {
	changesMade = true;
	var that = this;
	estraverse.traverse(this.AST, {
		enter: function (innerNode) {
			//TODO: Maybe parent param is breaking it?
			if(_.isEqual(that.clientDeclarator,innerNode)){
				console.log("Delete client declarator");
				return this.remove(); 
			}
		}
	});
}

/********************* Node Objects ***********************/

function OnceNode(node) {	

	node.delete = function() {
		changesMade = true;
		estraverse.replace(this.AST, {
			enter: function (innerNode) {
				if(_.isEqual(node,innerNode)){
					console.log("Found once node to delete.");
					return node.getCallbackContent(); 
				}
			}
		});
	}

	node.getCallbackContent = function(){
		//return node.expression.arguments[3].body.body;
		var functionContent = null;
		estraverse.traverse(node, {
			enter: function (innerNode) {
				if(innerNode.type == "FunctionExpression"){
					estraverse.traverse(innerNode, {
						enter: function (innerInnerNode) {
							if(innerInnerNode.type == "BlockStatement"){
								if( functionContent == null) { // Want first function
									functionContent = innerInnerNode;
								}
							}
						}
					});
				}
			}
		});
		return functionContent;
	}

	return node;
}

function VariationNode(node) {

	node.getFlagName = function(){
		return node.expression.arguments[0].value;
	}

	node.getFlagBool = function(){
		var flagBool = null;
		var foundFirst = false;
		estraverse.traverse(node, {
			enter: function (innerNode) {
				if(innerNode.type == "FunctionExpression"){
					if(!foundFirst) {
						flagBool = innerNode.params[1].name;
					}						
					foundFirst = true;
				}
			}
		});
		return flagBool;
	}

	node.getCallbackContent = function(){
		//return node.expression.arguments[3].body.body;
		var functionContent = null;
		estraverse.traverse(node, {
			enter: function (innerNode) {
				if(innerNode.type == "FunctionExpression"){
					estraverse.traverse(innerNode, {
						enter: function (innerInnerNode) {
							if(innerInnerNode.type == "BlockStatement"){
								if( functionContent == null) { // Want first function
									functionContent = innerInnerNode;
								}
							}
						}
					});
				}
			}
		});
		return functionContent;
	}

	node.replaceWithOldFeature = function(ast){
		node.replace(ast, false);
	}

	node.replaceWithNewFeature = function(ast) {
		node.replace(ast, true);
	}

	//TODO: only supports if(featureBool) (not !featureBool or other variations)
	node.getNewFeatureCode = function() {
		var newFeatureNodes = [];
		estraverse.traverse(node.getCallbackContent(), {
			enter: function(innerNode) {
				if(node.isFeatureIfStatement(innerNode)) {
					newFeatureNodes.push(innerNode.consequent);
				}
			}
		});
		return newFeatureNodes;
	}

	node.getOldCode = function() {
		var oldNodes = [];
		estraverse.traverse(node.getCallbackContent(), {
			enter: function(innerNode) {
				if(node.isFeatureIfStatement(innerNode)) {
					oldNodes.push(innerNode.alternate);
				}
			}
		});
		return oldNodes;
	}

	node.isFeatureIfStatement = function(innerNode) {
		if(innerNode.type == "IfStatement" && innerNode.test.name == node.getFlagBool()) {
			return true;
		}
	}

	node.replace = function(ast, keepFeature){
		changesMade = true;
		//Add code from within
		estraverse.replace(ast, {
			enter: function (innerNode) {
				if(_.isEqual(node,innerNode)){
					//return this.remove();
					var codeToKeep = [];
					if(keepFeature) { codeToKeep = node.getNewFeatureCode(); } 
					else { codeToKeep = node.getOldCode(); }
					node.expression.arguments[3].body.body = node.expression.arguments[3].body.body.concat(codeToKeep);

					// Remove flag code (already added what we wanted to keep)
					// Remove client code
					estraverse.replace(node, {
						enter: function (innerInnerNode) {
							if(node.isFeatureIfStatement(innerInnerNode)) {
								return this.remove();
							}
							/*if(isClientCall(innerInnerNode)) {
								return this.remove(); //TODO: not removing
							}*/
						}
					});
					return node.getCallbackContent(); 
				}
			}
		});
	}

	return node;
}


