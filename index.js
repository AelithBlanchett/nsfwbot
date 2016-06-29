var FChatLib = require('fchatlib');
var config = require(__dirname+'/config/config.js');
var myFchatBot = new FChatLib(); //it auto-loads the NSFW.js plugin, and the config has been made private.
console.log("Bot successfully started");