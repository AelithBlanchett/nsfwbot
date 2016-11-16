"use strict";
var debug = false; //2.0
var _this;
var didyoumean = require('didyoumean');
didyoumean.caseSensitive = true;
var redis = require("redis");
var client = redis.createClient(6379, "127.0.0.1");

var CommandHandler = (function () {
    function CommandHandler(fChatLib, chan) {
        this.fChatLibInstance = fChatLib;
        this.channel = chan;
        _this = this;
    }

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });

    CommandHandler.prototype.hp = function () {
        broadcastCombatInfo();
    };
    CommandHandler.prototype.stamina = CommandHandler.prototype.hp;
    CommandHandler.prototype.status = CommandHandler.prototype.stamina;
    CommandHandler.prototype.current = CommandHandler.prototype.status;

    CommandHandler.prototype.version = function (args, data) {
        _this.fChatLibInstance.sendMessage("I'm Miss_Spencer, version 2.1.1 beta", _this.channel);
    };

    CommandHandler.prototype.triggerDebug = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            debug = !debug;
            _this.fChatLibInstance.sendMessage("Debug: "+debug, _this.channel);
        }
    };

    CommandHandler.prototype.sextoys = function (args, data) {
        _this.fChatLibInstance.sendMessage("Here, take this [b]" + getRandomSextoy() + "[/b]!", _this.channel);
    };
    CommandHandler.prototype.toys = CommandHandler.prototype.sextoys;

    CommandHandler.prototype.setFight = function(args,data){ //debug
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            if(!checkIfFightIsGoingOn()){
                _this.fChatLibInstance.sendMessage("There isn't a fight going on right now.", _this.channel);
                return;
            }
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            // Unlike !set, !setFight does accept hp and lust to mean the fight's hp and lust.
            var valid_stats = ['maxLust', 'maxHp', 'endurance', 'expertise', 'agility', 'toughness', 'determination', 'strength', 'hp', 'lust'];
            var correction = didyoumean(result[0], valid_stats);
            if(correction != result[0]) {
                if(correction === null) {
                    _this.fChatLibInstance.sendMessage("I don't recognise the stat " + result[0] + ", sorry!", _this.channel);
                } else {
                    _this.fChatLibInstance.sendMessage("I don't recognise the stat " + result[0] + ", did you mean " + correction + " instead?", _this.channel);
                }
                
                return;
            }
            
            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && !isNaN(result[2])) {
                client.hgetall(currentFighters[result[2]].character, function (err, char) {
                    if (char != null) {
                        currentFighters[result[2]][result[0]] = parseInt(result[1]);
                        client.hmset(char.character, char);
                        _this.fChatLibInstance.sendMessage("Succesfully set the "+result[0]+" to "+parseInt(result[1]) + " for the current fight.", _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
                    }
                });
            }
            else {
                _this.fChatLibInstance.sendMessage("Invalid syntax. Correct is: !setFight stat amount turn_number. Example: !setFight lust 10 0", _this.channel);
            }
        }
        else{
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    CommandHandler.prototype.set = function(args,data){ //debug
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            // Check we even received a valid stat.
            // hp and lust are only valid in setFight, they are not valid here.
            var valid_stats = ['maxLust', 'maxHp', 'endurance', 'expertise', 'agility', 'toughness', 'determination', 'strength', 'experience', 'experienceSpent', 'wins', 'losses'];
            var correction = didyoumean(result[0], valid_stats);
            if(correction != result[0]) {
                if(correction === null) {
                    _this.fChatLibInstance.sendMessage("I don't recognise the stat " + result[0] + ", sorry!", _this.channel);
                } else {
                    _this.fChatLibInstance.sendMessage("I don't recognise the stat " + result[0] + ", did you mean " + correction + " instead?", _this.channel);
                }
                
                return;
            }
            
            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                client.hgetall(result[2], function (err, char) {
                    if (char != null) {
                        char[result[0]] = parseInt(result[1]);
                        client.hmset(char.character, char);
                        _this.fChatLibInstance.sendMessage("Succesfully set the "+result[0]+" to "+parseInt(result[1]), _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
                    }
                });
            }
            else {
                _this.fChatLibInstance.sendMessage("Invalid syntax. Correct is: !set stat amount CHARACTER. Example: !set xp 10 ThatCharacter", _this.channel);
            }
        }
        else{
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    CommandHandler.prototype.forceTurnWin = function(args,data){ //debug
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            currentFighters[currentFight.whoseturn].dice.addTmpMod(100,1);
        }
    };

    CommandHandler.prototype.forceTurnLose = function(args,data){ //debug
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            currentFighters[currentFight.whoseturn].dice.addTmpMod(-100,1);
        }
    };

    CommandHandler.prototype.dbg = function(args,data){
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            client.hgetall('Lustful Aelith', function (err, result) {
                if (result != null) {
                    result.hp = parseInt(result.maxHp);
                    result.maxLust = parseInt(result.maxLust);
                    result.lust = 0;
                    result.orgasms = 0;
                    currentFighters[0] = result;
                    currentFighters[0].dice = new Dice(10);
                    //_this.fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                    client.hgetall("Bondage Wrestling", function (err, result2) {
                        if (result2 != null) {
                            result2.hp = parseInt(result2.maxHp);
                            result2.maxLust = parseInt(result2.maxLust);
                            result2.lust = 0;
                            result2.orgasms = 0;
                            currentFighters[1] = result2;
                            currentFighters[1].dice = new Dice(10);
                            _this.fChatLibInstance.sendMessage(data.character + " accepts the challenge! Let's get it on!", _this.channel);
                            startFight();

                        }
                    });
                }
            });
        }
    };

    CommandHandler.prototype.register = function (args, data) {
        client.hexists(data.character, "character", function (err, reply) {
            if (reply == 0) {
                var statsObj = {};
                statsObj.character = data.character;
                statsObj.strength = 1;
                statsObj.toughness = 1;
                statsObj.determination = 1;
                statsObj.agility = 1;
                statsObj.expertise = 1;
                statsObj.endurance = 1;
                statsObj.maxHp = 10 + parseInt(statsObj.strength) + parseInt(statsObj.determination) + parseInt(statsObj.agility) + parseInt(statsObj.expertise) + parseInt(statsObj.toughness);
                statsObj.maxLust = 14 + (3* parseInt(statsObj.endurance));
                statsObj.wins = 0;
                statsObj.losses = 0;
                statsObj.features = "";
                statsObj.experienceSpent = 0;
                statsObj.experience = 25;
                client.hmset(data.character, statsObj);
                _this.fChatLibInstance.sendMessage("You've been successfully registered as a wrestler " + data.character+ "\nDon't forget to spend your 25 experience points!", _this.channel);
            }
            else {
                _this.fChatLibInstance.sendMessage("You're already registered " + data.character, _this.channel);
            }
        });
    };


    CommandHandler.prototype.wrestle = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                if (currentFighters.length == 0) {
                    result.hp = parseInt(result.maxHp);
                    result.maxLust = parseInt(result.maxLust);
                    result.lust = 0;
                    currentFighters[0] = result;
                    currentFighters[0].dice = new Dice(10);
                    currentFighters[0].ownSubmissiveness = 0;
                    _this.fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?", _this.channel);
                }
                else if (currentFighters.length == 1) {
                    if (currentFighters[0].character != data.character) {
                        result.hp = parseInt(result.maxHp);
                        result.maxLust = parseInt(result.maxLust);
                        result.lust = 0;
                        currentFighters[1] = result;
                        currentFighters[1].dice = new Dice(6);
                        currentFighters[1].ownSubmissiveness = 0;
                        _this.fChatLibInstance.sendMessage(data.character + " accepts the challenge! Let's get it on!", _this.channel);
                        startFight();
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("You can't register twice!", _this.channel);
                    }
                }
                else {
                    _this.fChatLibInstance.sendMessage("Sorry, our two wrestlers are still in the fight!", _this.channel);
                }
            }
            else {
                _this.fChatLibInstance.sendMessage("Apparently, you're not registered yet! Please check the available commands with !help", _this.channel);
            }
        });
    };
    CommandHandler.prototype.ready = CommandHandler.prototype.wrestle;
    CommandHandler.prototype.fight = CommandHandler.prototype.wrestle;

    CommandHandler.prototype.exit = function (args, data) {
        if (currentFighters.length > 0) {
            if ((currentFighters.length > 0 && currentFighters[0] != undefined && currentFighters[0].character == data.character) || (currentFighters.length > 1 && currentFighters[1] != undefined && currentFighters[1].character == data.character)) {
                _this.fChatLibInstance.sendMessage("The fight has been ended.", _this.channel);
                if(currentFighters.length > 1){
                    addExperienceOnPrematureEnd(currentFighters[0].character, currentFight.intMovesCount[0], currentFighters[1].character, currentFight.intMovesCount[1]);
                }
                setTimeout(resetFight(),2500);
            }
            else {
                _this.fChatLibInstance.sendMessage("You are not in a fight.", _this.channel);
            }
        }
        else {
            _this.fChatLibInstance.sendMessage("There isn't any fight going on at the moment.", _this.channel);
        }
    };
    CommandHandler.prototype.leave = CommandHandler.prototype.exit;
    CommandHandler.prototype.leaveFight = CommandHandler.prototype.exit;
    CommandHandler.prototype.forfeit = CommandHandler.prototype.exit;
    CommandHandler.prototype.unready = CommandHandler.prototype.exit;

    CommandHandler.prototype.deleteProfile = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    _this.fChatLibInstance.sendMessage("You can't add remove this profile if it's in a fight.", _this.channel);
                    return;
                }
            }
            client.del(args, function (err, result) {
                if (result == 1) {
                    _this.fChatLibInstance.sendMessage(args + "'s stats have been deleted. Thank you for playing!", _this.channel);
                }
                else {
                    _this.fChatLibInstance.sendMessage("This profile hasn't been found in the database.", _this.channel);
                }
            });
        }
        else {
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    var statsGetter = function(args, data, character){
        client.hgetall(character, function (err, result) {
            if (result != null) {
                var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
                var wins, losses, experience, experienceSpent;
                if(isNaN(stats.wins)){
                    wins = 0;
                }
                else{
                    wins = stats.wins;
                }
                if(isNaN(stats.losses)){
                    losses = 0;
                }
                else{
                    losses = stats.losses;
                }
                if(isNaN(stats.experience)){
                    experience = 0;
                }
                else{
                    experience = stats.experience;
                }
                if(isNaN(stats.experienceSpent)){
                    experienceSpent = 0;
                }
                else{
                    experienceSpent = stats.experienceSpent;
                }
                _this.fChatLibInstance.sendPrivMessage(data.character, "[b]" + stats.character + "[/b]'s stats" + "\n" +
                    "[b][color=red]Strength[/color][/b]:  " + stats.strength + "      " + "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
                    "[b][color=orange]Toughness[/color][/b]:  " + stats.toughness + "      " + "[b][color=pink]Max Lust[/color][/b]: " + stats.maxLust + "\n" +
                    "[b][color=green]Determination[/color][/b]:  " + stats.determination + "\n" +
                    "[b][color=cyan]Agility[/color][/b]:    " + stats.agility + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + wins + " - " + losses + "\n" +
                    "[b][color=purple]Expertise[/color][/b]: " + stats.expertise +  "      " + "[b][color=orange]Experience[/color][/b]: " + experience + "\n" +
                    "[b][color=blue]Endurance[/color][/b]: " + stats.endurance +  "      " + "[b][color=orange]Exp. spent:[/color][/b]: " + experienceSpent + " / "+maxExp+ "\n" + "\n\n" +
                    "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
            }
            else {
                _this.fChatLibInstance.sendPrivMessage(data.character, "You aren't registered yet.");
            }
        });
    };

    CommandHandler.prototype.myStats = function (args, data) {
        statsGetter(args, data, data.character);
    };
    CommandHandler.prototype.stats = CommandHandler.prototype.myStats;

    CommandHandler.prototype.getStats = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            statsGetter(args, data, args);
        }
        else{
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    CommandHandler.prototype.addStat = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                var askedPoint = 0;
                switch (args.toLowerCase()) {
                    case "strength":
                        askedPoint = result.strength = parseInt(result.strength) + 1;
                        break;
                    case "determination":
                        askedPoint = result.determination = parseInt(result.determination) + 1;
                        break;
                    case "agility":
                        askedPoint = result.agility = parseInt(result.agility) + 1;
                        break;
                    case "expertise":
                        askedPoint = result.expertise = parseInt(result.expertise) + 1;
                        break;
                    case "endurance":
                        askedPoint = result.endurance = parseInt(result.endurance) + 1;
                        break;
                    case "toughness":
                        askedPoint = result.toughness = parseInt(result.toughness) + 1;
                        break;
                    default:
                        _this.fChatLibInstance.sendMessage("Unknown stat. Please check your syntax. Example: !addStat endurance", _this.channel);
                        return;
                        break;
                }
                var expNeeded = parseInt(5+(2*(askedPoint-2)));
                var intExpAfterSpend = parseInt(result.experience) - expNeeded;
                var intExpSpentAfterSpend = parseInt(result.experienceSpent)+expNeeded;
                if(askedPoint > 6){
                    _this.fChatLibInstance.sendMessage("You can't go over 6 stat points.", _this.channel);
                    return;
                }
                if(intExpAfterSpend < 0){
                    _this.fChatLibInstance.sendMessage("You don't have enough experience points for that. ("+expNeeded+" needed)", _this.channel);
                    return;
                }
                if(intExpSpentAfterSpend > maxExp){
                    _this.fChatLibInstance.sendMessage("This stat augmentation reaches the maximum experience amount a player can spend. ("+intExpSpentAfterSpend+" but the limit is "+maxExp+")", _this.channel);
                    return;
                }

                result.experience = parseInt(result.experience) - expNeeded;
                result.experienceSpent = parseInt(result.experienceSpent) + expNeeded;
                result.maxHp = 10 + parseInt(result.strength) + parseInt(result.determination) + parseInt(result.agility) + parseInt(result.expertise) + parseInt(result.toughness);
                result.maxLust = 14 + (3* parseInt(result.endurance));
                client.hmset(result.character, result);
                _this.fChatLibInstance.sendMessage("Succesfully added your new point with a total cost of "+expNeeded+ " XP points.", _this.channel);
            }
            else {
                _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
            }
        });
    };

    CommandHandler.prototype.addStatOP = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                _this.fChatLibInstance.sendMessage("Will add " + parseInt(result[1]) + " points of " + result[0] + " to " + result[2], _this.channel);
                var newStats = {
                    strength: 0,
                    agility: 0,
                    expertise: 0,
                    endurance: 0,
                    toughness: 0,
                    determination: 0,
                    character: result[2]
                };
                switch (result[0].toLowerCase()) {
                    case "strength":
                        newStats.strength = parseInt(result[1]);
                        break;
                    case "determination":
                        newStats.determination = parseInt(result[1]);
                        break;
                    case "agility":
                        newStats.agility = parseInt(result[1]);
                        break;
                    case "expertise":
                        newStats.expertise = parseInt(result[1]);
                        break;
                    case "endurance":
                        newStats.endurance = parseInt(result[1]);
                        break;
                    case "toughness":
                        newStats.toughness = parseInt(result[1]);
                        break;
                }
                client.hgetall(newStats.character, function (err, result) {
                    if (result != null) {
                        result.strength = parseInt(result.strength) + newStats.strength;
                        result.determination = parseInt(result.determination) + newStats.determination;
                        result.agility = parseInt(result.agility) + newStats.agility;
                        result.expertise = parseInt(result.expertise) + newStats.expertise;
                        result.endurance = parseInt(result.endurance) + newStats.endurance;
                        result.toughness = parseInt(result.toughness) + newStats.toughness;
                        result.maxHp = 10 + parseInt(result.strength) + parseInt(result.determination) + parseInt(result.agility) + parseInt(result.expertise) + parseInt(result.toughness);
                        result.maxLust = 14 + (3* parseInt(result.endurance));
                        client.hmset(newStats.character, result);
                        _this.fChatLibInstance.sendMessage("Succesfully added the new points!", _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
                    }
                });
            }
            else {
                _this.fChatLibInstance.sendMessage("Invalid syntax. Correct is: !addStats STAT X CHARACTER. Example: !addStats Strength 1 ThatCharacter", _this.channel);
            }

        }
    };

    CommandHandler.prototype.damageOutputs = function (args, data) {
        if (checkIfFightIsGoingOn() && data.character == currentFighters[currentFight.whoseturn].character) {
            var strResult = attackPrepare("brawl", "light", true);
            strResult += attackPrepare("brawl", "medium", true);
            strResult += attackPrepare("brawl", "heavy", true);
            strResult += attackPrepare("submission", "light", true);
            strResult += attackPrepare("submission", "medium", true);
            strResult += attackPrepare("submission", "heavy", true);
            strResult += attackPrepare("highflyer", "light", true);
            strResult += attackPrepare("highflyer", "medium", true);
            strResult += attackPrepare("highflyer", "heavy", true);
            strResult += attackPrepare("martial", "light", true);
            strResult += attackPrepare("martial", "medium", true);
            strResult += attackPrepare("martial", "heavy", true);
            strResult += attackPrepare("sexual", "light", true);
            strResult += attackPrepare("sexual", "medium", true);
            strResult += attackPrepare("sexual", "heavy", true);
            strResult += attackPrepare("sexualhold", "light", true);
            strResult += attackPrepare("sexualhold", "medium", true);
            strResult += attackPrepare("sexualhold", "heavy", true);
            strResult += attackPrepare("humiliation", "light", true);
            strResult += attackPrepare("humiliation", "medium", true);
            strResult += attackPrepare("humiliation", "heavy", true);
            _this.fChatLibInstance.sendPrivMessage(data.character, strResult);
        }
        else{
            _this.fChatLibInstance.sendMessage("You can only check your possible damage output during your turn in a match.", _this.channel);
        }
    };

    CommandHandler.prototype.reset = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            if (checkIfFightIsGoingOn()) {
                resetFight();
                _this.fChatLibInstance.sendMessage("The ring has been cleared.", _this.channel);
            }
            else {
                _this.fChatLibInstance.sendMessage("The ring isn't occupied.", _this.channel);
            }
        }
        else {
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    CommandHandler.prototype.removeStats = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                _this.fChatLibInstance.sendMessage("Will remove " + parseInt(result[1]) + " points of " + result[0] + " to " + result[2], _this.channel);
                var newStats = {
                    strength: 0,
                    determination: 0,
                    agility: 0,
                    expertise: 0,
                    endurance: 0,
                    toughness: 0,
                    character: result[2]
                };
                switch (result[0].toLowerCase()) {
                    case "strength":
                        newStats.strength = parseInt(result[1]);
                        break;
                    case "determination":
                        newStats.determination = parseInt(result[1]);
                        break;
                    case "agility":
                        newStats.agility = parseInt(result[1]);
                        break;
                    case "expertise":
                        newStats.expertise = parseInt(result[1]);
                        break;
                    case "endurance":
                        newStats.endurance = parseInt(result[1]);
                        break;
                    case "toughness":
                        newStats.toughness = parseInt(result[1]);
                        break;
                }
                client.hgetall(newStats.character, function (err, result) {
                    if (result != null) {
                        result.strength = parseInt(result.strength) - newStats.strength;
                        result.determination = parseInt(result.determination) - newStats.determination;
                        result.agility = parseInt(result.agility) - newStats.agility;
                        result.expertise = parseInt(result.expertise) - newStats.expertise;
                        result.endurance = parseInt(result.endurance) - newStats.endurance;
                        result.toughness = parseInt(result.toughness) - newStats.toughness;
                        result.maxHp = 10 + parseInt(result.strength) + parseInt(result.determination) + parseInt(result.agility) + parseInt(result.expertise) + parseInt(result.toughness);
                        result.maxLust = 14 + (3* parseInt(result.endurance));
                        client.hmset(newStats.character, result);
                        _this.fChatLibInstance.sendMessage("Succesfully removed the points!", _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
                    }
                });
            }
            else {
                _this.fChatLibInstance.sendMessage("Invalid syntax. Correct is: !removeStats STAT X CHARACTER. Example: !removeStats Strength 1 ThatCharacter", _this.channel);
            }

        }
    };



    CommandHandler.prototype.addFeature = function (args, data) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    _this.fChatLibInstance.sendMessage("You can't add a feature if you're in a fight.", _this.channel);
                    return;
                }
            }
            var idFeature = findItemIdByTitle(features, args);
            if (idFeature != -1) {
                client.hgetall(data.character, function (err, result) {
                    if (result != null) {
                        var currentFeatures = parseStringToIntArray(result.features);
                        if (currentFeatures.length < 2) {
                            if (currentFeatures.indexOf(idFeature) == -1) {
                                if (features[idFeature].incompatibility != undefined) {
                                    if (currentFeatures.indexOf(features[idFeature].incompatibility) != -1) {
                                        _this.fChatLibInstance.sendMessage("You cannot add this feature if you've already got [b]" + features[features[idFeature].incompatibility].title + "[/b]", _this.channel);
                                        return;
                                    }
                                }
                                if (idFeature == 0) {
                                    result.endurance = 1;
                                }
                                currentFeatures.push(idFeature);
                                result.features = currentFeatures.toString();
                                client.hmset(data.character, result);
                                _this.fChatLibInstance.sendMessage("You've successfully added the [b]" + features[idFeature].title + "[/b] perk.", _this.channel);
                                return;
                            }
                            _this.fChatLibInstance.sendMessage("You already have the [b]" + features[idFeature].title + "[/b] perk.", _this.channel);
                            return;
                        }
                        _this.fChatLibInstance.sendMessage("You can't have more than 2 features.", _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure you're registered?", _this.channel);
                    }
                });
            }
            else {
                _this.fChatLibInstance.sendMessage("This feature has not been found. Check the spelling.", _this.channel);
            }
        }
        else{
            _this.fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !addFeature Cum Slut\nAvailable moves: "+getAllItemsTitleInArray(features), _this.channel);
        }
    };

    CommandHandler.prototype.removeFeatures = function (args, data) {
        if (_this.fChatLibInstance.isUserChatOP(data.character, _this.channel)) {
            if (args.length > 0) {
                client.hgetall(args, function (err, result) {
                    if (result != null) {
                        result.features = [];
                        client.hmset(args, result);
                        _this.fChatLibInstance.sendMessage("You've successfully removed all the features from "+args, _this.channel);
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("Are you sure this user is registered?", _this.channel);
                    }
                });
            }
            else{
                _this.fChatLibInstance.sendMessage("Correct syntax: !removeFeatures user", _this.channel);
            }
        }
        else {
            _this.fChatLibInstance.sendMessage("You don't have sufficient rights.", _this.channel);
        }
    };

    CommandHandler.prototype.resetProfileStats = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                if (parseInt(result.experience) + parseInt(result.experienceSpent) < 75) {
                    _this.fChatLibInstance.sendMessage("You haven't gained 75 points of XP yet to be able to reset your stats.", _this.channel);
                    return;
                }
                result.strength = 1;
                result.agility = 1;
                result.determination = 1;
                result.toughness = 1;
                result.expertise = 1;
                result.endurance = 1;
                result.features = [];
                result.experience = 50;
                result.experienceSpent = 0;
                client.hmset(data.character, result);
                _this.fChatLibInstance.sendMessage("You've successfully reset your stats. Don't forget to spend the 50XP!", _this.channel);
            }
            else {
                _this.fChatLibInstance.sendMessage("Are you sure this profile is registered?", _this.channel);
            }
        });
    };

    CommandHandler.prototype.pass = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                currentFight.actionType = "pass";
                currentFight.actionTier = "";
                checkRollWinner(true);
            }
            else {
                _this.fChatLibInstance.sendMessage("It's not your turn yet.", _this.channel);
            }

        }
        else {
            _this.fChatLibInstance.sendMessage("There isn't a match going on at the moment.", _this.channel);
        }
    };
    CommandHandler.prototype.skip = CommandHandler.prototype.pass;

    CommandHandler.prototype.escape = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                if (isInHold()) {
                    currentFight.actionType = "escape";
                    currentFight.actionTier = "";
                    if (currentFight.turn > 0) {
                        rollBoth();
                    }
                }
                else {
                    _this.fChatLibInstance.sendMessage("You're not in a hold, you can't escape the void!", _this.channel);
                }
            }
            else {
                _this.fChatLibInstance.sendMessage("It's not your turn to attack.", _this.channel);
            }

        }
        else {
            _this.fChatLibInstance.sendMessage("There isn't a match going on at the moment.", _this.channel);
        }
    };
    CommandHandler.prototype.escapeHold = CommandHandler.prototype.escape;
    CommandHandler.prototype.e = CommandHandler.prototype.escape;

    CommandHandler.prototype.giveUp = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                if (isInHold()) {
                    if (currentFight.turn > 0) {
                        currentFight.winner = (currentFight.whoseturn == 0 ? 1 : 0);
                        _this.fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " is giving up! It must have been too much to handle!", _this.channel);
                        checkLifePoints();
                    }
                }
                else {
                    _this.fChatLibInstance.sendMessage("You're not in a hold, you can't escape the void!", _this.channel);
                }
            }
            else {
                _this.fChatLibInstance.sendMessage("It's not your turn to attack.", _this.channel);
            }

        }
        else {
            _this.fChatLibInstance.sendMessage("There isn't a match going on at the moment.", _this.channel);
        }
    };
    CommandHandler.prototype.tapout = CommandHandler.prototype.giveUp;
    CommandHandler.prototype.surrender = CommandHandler.prototype.giveUp;
    CommandHandler.prototype.submit = CommandHandler.prototype.giveUp;






    // attacks

    var attack = function(args, data, type) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    if (isInHold()) {
                        _this.fChatLibInstance.sendMessage("You are still in a hold. You can either !escape or !tapout (and lose).", _this.channel);
                        return;
                    }

                    currentFight.actionType = type;
                    currentFight.actionTier = "";
                    currentFight.actionTier = findAttackTier(args);

                    if(currentFight.actionType == "bondage") //then it's maybe a bd attack
                    {
                        currentFight.actionTier = "bondage";
                    }

                    if (currentFight.actionTier != undefined) {
                        if (currentFight.turn > 0) {
                            roll();
                        }
                    }
                    else {
                        _this.fChatLibInstance.sendMessage("This tier has not been found. Check the spelling.", _this.channel);
                    }
                }
                else if (data.character == currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character) {
                    _this.fChatLibInstance.sendMessage("It's not your turn to attack.", _this.channel);
                }
                else {
                    _this.fChatLibInstance.sendMessage("You're not in the fight.", _this.channel);
                }

            }
        }
        else {
            //available commands
            _this.fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !brawl light OR !sexual medium OR !hmove Heavy OR !bondage item", _this.channel);
        }
    };

    CommandHandler.prototype.brawl = function(args,data){
        attack(args, data, "brawl");
    };
    CommandHandler.prototype.hit = CommandHandler.prototype.brawl;


    CommandHandler.prototype.martial = function(args,data){
        attack(args, data, "martial");
    };
    CommandHandler.prototype.acrobat = CommandHandler.prototype.martial;

    CommandHandler.prototype.highflyer = function(args,data){
        attack(args, data, "highflyer");
    };
    CommandHandler.prototype.tackle = CommandHandler.prototype.highflyer;
    CommandHandler.prototype.hf = CommandHandler.prototype.highflyer;
    CommandHandler.prototype.aerial = CommandHandler.prototype.highflyer;


    CommandHandler.prototype.sexual = function(args,data){
        attack(args, data, "sexual");
    };
    CommandHandler.prototype.lust = CommandHandler.prototype.sexual;
    CommandHandler.prototype.s = CommandHandler.prototype.sexual;
    CommandHandler.prototype.sex = CommandHandler.prototype.sexual;
    CommandHandler.prototype.stroke = CommandHandler.prototype.sexual;
    CommandHandler.prototype.fuck = CommandHandler.prototype.sexual;
    CommandHandler.prototype.lick = CommandHandler.prototype.sexual;

    CommandHandler.prototype.sexualhold = function(args,data){
        attack(args, data, "sexualhold");
    };
    CommandHandler.prototype.lusthold = CommandHandler.prototype.sexualhold;
    CommandHandler.prototype.shold = CommandHandler.prototype.sexualhold;
    CommandHandler.prototype.sexhold = CommandHandler.prototype.sexualhold;
    CommandHandler.prototype.strokehold = CommandHandler.prototype.sexualhold;
    CommandHandler.prototype.fuckhold = CommandHandler.prototype.sexualhold;
    CommandHandler.prototype.lickhold = CommandHandler.prototype.sexualhold;


    CommandHandler.prototype.submission = function(args,data){
        attack(args, data, "submission");
    };
    CommandHandler.prototype.grab = CommandHandler.prototype.submission;
    CommandHandler.prototype.hold = CommandHandler.prototype.submission;
    CommandHandler.prototype.grapple = CommandHandler.prototype.submission;
    CommandHandler.prototype.grappling = CommandHandler.prototype.submission;


    CommandHandler.prototype.humiliation = function(args,data){
        attack(args, data, "humiliation");
    };
    CommandHandler.prototype.hmove = CommandHandler.prototype.humiliation;
    CommandHandler.prototype.hummove = CommandHandler.prototype.humiliation;
    CommandHandler.prototype.humiliate = CommandHandler.prototype.humiliation;
    CommandHandler.prototype.humiliatinghold = CommandHandler.prototype.humiliation;
    CommandHandler.prototype.smother = CommandHandler.prototype.humiliation;

    CommandHandler.prototype.bondage = function(args,data){
        attack(args, data, "bondage");
    };
    CommandHandler.prototype.bdsm = CommandHandler.prototype.bondage;
    CommandHandler.prototype.bind = CommandHandler.prototype.bondage;
    CommandHandler.prototype.restrain = CommandHandler.prototype.bondage;
    CommandHandler.prototype.tie = CommandHandler.prototype.bondage;
    CommandHandler.prototype.tieup = CommandHandler.prototype.bondage;
    CommandHandler.prototype.dominate = CommandHandler.prototype.bondage;
    CommandHandler.prototype.tame = CommandHandler.prototype.bondage;
    CommandHandler.prototype.bd = CommandHandler.prototype.bondage;


    return CommandHandler;
}());

