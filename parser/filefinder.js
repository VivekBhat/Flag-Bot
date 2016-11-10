var fs = require("fs");
var Parser = require("./parser.js");
var utils = require('util')
var exec = require('child_process').exec;


// executes `find for all .js files`
child = exec("find . -type f -name '*.js' > output.txt");


var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('output.txt')
});


lineReader.on('line', function (line) {
   
    //console.log('Line from file:', line);

   // for each line - path to a js file call - call the parseCode here!
  //Parser.testCallFunction();
  

});