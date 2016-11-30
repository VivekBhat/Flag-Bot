
var token = "token " + "a13436a61ce97c77629c82f789d49313002e9cc5";
var userId = "flaglag";
var testRepo = "TestCodeFlagBot";
var cloneTo = "../parser/Repo";

/****** Testing *******/
cloneRepo(function() {
	console.log("repo cloned");
});

pushChanges(function() {
	console.log("repo cloned");
});

module.exports = {

	/* Get - Clone the repository */
	cloneRepo : function(callback){
		exec("./b " + cloneTo, callback());
	}

	/* Push changes */
	pushChanges : function(callback) {	
		exec("./b " + cloneTo, callback());
	}

}