module.exports = function (parent, channel) {
    var cmdHandler = new CommandHandler(parent, channel);
    return cmdHandler;
};

var didYouMean = require('didyoumean');

var features = require(__dirname + '/etc/features.js');
var sextoys = require(__dirname + '/etc/sextoys.js');
var classes = require(__dirname + '/etc/classes.js');

var attackTiers = ['light', 'medium', 'heavy'];
var bondageTiers = ['arms', 'torso', 'legs'];

var consts = {};

var currentFighters = [];
var currentFight = {turn: -1, whoseturn: -1, isInit: false, orgasms: 0, winner: -1, currentHold: {}, actionTier: "", actionType: "", dmgHp: 0, dmgLust: 0, actionIsHold: false, diceResult: 0, intMovesCount: [0,0], bothPlayerRoll: 0};
var Dice = require('cappu-dice');
var maxExp = 101;

function beginInitiation(){
    currentFight.turn = 0;
    currentFight.isInit = true;
    currentFight.bothPlayerRoll = true;
    _this.fChatLibInstance.sendMessage("\n[b]Let's start![/b]\n\n[b]" + currentFighters[0].character + "[/b]\n\n[color=red]VS[/color]\n\n[b]" + currentFighters[1].character + "[/b]", _this.channel);
    checkFeaturesInit();
    rollBoth();
}

