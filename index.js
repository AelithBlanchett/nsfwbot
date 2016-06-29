var FChatLib = require('fchatlib');
var config = require(__dirname+'/config/config.js');
var myFchatBot = new FChatLib(config);
console.log("Bot successfully started");