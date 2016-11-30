
var token = "token " + "a13436a61ce97c77629c82f789d49313002e9cc5";
var userId = "flaglag";
var testRepo = "TestCodeFlagBot";
var cloneTo = "../parser/Repo";
var exec = require('child_process').exec;


module.exports = {

	/* Get - Clone the repository */
	cloneRepo : function(callback){
		exec("sh before.sh " + cloneTo, callback);
	},

	/* Push changes */
	pushChanges : function(callback) {	
		exec("sh after.sh " + cloneTo, callback);
	}

}

/****** Testing *******/
module.exports.cloneRepo(function(err) {
	console.log(err);
	console.log("repo cloned");
});

module.exports.pushChanges(function() {
	console.log("repo pushed");
});