function rollBoth(){

    currentFight.bothPlayerRoll = true;
    if(holdInPlace()){
        switch(currentFight.currentHold.actionTier){
            case "medium":
                currentFighters[currentFight.currentHold.defender].dice.addTmpMod(parseInt(-1));
                break;
            case "heavy":
                currentFighters[currentFight.currentHold.defender].dice.addTmpMod(parseInt(-2));
                break;
            default:
                break;
        }
    }
    var mods0 = (currentFighters[0].dice.getModsSum() + currentFighters[0].dice.getTmpModsSum());
    var mods1 = (currentFighters[1].dice.getModsSum() + currentFighters[1].dice.getTmpModsSum());
    currentFight.diceResultP1 = currentFighters[0].dice.roll();
    currentFight.diceResultP2 = currentFighters[1].dice.roll();
    //currentFight.diceResultP1 = currentFight.diceResultP2; TO CHECK FOR STACK OVERFLOW
    if(debug)
    {
        currentFight.diceResultP2 = currentFight.diceResultP1;
        debug = false;
    }
    _this.fChatLibInstance.sendMessage("\n[b]" + currentFighters[0].character + "[/b] rolled a [b]" + currentFight.diceResultP1 + "[/b] " + (mods0 != 0 ? "(" + ((mods0 >= 0 ? "+" : "") + mods0 + " applied)") : "" ) + "\n" +
        "[b]" + currentFighters[1].character + "[/b] rolled a [b]" + currentFight.diceResultP2 + "[/b] " + (mods1 != 0 ? "(" + ((mods1 >= 0 ? "+" : "") + mods1 + " applied)") : "" ), _this.channel);
    checkRollWinner();
}

