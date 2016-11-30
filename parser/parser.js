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
} 

/**************************************************/
/* Private
/**************************************************/

function parseCode(filePath, featureKey, discardFeature) {

	filePath = "test.js";

	this.filePath = filePath;

	fs.readFile(filePath, (err, file) => {
 		if (err) throw err;

		this.AST = esprima.parse(file); 
		this.libraryVarName = getLibraryVarName();
		this.clientVarName = getClientVarName();

		// Return if either var name is null
		if (!this.libraryVarName || !this.clientVarName) {
			console.log("LD variable not found.");
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

// Assumes that you have code format if(showFeature) and else TODO
function removeFlagCode(variationNode, discardFeature) {
	if(!discardFeature) {
		variationNode.replaceWithNewFeature(this.AST);
	} else {
		variationNode.replaceWithOldFeature(this.AST);
	}
}

//Deletes extra LD code like library call and client variable
function deleteLDCode() {
	//TODO
}

/********************* Node Objects ***********************/

function OnceNode(node) {	

	node.delete = function() {
		estraverse.replace(node, {
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
								return this.remove();
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


