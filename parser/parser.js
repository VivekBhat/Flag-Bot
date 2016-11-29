var _ = require("underscore");
var fs = require("fs");
var esprima = require("esprima");
var walk = require("esprima-walk");
var escodegen = require("escodegen")
var estraverse = require('estraverse');
var launchDarklyLibrary = "ldclient-node";

/** Assumptions that would mess us up **/
//  * Library and client variables are in every file - could be imported somehow

//parseCode("test.js", "new-search-bar", false); 

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
		this.libraryVarName = getLibraryVarName();
		this.clientVarName = getClientVarName();

		var featureCodeLeft = false; //Other feature flags are still here (used for removing library code
		_.each(getClientOnceNodes(), function(onceNode) {
			_.each(getClientVariationNodes(onceNode), function(variationNode) {
				var featureName = variationNode.getFlagName();
				if(featureName == featureKey) {
					removeFlagCode(onceNode, variationNode, discardFeature);
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

//TODO: doesn't currently save comments...
function saveFile() {
	var wstream = fs.createWriteStream('testModified.js'); //TODO: use filename
	wstream.write(escodegen.generate(this.AST));
	wstream.end();
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
 	/*walk(onceNode, function(subNode) {
 		if(isVariationNode(subNode, this.clientVarName)) { 
 			variationNodes.push(new VariationNode(subNode));
 		}
 	}.bind(this));*/

 	estraverse.traverse(onceNode, {
		enter: function (subNode) {
			if(isVariationNode(subNode, this.clientVarName)) { 
	 			variationNodes.push(new VariationNode(subNode));
	 		}
		}
	});
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

// Assumes that you have code format if(showFeature) and else
// TODO: support all code structures
// TODO: handle case where more than one flag in once node
function removeFlagCode(onceNode, variationNode, discardFeature) {
	var that = this;
	var flagBool = onceNode.getFlagBool();
	walk(variationNode, function(node) {
		//TODO: REMOVE!! Not necessary anymore
		if(node.type == "IfStatement" && node.test.name == flagBool) {
			if(!discardFeature) {
				//Move contents of if outside of if
				variationNode.replaceWithNewFeature(that.AST);
			} else {
				//Move contents of if outside of if
				variationNode.replaceWithOldFeature(that.AST);
			}
		}
	});

	var codeToKeep = variationNode.getCallbackContent();}

function deleteLDCode() {
	//TODO
}

/********************* Node Objects ***********************/

function OnceNode(node) {

	//TODO
	node.getFlagBool = function(){
		return "showFeature";
		var flagBool = null;
	 	walk(node, function(subNode) {
	 		if(subNode) {
	 			//todo
	 		}
	 	}.bind(this));
	 	return flagbool;
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
				if(innerNode.type == "IfStatement" && innerNode.test.name == node.getFlagBool()) {
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
				if(innerNode.type == "IfStatement" && innerNode.test.name == node.getFlagBool()) {
					oldNodes.push(innerNode.alternate);
				}
			}
		});
		return oldNodes;
	}

	node.replace = function(ast, keepFeature){
		estraverse.replace(ast, {
			enter: function (innerNode) {
				if(_.isEqual(node,innerNode)){
					//return this.remove();
					var codeToKeep = [];
					if(keepFeature) {
						codeToKeep = node.getNewFeatureCode();
					} else {
						codeToKeep = node.getOldCode();
					}
					node.expression.arguments[3].body.body = codeToKeep;
					return node.getCallbackContent();
				}
			}
		});
	}


	return node;
}