function checkFeaturesInit() {
    var featuresP0 = parseStringToIntArray(currentFighters[0].features);
    var featuresP1 = parseStringToIntArray(currentFighters[1].features);

    var dominated = -1;

    if (featuresP0.indexOf(1) != -1 && featuresP1.indexOf(6) != -1) { //P1 is dom, P2 sub
        currentFighters[1].dice.addMod(parseInt(-2));
        dominated = 1;
    }
    if (featuresP0.indexOf(6) != -1 && featuresP1.indexOf(1) != -1) { //P2 is dom, P1 sub, check the correct Index in features
        currentFighters[0].dice.addMod(parseInt(-2));
        dominated = 0;
    }

    if (currentFight.isInit && dominated > -1) {
        _this.fChatLibInstance.sendMessage("\n[b]" + currentFighters[(dominated == 0 ? 1 : 0)].character + "[/b] really has an imposing dominance!\n[b]" + currentFighters[dominated].character + "[/b] feels a bit scared...", _this.channel);
    }
}

function roll() {
    var mods = 0;
    var diceScore = 0;
    if(currentFight.whoseturn == 0){
        mods = (currentFighters[0].dice.getModsSum() + currentFighters[0].dice.getTmpModsSum());
        diceScore = currentFighters[0].dice.roll();
    }
    else{
        mods = (currentFighters[1].dice.getModsSum() + currentFighters[1].dice.getTmpModsSum());
        diceScore = currentFighters[1].dice.roll();
    }


    var typeUsed1 = "";
    var typeUsed2 = "";
    currentFight.actionIsHold = false;
    currentFight.diceResult = 0;
    switch (currentFight.actionType) {
        case "brawl":
            typeUsed1 = "strength";
            currentFight.diceResult = parseInt(parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + diceScore);
            break;
        case "submission":
            typeUsed1 = "strength";
            typeUsed2 = "agility";
            currentFight.diceResult = parseInt(Math.floor((parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + parseInt(currentFighters[currentFight.whoseturn][typeUsed2])) / 2) + diceScore);
            currentFight.actionIsHold = true;
            break;
        case "highflyer":
            typeUsed1 = "agility";
            currentFight.diceResult = parseInt(parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + diceScore);
            break;
        case "martial":
            typeUsed1 = "agility";
            typeUsed2 = "expertise";
            currentFight.diceResult = parseInt(Math.floor((parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + parseInt(currentFighters[currentFight.whoseturn][typeUsed2])) / 2) + diceScore);
            break;
        case "sexual":
        case "sexualhold":
            typeUsed1 = "expertise";
            currentFight.diceResult = parseInt(parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + diceScore);
            break;
        case "humiliation":
            typeUsed1 = "expertise";
            typeUsed2 = "strength";
            currentFight.diceResult = parseInt(Math.floor((parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + parseInt(currentFighters[currentFight.whoseturn][typeUsed2])) / 2) + diceScore);
            currentFight.actionIsHold = true;
            break;
        case "bondage":
            currentFight.diceResult = diceScore;
            break;
    }
    _this.fChatLibInstance.sendMessage("\n[b]" + currentFighters[currentFight.whoseturn].character + "[/b] rolled a [b]" + currentFight.diceResult + "[/b] " + (mods != 0 ? "(" + ((mods >= 0 ? "+" : "") + mods + " applied)") : "" ), _this.channel);
    checkRollWinner();
}

