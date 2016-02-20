var FChatLib = require('fchatlib');
var myFchatBot = new FChatLib(__dirname+'/config/config.js'); //it auto-loads the NSFW.js plugin, and the config has been made private.
myFchatBot.connect();
console.log("Bot successfully started");