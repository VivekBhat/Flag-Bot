
var token = "token " + "a13436a61ce97c77629c82f789d49313002e9cc5";
var userId = "flaglag";
var testRepo = "TestCodeFlagBot";
var cloneTo = "../parser/Repo";
var exec = require('child_process').exec;
var slash = require('slash');
var dirname = slash(__dirname); //current directory

module.exports = {

	/* Get - Clone the repository */
	cloneRepo : function(){
		return new Promise ( function(resolve, reject) { 
			exec("sh " + dirname + "/before.sh " + cloneTo, function(err) {
				if(err) {
					reject();
				}
				resolve();
			});
		});
	},

	/* Push changes */
	pushChanges : function() {	
		return new Promise ( function(resolve, reject) { 
			exec("sh " + dirname + "/after.sh " + cloneTo, function(err) {
				if(err) {
					reject();
				}
				resolve();
			});
		});
	}

}