function checkRollWinner(blnForceSuccess) {
    if(currentFight.bothPlayerRoll){
        currentFight.bothPlayerRoll = false;
        if(currentFight.diceResultP1 == currentFight.diceResultP2){
            rollBoth();
            return;
        }
        var idWinner = (currentFight.diceResultP1 > currentFight.diceResultP2 ? 0 : 1);
        if (currentFight.isInit) {
            currentFight.isInit = false;
            _this.fChatLibInstance.sendMessage("[i]" + currentFighters[idWinner].character + " emotes the attack first.[/i]", _this.channel);
            currentFight.whoseturn = idWinner;
            nextTurn(false);
        }
        else{ //case of both players rolling
            var isPlayerSuccessful = (idWinner == currentFight.currentHold.defender);
            checkRollWinner(isPlayerSuccessful);
        }
    }
    else{
        var success = false;
        switch (currentFight.actionTier) {
            case "light":
                success = currentFight.diceResult >= 4;
                break;
            case "medium":
                success = currentFight.diceResult >= 8;
                break;
            case "heavy":
                success = currentFight.diceResult >= 12;
                break;
            case "bondage":
                success = currentFight.diceResult >= 6;
                break;
            default:
                success = false;
                break;
        }

        //bypass the former check
        if(blnForceSuccess){
            success = true;
        }

        //attack process
        if (success) {
            currentFighters[currentFight.whoseturn].dice.resetTmpMods();
            if (currentFight.actionType == "escape") {
                currentFight.currentHold.turnsLeft = 0;
                currentFight.currentHold.isInfinite = false;
                _this.fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!\nIt's still " + currentFighters[currentFight.whoseturn].character + "'s turn.", _this.channel);
                return;
            }
            else if (currentFight.actionType == "pass") {
                _this.fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has passed this turn.", _this.channel);
            }
            else if( currentFight.actionType == "bondage"){
                currentFight.intMovesCount[currentFight.whoseturn] += 1;
                currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownSubmissiveness++;
                _this.fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + "'s bondage attack has been [color=green][u]successful![/u][/color][/b]", _this.channel);
                if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownSubmissiveness == 5){
                    currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].dice.addMod(-1);
                    _this.fChatLibInstance.sendMessage("[b]" + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s submissiveness is starting to be a problem! -1 to their dice rolls.[/b]", _this.channel);
                }
                else if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownSubmissiveness >= 10){
                    currentFight.winner = currentFight.whoseturn;
                    _this.fChatLibInstance.sendMessage("[b]" + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " is completely bound! The fight is over![/b]", _this.channel);
                    checkLifePoints();
                }
                //else if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownSubmissiveness == 6){
                //    currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].dice.addMod(-1);
                //    _this.fChatLibInstance.sendMessage("[b]" + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " is looking quite helpless like that! Another -1 to their dice rolls![/b]");
                //}

            }
            else {
                _this.fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + "'s attack has [color=green][u]hit![/u][/color][/b]", _this.channel);
                attackPrepare(currentFight.actionType, currentFight.actionTier);
            }
        }
        else {
            missHandler(currentFight.whoseturn);
        }
        if (currentFight.winner != -1) { // FIGHT GETS RESETED BEFORE ANYTHING
            return;
        }
        nextTurn();
    }

}


function missHandler(idPlayer) {
    _this.fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] missed![/i]", _this.channel);
    if (currentFight.actionType == "escape") {
        currentFighters[idPlayer].dice.addTmpMod(parseInt(1))
    }
    currentFighters[idPlayer].dice.addTmpMod(parseInt(1), 3);
    _this.fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] has gotten +1 added to their next dice roll.[/i]", _this.channel);
}

function holdHandler(damageHP, damageLust, isSexual, actionTier) {
    var strAttack = "[b]" + currentFighters[currentFight.whoseturn].character + "[/b] has";

    if (damageHP != undefined || damageLust != undefined) {
        if (currentFight.currentHold == undefined) {
            currentFight.currentHold = {};
        }
        if (currentFight.currentHold.turnsLeft == undefined || isNaN(currentFight.currentHold.turnsLeft) || (!isNaN(currentFight.currentHold.turnsLeft) && parseInt(currentFight.currentHold.turnsLeft) < 0)) {
            currentFight.currentHold.turnsLeft = 0;
        }
        if (currentFight.currentHold.damageHP == undefined || isNaN(currentFight.currentHold.damageHP) || (!isNaN(currentFight.currentHold.damageHP) && parseInt(currentFight.currentHold.damageHP) <= 0)) {
            currentFight.currentHold.damageHP = -1;
        }
        if (currentFight.currentHold.damageLust == undefined || isNaN(currentFight.currentHold.damageLust) || (!isNaN(currentFight.currentHold.damageLust) && parseInt(currentFight.currentHold.damageLust) <= 0)) {
            currentFight.currentHold.damageLust = 0;
        }
        if((currentFight.currentHold.attacker != undefined && currentFight.currentHold.attacker != currentFight.whoseturn) || !holdInPlace()){//reset on turn change
            currentFight.currentHold.turnsLeft = 0;
            currentFight.currentHold.damageHP = -1;
            currentFight.currentHold.damageLust = -1;
            currentFight.currentHold.hpPenalty = 0;
            currentFight.currentHold.lustPenalty = 0;
        }

        var attacker = currentFight.whoseturn;
        var defender = (currentFight.whoseturn == 0 ? 1 : 0);
        var turns = 3; //3 turns by default
        switch(actionTier)
        {
            case "light":
                turns = 3;
                break;
            case "medium":
                turns = 5;
                break;
            case "heavy":
                turns = 7;
                break;
            default:
                turns = 3;
                break;
        }
        currentFight.currentHold.actionTier = actionTier;
        var isInfinite = false;

        var newTurnsLeft = parseInt(currentFight.currentHold.turnsLeft) + parseInt(turns);
        var newDamageHP = parseInt(currentFight.currentHold.damageHP);
        if(damageHP != undefined && damageHP != -1){
            var dmg = parseInt(damageHP);
            if(dmg <= 0){
                dmg = 1;
            }
            if(newDamageHP == -1){
                newDamageHP = 0;
            }
            newDamageHP += dmg;
        }
        var newDamageLust = parseInt(currentFight.currentHold.damageLust);
        if(damageLust != undefined && damageLust != -1){
            var dmg = parseInt(damageLust);
            if(dmg <= 0){
                dmg = 1;
            }
            if(newDamageLust == -1){
                newDamageLust = 0;
            }
            newDamageLust += dmg;
        }

        var holdName = "";

        switch(isSexual){
            case 0:
                holdName= "submission hold";
                break;
            case 1:
                holdName = "sexual hold";
                break;
            case 2:
                holdName = "humiliation hold";
                break;
            default:
                holdName = "unknown hold";
                break;
        }


        currentFight.currentHold = {
            holdName: holdName,
            turnsLeft: newTurnsLeft,
            damageHP: newDamageHP,
            damageLust: newDamageLust,
            attacker: attacker,
            defender: defender,
            isInfinite: isInfinite
        };

        if(isSexual == 0){
            strAttack += " applied a submission hold!";
        }
        else if(isSexual == 1){
            strAttack += " applied a sexual hold!"; //for the future
        }
        else{
            strAttack += " applied a humiliation hold!";
        }

        _this.fChatLibInstance.sendMessage(strAttack, _this.channel);
    }
}

function attackPrepare(actionType, actionId, isSimulation) {
    var typeUsed1 = "";
    var typeUsed2 = "";
    var typeDefender = "";
    var dmgHp = -1;
    var dmgLust = -1;
    var isHold = false;
    var isSexual = 0; // 0 = false, 1 = true, 2 = both
    var divider = 1;
    var minDmg = 1;

    switch (actionType) {
        case "brawl":
            typeUsed1 = "strength";
            typeDefender = "toughness";
            break;
        case "submission":
            typeUsed1 = "strength";
            typeUsed2 = "agility";
            typeDefender = "determination";
            isHold = true;
            break;
        case "highflyer":
            typeUsed1 = "agility";
            typeDefender = "toughness";
            break;
        case "martial":
            typeUsed1 = "agility";
            typeUsed2 = "expertise";
            typeDefender = "toughness";
            break;
        case "sexual":
            typeUsed1 = "expertise";
            typeDefender = "endurance";
            isSexual = 1;
            break;
        case "sexualhold":
            typeUsed1 = "expertise";
            typeDefender = "endurance";
            isSexual = 1;
            isHold = true;
            break;
        case "humiliation":
            typeUsed1 = "expertise";
            typeUsed2 = "strength";
            typeDefender = "determination";
            isHold = true;
            isSexual = 2;
            break;
    }

    if(isHold){
        switch(actionId){
            case "light":
                minDmg = 1;
                break;
            case "medium":
                minDmg = 3;
                break;
            case "heavy":
                minDmg = 6;
                break;
        }
    }
    else {
        switch(actionId){
            case "light":
                minDmg = 2;
                break;
            case "medium":
                minDmg = 4;
                break;
            case "heavy":
                minDmg = 8;
                break;
        }
    }

    if(isSexual == 0){
        dmgHp = minDmg;
    }
    else if(isSexual == 1){
        dmgLust = minDmg;
    }
    else{
        dmgHp = Math.floor(minDmg / 2);
        dmgLust = Math.floor(minDmg / 2);
        if(dmgHp <= 0){
            dmgHp = 1;
        }
        if(dmgLust <= 0){
            dmgLust = 0;
        }
    }


    if(isSimulation === undefined) {
        //add xp points
        currentFight.intMovesCount[currentFight.whoseturn] += 1;
        if (!isHold) {
            attackHandler(dmgHp, dmgLust);
        }
        else {
            holdHandler(dmgHp, dmgLust, isSexual, actionId);
        }
    }
    else{
        var strReturnSimulation = "";
        strReturnSimulation = "Damage output for "+actionId+" "+actionType+":";
        if (dmgHp > 0) {
            strReturnSimulation += "  " + dmgHp.toString() + " HP";
        }
        if(dmgLust > 0){
            strReturnSimulation += "  " + dmgLust + " Lust";
        }
        strReturnSimulation += "\n";
        return strReturnSimulation;
    }




}

function attackHandler(damageHP, damageLust, attacker, defender) {
    var hpRemoved = -1,
        lustAdded = -1;

    if (attacker == undefined) {
        attacker = currentFight.whoseturn;
    }
    if (defender == undefined) {
        defender = (currentFight.whoseturn == 0 ? 1 : 0);
    }

    var strAttack = "[b]" + currentFighters[attacker].character + "[/b] has";

    var featuresVictim = parseStringToIntArray(currentFighters[defender].features);
    var featuresAttacker = parseStringToIntArray(currentFighters[attacker].features);


    if (damageHP != undefined && damageHP >= 0) {
        hpRemoved = damageHP;
        if(hpRemoved <= 0){
            hpRemoved = 1;
        }


        var hpBeforeAttack = currentFighters[defender].hp;

        //ryona enthusiast
        if (featuresVictim.indexOf(3) != -1) {
            currentFighters[defender].lust += hpRemoved;
            _this.fChatLibInstance.sendMessage(currentFighters[defender].character + " really likes to suffer... Their lust meter has been increased by " + hpRemoved, _this.channel);
        }


        //sadist
        if (featuresAttacker.indexOf(4) != -1) {

            currentFighters[attacker].lust += hpRemoved;
            _this.fChatLibInstance.sendMessage(currentFighters[attacker].character + " really likes to inflict pain! Their lust meter has been increased by " + hpRemoved, _this.channel);
            var isUnder75 = (currentFighters[defender].hp < 0.75 * parseInt(currentFighters[defender].maxHp));
            var isUnder50 = (currentFighters[defender].hp < 0.50 * parseInt(currentFighters[defender].maxHp));
            var isUnder25 = (currentFighters[defender].hp < 0.25 * parseInt(currentFighters[defender].maxHp));
            var wasUpper75 = (hpBeforeAttack >= 0.75 * parseInt(currentFighters[defender].maxHp));
            var wasUpper50 = (hpBeforeAttack >= 0.50 * parseInt(currentFighters[defender].maxHp));
            var wasUpper25 = (hpBeforeAttack >= 0.25 * parseInt(currentFighters[defender].maxHp));
            if (isUnder75 && wasUpper75) {
                //25% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                _this.fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 25% of their HP... " + currentFighters[attacker].character + "'s endurance has been increased by 1!", _this.channel);
            }
            if (isUnder50 && wasUpper50) {
                //50% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                _this.fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 50% of their HP! " + currentFighters[attacker].character + "'s endurance has been increased by 1!", _this.channel);
            }
            if (isUnder25 && wasUpper25) {
                //75% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                _this.fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 75% of their HP! " + currentFighters[attacker].character + "'s endurance has been increased by 1!", _this.channel);
            }
        }

        currentFighters[defender].hp -= hpRemoved;

    }

    if (damageLust != undefined && damageLust >= 0) {
        lustAdded = damageLust;

        if (featuresAttacker.indexOf(5) != -1 || featuresVictim.indexOf(5) != -1) { // cum slut
            lustAdded += 1;
        }

        if (lustAdded <= 0) { //attack can't do 0 dmg
            lustAdded = 1;
        }
        currentFighters[defender].lust += lustAdded;

    }

    if(hpRemoved >= 0 && lustAdded >= 0){
        strAttack += " removed " + hpRemoved + " HP and added " + lustAdded + " lust point to "+currentFighters[defender].character;
    }
    else if(hpRemoved >= 0 && lustAdded < 0){
        strAttack += " removed " + hpRemoved + " HP from "+currentFighters[defender].character;
    }
    else if(hpRemoved < 0 && lustAdded >= 0){
        strAttack += " added " + lustAdded + " lust point to "+currentFighters[defender].character;
    }


    _this.fChatLibInstance.sendMessage(strAttack, _this.channel);

    checkLifePoints();
}

function nextTurn(swapTurns) {
    if(currentFight.winner == -1){
        tickHold();
    }

    currentFight.turn++;

    if(swapTurns == undefined || swapTurns == true){
        currentFight.whoseturn = (currentFight.whoseturn == 0 ? 1 : 0);
    }


    if(currentFight.winner == -1){
        broadcastCombatInfo();
    }
}

function tickHold() {
    if (holdInPlace()) {
        if(currentFight.currentHold.isInfinite == false){
            currentFight.currentHold.turnsLeft--;
            _this.fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is still locked in the " + currentFight.currentHold.holdName + "!  (" + currentFight.currentHold.turnsLeft + " turns remaining)", _this.channel);
        }
        else{
            _this.fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is still locked in the " + currentFight.currentHold.holdName + "!", _this.channel);
        }

        attackHandler(currentFight.currentHold.damageHP, currentFight.currentHold.damageLust, currentFight.currentHold.attacker, currentFight.currentHold.defender);
        if (currentFight.currentHold.turnsLeft <= 0 && currentFight.currentHold.isInfinite == false) {
            releaseHold();
        }
    }
}

function holdInPlace() {
    return (typeof currentFight.currentHold == "object" && currentFight.currentHold != undefined && ((currentFight.currentHold.turnsLeft != undefined && currentFight.currentHold.turnsLeft > 0) || (currentFight.currentHold.isInfinite != undefined && currentFight.currentHold.isInfinite == true)));
}

function isInHold(whoseTurn) {
    if(whoseTurn == undefined){
        whoseTurn = currentFight.whoseturn;
    }
    if (holdInPlace() && currentFight.currentHold.defender == whoseTurn) {
        return true;
    }
    return false;
}

function releaseHold() {
    _this.fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is finally out of the " + currentFight.currentHold.holdName + "!", _this.channel);
    currentFight.currentHold.turnsLeft = 0;
    currentFight.currentHold.isInfinite = false;
}

function resetFight() {
    currentFighters = [];
    currentFight = {turn: -1, whoseturn: -1, isInit: false, orgasms: 0, winner: -1, currentHold: {}, actionTier: "", actionType: "", dmgHp: 0, dmgLust: 0, actionIsHold: false, diceResult: 0, intMovesCount: [0,0]};
}

function startFight() {
    setTimeout(beginInitiation(), 2500);
}

function checkLifePoints() {
    //test
    if (currentFighters[0].hp <= 0) {
        currentFighters[0].hp = 0;
        currentFight.winner = 1;
    }
    if (currentFighters[1].hp <= 0) {
        currentFighters[1].hp = 0;
        currentFight.winner = 0;
    }
    if (currentFighters[0].lust >= currentFighters[0].maxLust) {
        currentFighters[0].lust = currentFighters[0].maxLust;
        currentFight.winner = 1;
    }
    if (currentFighters[1].lust >= currentFighters[1].maxLust) {
        currentFighters[1].lust = currentFighters[1].maxLust;
        currentFight.winner = 0;
    }


    if (currentFight.winner > -1) {
        //winner!
        _this.fChatLibInstance.sendMessage("[b]After  #" + currentFight.turn + " turns[/b]\n" +
            "[b]" + currentFighters[currentFight.winner].character + "[/b] has finally taken " + currentFighters[(currentFight.winner == 0 ? 1 : 0)].character + " down!\nCongratulations to the winner!"
            , _this.channel);
        addWinsLosses(currentFighters[currentFight.winner].character, currentFighters[(currentFight.winner == 0 ? 1 : 0)].character);
        setTimeout(resetFight, 2500);
    }

}

function addExperienceOnPrematureEnd(char1, intMoves1, char2, intMoves2){
    client.hgetall(char1, function (err, result) {
        var experience = 0;
        if(!isNaN(intMoves1)){
            experience += intMoves1;
        }
        _this.fChatLibInstance.sendMessage(char1+" has gained "+experience+" XP points. ("+intMoves1+" moves)", _this.channel);
        if(!isNaN(result.experience)){
            experience += parseInt(result.experience) ;
        }
        result.experience = experience;
        client.hmset(result.character, result);
    });
    client.hgetall(char2, function (err, result) {
        var experience = 0;
        if(!isNaN(intMoves2)){
            experience += intMoves2;
        }
        _this.fChatLibInstance.sendMessage(char2+" has gained "+experience+" XP points. ("+intMoves2+" moves)", _this.channel);
        if(!isNaN(result.experience)){
            experience += parseInt(result.experience) ;
        }
        result.experience = experience;
        client.hmset(result.character, result);
    });
}

function addWinsLosses(winnerName, loserName){
    client.hgetall(winnerName, function (err, result) {
        if (result != null) {
            var wins = 1;
            if(!isNaN(result.wins)){
                wins = parseInt(result.wins) + 1;
            }
            result.wins = wins;

            var experience = 2;
            if(!isNaN(currentFight.intMovesCount[currentFight.winner])){
                experience += currentFight.intMovesCount[currentFight.winner];
            }
            _this.fChatLibInstance.sendMessage(winnerName+" has gained "+experience+" XP points. ("+currentFight.intMovesCount[currentFight.winner]+" moves, +2XP for completing a fight.)", _this.channel);
            if(!isNaN(result.experience)){
                experience += parseInt(result.experience) ;
            }
            result.experience = experience;
            client.hmset(winnerName, result);
        }
        else {
            _this.fChatLibInstance.sendMessage("Attempt to add the victory point failed.", _this.channel);
        }
    });

    client.hgetall(loserName, function (err, result) {
        if (result != null) {

            var losses = 1;
            if(!isNaN(result.losses)){
                losses = parseInt(result.losses) + 1;
            }
            result.losses = losses;

            var experience = 2;
            if(!isNaN(currentFight.intMovesCount[(currentFight.winner == 0 ? 1 : 0)])){
                experience += currentFight.intMovesCount[(currentFight.winner == 0 ? 1 : 0)];
            }
            _this.fChatLibInstance.sendMessage(loserName+" has gained "+experience+" XP points. ("+currentFight.intMovesCount[(currentFight.winner == 0 ? 1 : 0)]+" moves, +2XP for completing a fight.)", _this.channel);
            if(!isNaN(result.experience)){
                experience += parseInt(result.experience) ;
            }
            result.experience = experience;

            client.hmset(loserName, result);
        }
        else {
            _this.fChatLibInstance.sendMessage("Attempt to add the loss point failed.", _this.channel);
        }
    });
}

function broadcastCombatInfo() {
    if (checkIfFightIsGoingOn()) {
        _this.fChatLibInstance.sendMessage(
            "\n" +
            "[b]Turn #" + currentFight.turn + "[/b] --------------- It's [b][u][color=pink]" + currentFighters[currentFight.whoseturn].character + "[/color][/u][/b]'s turn.\n\n" +
            (currentFighters.length > 0 ? "[b]" + currentFighters[0].character + ": [/b]" + currentFighters[0].hp + "/" + currentFighters[0].maxHp + " [color=red]HP[/color]  |  " + currentFighters[0].lust + "/" + currentFighters[0].maxLust + " [color=pink]Lust[/color]  |  " + currentFighters[0].ownSubmissiveness + "/10 Submissiveness\n" : "") +
            (currentFighters.length > 1 ? "[b]" + currentFighters[1].character + ": [/b]" + currentFighters[1].hp + "/" + currentFighters[1].maxHp + " [color=red]HP[/color]  |  " + currentFighters[1].lust + "/" + currentFighters[1].maxLust + " [color=pink]Lust[/color]  |  " + currentFighters[1].ownSubmissiveness + "/10 Submissiveness" : "")
            , _this.channel);
    }
    else {
        _this.fChatLibInstance.sendMessage("There is no match going on at the moment.", _this.channel);
    }
}

function getFeaturesListString(rawFeatures) {
    var parsedFeatures = parseStringToIntArray(rawFeatures);
    var str = "";
    for (var i = 0; i < parsedFeatures.length; i++) {
        if (features[parsedFeatures[i]] != undefined) {
            str += ", " + features[parsedFeatures[i]].title;
        }
    }
    str = str.substr(1);
    return str;
}

function findItemIdByTitle(array, title) {
    var realText = didYouMean(title,array,"title");
    if(realText == null){
        return -1;
    }
    for (var i = 0; i < array.length; i++) {
        if (array[i].title == realText) {
            return i
        }
        ;
    }
    return -1;
}

function findAttackTier(inputParameter){
    return didYouMean(inputParameter,attackTiers);
}

function findBondageTier(inputParameter){
    return didYouMean(inputParameter,bondageTiers);
}

function findItemIdById(array, id) {
    var realText = didYouMean(id,array,"id");
    if(realText == null){
        return -1;
    }
    for (var i = 0; i < array.length; i++) {
        if (array[i].id == realText) {
            return i
        }
        ;
    }
    return -1;
}

function getAllItemsTitleInArray(array) {
    var str = "";
    for (var i = 0; i < array.length; i++) {
        if (array[i] != undefined && array[i].title != undefined) {
            str += ", " + array[i].title;
        }
    }
    str = str.substr(1);
    return str;
}

function parseStringToIntArray(myString) {
    var myArray = myString.split(",");
    for (var i = 0; i < myArray.length; i++) {
        if (!isNaN(myArray[i]) && myArray[i] != "") {
            myArray[i] = parseInt(myArray[i]);
        }
        else {
            myArray.splice(i, 1);
        }
    }
    return myArray;
}

function getRandomSextoy() {
    var randomInt = parseInt(getRandomArbitrary(0, sextoys.length));
    return sextoys[randomInt].title;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function checkIfFightIsGoingOn() {
    if (currentFight.turn > 0 && currentFighters.length == 2 && currentFight.whoseturn != -1) {
        return true;
    }
    return false;
}
