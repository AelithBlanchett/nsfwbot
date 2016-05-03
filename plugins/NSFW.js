"use strict";
var fChatLibInstance;
var debug = false; //2.0

module.exports = function (parent) {
    fChatLibInstance = parent;
    var cmdHandler = {};

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });

    cmdHandler.hp = function () {
        broadcastCombatInfo();
    };
    cmdHandler.stamina = cmdHandler.hp;
    cmdHandler.status = cmdHandler.stamina;
    cmdHandler.current = cmdHandler.status;

    cmdHandler.version = function () {
        fChatLibInstance.sendMessage("I'm Benikage, version "+parent.config.cversion);
    };

    cmdHandler.triggerDebug = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            debug = !debug;
            fChatLibInstance.sendMessage("Debug: "+debug);
        }
    };

    cmdHandler.sextoys = function () {
        var toy = getRandomSextoy();
        fChatLibInstance.sendMessage("Here, take this [b]" + toy + "[/b]!");
    };
    cmdHandler.toys = cmdHandler.sextoys;

    cmdHandler.test = function(args, data){ //debug
        if(debug) {
            console.log(didYouMean(args, sexual, "id"));
        }
    };

    cmdHandler.setHPP1 = function(args,data){ //debug
        if(debug){
            currentFighters[0].hp = parseInt(args);
        }
    };
    cmdHandler.setHPP2 = function(args,data){ //debug
        if(debug){
            currentFighters[1].hp = parseInt(args);
        }
    };
    cmdHandler.setLPP1 = function(args,data){ //debug
        if(debug){
            currentFighters[0].lust = parseInt(args);
        }
    };
    cmdHandler.setLPP2 = function(args,data){ //debug
        if(debug){
            currentFighters[1].lust = parseInt(args);
        }
    };

    cmdHandler.win = function(){ //debug
        if(debug){
            currentFighters[currentFight.whoseturn].dice.addTmpMod(100,1);
        }
    };

    cmdHandler.lose = function(){ //debug
        if(debug){
            currentFighters[currentFight.whoseturn].dice.addTmpMod(-100,1);
        }
    };
    //
    cmdHandler.dbg = function(args,data){
        if(debug) {
            client.hgetall('Lustful Aelith', function (err, result) {
                if (result != null) {
                    result.hp = parseInt(result.maxHp);
                    result.maxLust = parseInt(result.maxLust);
                    result.lust = 0;
                    result.orgasms = 0;
                    currentFighters[0] = result;
                    currentFighters[0].dice = new Dice(10);
                    //fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                    client.hgetall("Bondage Wrestling", function (err, result2) {
                        if (result2 != null) {
                            result2.hp = parseInt(result2.maxHp);
                            result2.maxLust = parseInt(result2.maxLust);
                            result2.lust = 0;
                            result2.orgasms = 0;
                            currentFighters[1] = result2;
                            currentFighters[1].dice = new Dice(10);
                            fChatLibInstance.sendMessage(data.character + " accepts the challenge! Let's get it on!");
                            startFight();

                        }
                    });
                }
            });
        }
    };

    cmdHandler.register = function (args, data) {
        if (isNaN(args)) {
            var idClass = findItemIdByTitle(classes, args);
            if (idClass != -1) {
                client.hexists(data.character, "character", function (err, reply) {
                    if (reply == 0) {
                        var statsObj = {};
                        statsObj.character = data.character;
                        statsObj.stats = classes[idClass].stats;
                        statsObj.strength = parseInt(classes[idClass].stats.strength);
                        statsObj.toughness = parseInt(classes[idClass].stats.toughness);
                        statsObj.determination = parseInt(classes[idClass].stats.determination);
                        statsObj.agility = parseInt(classes[idClass].stats.agility);
                        statsObj.expertise = parseInt(classes[idClass].stats.expertise);
                        statsObj.endurance = parseInt(classes[idClass].stats.endurance);
                        statsObj.maxHp = 10 + (10 - statsObj.endurance);
                        statsObj.maxLust = 10 + parseInt(classes[idClass].stats.endurance) * 3;
                        statsObj.wins = 0;
                        statsObj.losses = 0;
                        statsObj.coins = 100;
                        statsObj.pointsToSpend = 0;
                        statsObj.experience = 0;
                        var currentFeatures = [];
                        currentFeatures.push(parseInt(classes[idClass].feature));
                        statsObj.features = currentFeatures.toString();
                        client.hmset(data.character, statsObj);
                        fChatLibInstance.sendMessage("You've been successfully registered in the list as a " + classes[idClass].title + " "  + data.character);
                    }
                    else {
                        fChatLibInstance.sendMessage("You're already registered " + data.character);
                    }
                });
            }
            else{
                fChatLibInstance.sendMessage("This is not a valid class name, please try again.");
            }
        }
        else
        {
            if (parseInt(args[0]) <= 0 || parseInt(args[1]) <= 0 || parseInt(args[2]) <= 0 || parseInt(args[3]) <= 0 || parseInt(args[4]) <= 0 || parseInt(args[5]) <= 0) {
                fChatLibInstance.sendMessage("A stat must have a value greater than 0");
                return;
            }
            var totalPoints = parseInt(args[0]) + parseInt(args[1]) + parseInt(args[2]) + parseInt(args[3]) + parseInt(args[4]) + parseInt(args[5]);
            if (totalPoints != 10) {
                fChatLibInstance.sendMessage("All your stats combined must be equal to 10. Current value: " + totalPoints);
                return;
            }
            client.hexists(data.character, "character", function (err, reply) {
                if (reply == 0) {
                    var statsObj = {};
                    statsObj.character = data.character;
                    statsObj.stats = args;
                    statsObj.strength = parseInt(args[0]);
                    statsObj.toughness = parseInt(args[1]);
                    statsObj.determination = parseInt(args[2]);
                    statsObj.agility = parseInt(args[3]);
                    statsObj.expertise = parseInt(args[4]);
                    statsObj.endurance = parseInt(args[5]);
                    statsObj.maxHp = 10 + (10 - statsObj.endurance);
                    statsObj.maxLust = 14;
                    statsObj.wins = 0;
                    statsObj.losses = 0;
                    statsObj.features = "";
                    statsObj.pointsToSpend = 0;
                    statsObj.experience = 0;
                    client.hmset(data.character, statsObj);
                    fChatLibInstance.sendMessage("You've been successfully registered in the list " + data.character);
                }
                else {
                    fChatLibInstance.sendMessage("You're already registered " + data.character);
                }
            });
        }
    };


    cmdHandler.wrestle = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                if (currentFighters.length == 0) {
                    result.hp = parseInt(result.maxHp);
                    result.maxLust = parseInt(result.maxLust);
                    result.lust = 0;
                    currentFighters[0] = result;
                    currentFighters[0].dice = new Dice(10);
                    currentFighters[0].ownBondageLevel = 0;
                    fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                }
                else if (currentFighters.length == 1) {
                    if (currentFighters[0].character != data.character) {
                        result.hp = parseInt(result.maxHp);
                        result.maxLust = parseInt(result.maxLust);
                        result.lust = 0;
                        currentFighters[1] = result;
                        currentFighters[1].dice = new Dice(6);
                        currentFighters[1].ownBondageLevel = 0;
                        fChatLibInstance.sendMessage(data.character + " accepts the challenge! Let's get it on!");
                        startFight();
                    }
                    else {
                        fChatLibInstance.sendMessage("You can't register twice!");
                    }
                }
                else {
                    fChatLibInstance.sendMessage("Sorry, our two wrestlers are still in the fight!");
                }
            }
            else {
                fChatLibInstance.sendMessage("Apparently, you're not registered yet! Please check the available commands with !help");
            }
        });
    };
    cmdHandler.ready = cmdHandler.wrestle;
    cmdHandler.fight = cmdHandler.wrestle;

    cmdHandler.exit = function (args, data) {
        if (currentFighters.length > 0) {
            if ((currentFighters.length > 0 && currentFighters[0] != undefined && currentFighters[0].character == data.character) || (currentFighters.length > 1 && currentFighters[1] != undefined && currentFighters[1].character == data.character)) {
                fChatLibInstance.sendMessage("You have been removed from the fight.");
                resetFight();
            }
            else {
                fChatLibInstance.sendMessage("You are not in a fight.");
            }
        }
        else {
            fChatLibInstance.sendMessage("There isn't any fight going on at the moment.");
        }
    };
    cmdHandler.leave = cmdHandler.exit;
    cmdHandler.leaveFight = cmdHandler.exit;
    cmdHandler.forfeit = cmdHandler.exit;
    cmdHandler.unready = cmdHandler.exit;

    cmdHandler.deleteProfile = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    fChatLibInstance.sendMessage("You can't add remove your profile if you're in a fight.");
                    return;
                }
            }
            client.del(args, function (err, result) {
                if (result == 1) {
                    fChatLibInstance.sendMessage(args + "'s stats have been deleted. Thank you for playing!");
                }
                else {
                    fChatLibInstance.sendMessage("This profile hasn't been found in the database.");
                }
            });
        }
        else {
            fChatLibInstance.sendMessage("You don't have sufficient rights.");
        }
    };

    cmdHandler.myStats = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
                var wins, losses;
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
                fChatLibInstance.sendMessage("[b]" + stats.character + "[/b]'s stats" + "\n" +
                    "[b][color=red]Strength[/color][/b]:  " + stats.strength + "      " + "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
                    "[b][color=orange]Toughness[/color][/b]:  " + stats.toughness + "      " + "[b][color=pink]Max Lust[/color][/b]: " + stats.maxLust + "\n" +
                    "[b][color=green]Determination[/color][/b]:  " + stats.determination + "\n" +
                    "[b][color=cyan]Agility[/color][/b]:    " + stats.agility + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + wins + " - " + losses + "\n" +
                    "[b][color=purple]Expertise[/color][/b]: " + stats.expertise +  "      " + "[b][color=orange]Experience[/color][/b]: " + stats.experience + "\n" +
                    "[b][color=blue]Endurance[/color][/b]: " + stats.endurance + "\n\n" +
                    "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
            }
            else {
                fChatLibInstance.sendMessage("Are you sure you're registered?");
            }
        });
    };
    cmdHandler.stats = cmdHandler.myStats;

    //cmdHandler.addStat = function (args, data) {
    //        var arr = args.split(' ');
    //        var result = arr.splice(0, 2);
    //        result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)
    //
    //        if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
    //            var newStats = {
    //                strength: 0,
    //                agility: 0,
    //                expertise: 0,
    //                endurance: 0,
    //                toughness: 0,
    //                determination: 0,
    //                character: result[2]
    //            };
    //            switch (result[0].toLowerCase()) {
    //                case "strength":
    //                    newStats.strength = parseInt(result[1]);
    //                    break;
    //                case "determination":
    //                    newStats.determination = parseInt(result[1]);
    //                    break;
    //                case "agility":
    //                    newStats.agility = parseInt(result[1]);
    //                    break;
    //                case "expertise":
    //                    newStats.expertise = parseInt(result[1]);
    //                    break;
    //                case "endurance":
    //                    newStats.endurance = parseInt(result[1]);
    //                    break;
    //                case "toughness":
    //                    newStats.toughness = parseInt(result[1]);
    //                    break;
    //            }
    //            client.hgetall(newStats.character, function (err, result) {
    //                if (result != null) {
    //                    result.strength = parseInt(result.strength) + newStats.strength;
    //                    result.determination = parseInt(result.determination) + newStats.determination;
    //                    result.agility = parseInt(result.agility) + newStats.agility;
    //                    result.expertise = parseInt(result.expertise) + newStats.expertise;
    //                    result.endurance = parseInt(result.endurance) + newStats.endurance;
    //                    result.toughness = parseInt(result.toughness) + newStats.toughness;
    //                    result.maxHp = 10 + (10 - result.endurance);
    //                    result.maxLust = 14 + (result.strength + result.determination + result.agility + result.expertise + result.endurance + result.toughness);
    //                    result.pointsToSpend = parseInt(result.pointsToSpend - 1);
    //                    if(result.pointsToSpend < 0){
    //                        fChatLibInstance.sendMessage("You don't have any more points to spend.");
    //                    }
    //                    else{
    //                        client.hmset(newStats.character, result);
    //                        fChatLibInstance.sendMessage("Succesfully added " + parseInt(result[1]) + " point(s) of " + result[0]+ "!");
    //                    }
    //                }
    //                else {
    //                    fChatLibInstance.sendMessage("Are you sure this user is registered?");
    //                }
    //            });
    //        }
    //        else {
    //            fChatLibInstance.sendMessage("Invalid syntax. Correct is: !addStat STAT X. Example: !addStat Strength 1");
    //        }
    //};

    cmdHandler.addStats = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                fChatLibInstance.sendMessage("Will add " + parseInt(result[1]) + " points of " + result[0] + " to " + result[2]);
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
                        result.maxHp = 10 + (10 - result.endurance);
                        result.maxLust = 14 + (result.strength + result.determination + result.agility + result.expertise + result.endurance + result.toughness);
                        client.hmset(newStats.character, result);
                        fChatLibInstance.sendMessage("Succesfully added the new points!");
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure this user is registered?");
                    }
                });
            }
            else {
                fChatLibInstance.sendMessage("Invalid syntax. Correct is: !addStats STAT X CHARACTER. Example: !addStats Strength 1 ThatCharacter");
            }

        }
    };

    cmdHandler.reset = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            if (checkIfFightIsGoingOn()) {
                resetFight();
                fChatLibInstance.sendMessage("The ring has been cleared.");
            }
            else {
                fChatLibInstance.sendMessage("The ring isn't occupied.");
            }
        }
        else {
            fChatLibInstance.sendMessage("You don't have sufficient rights.");
        }
    };

    cmdHandler.removeStats = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                fChatLibInstance.sendMessage("Will remove " + parseInt(result[1]) + " points of " + result[0] + " to " + result[2]);
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
                        result.maxHp = parseInt(result.toughness) * 5;
                        result.maxLust = parseInt(result.endurance) * 5;
                        client.hmset(newStats.character, result);
                        fChatLibInstance.sendMessage("Succesfully removed the points!");
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure this user is registered?");
                    }
                });
            }
            else {
                fChatLibInstance.sendMessage("Invalid syntax. Correct is: !removeStats STAT X CHARACTER. Example: !removeStats Strength 1 ThatCharacter");
            }

        }
    };

    //cmdHandler.getStats = function (args, data) {
    //    client.hgetall(args, function (err, result) {
    //        if (result != null) {
    //            var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
    //            var wins, losses;
    //            if(isNaN(stats.wins)){
    //                wins = 0;
    //            }
    //            else{
    //                wins = stats.wins;
    //            }
    //            if(isNaN(stats.losses)){
    //                losses = 0;
    //            }
    //            else{
    //                losses = stats.losses;
    //            }
    //            var coins = stats.coins || 0;
    //            fChatLibInstance.sendMessage("[b]" + stats.character + "[/b]'s stats" + "\n" +
    //                "[b][color=red]Strength[/color][/b]:  " + stats.strength + "      " + "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
    //                "[b][color=orange]Toughness[/color][/b]:  " + stats.toughness + "      " + "[b][color=pink]Max Lust[/color][/b]: " + stats.maxLust + "\n" +
    //                "[i][color=green]determination[/color][/i]:  " + stats.determination + "\n" +
    //                "[i][color=cyan]Agility[/color][/i]:    " + stats.agility + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + wins + " - " + losses + "\n" +
    //                "[b][color=purple]Expertise[/color][/b]: " + stats.expertise +  "      " + "[b][color=orange]Experience[/color][/b]: " + stats.experience + "\n" +
    //                "[b][color=blue]Endurance[/color][/b]: " + stats.endurance + "\n\n" +
    //                "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
    //        }
    //        else {
    //            fChatLibInstance.sendMessage("Are you sure this user is registered?");
    //        }
    //    });
    //};

    cmdHandler.addFeature = function (args, data) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    fChatLibInstance.sendMessage("You can't add a feature if you're in a fight.");
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
                                        fChatLibInstance.sendMessage("You cannot add this feature if you've already got [b]" + features[features[idFeature].incompatibility].title + "[/b]");
                                        return;
                                    }
                                }
                                if (idFeature == 0) {
                                    result.endurance = 1;
                                }
                                currentFeatures.push(idFeature);
                                result.features = currentFeatures.toString();
                                client.hmset(data.character, result);
                                fChatLibInstance.sendMessage("You've successfully added the [b]" + features[idFeature].title + "[/b] perk.");
                                return;
                            }
                            fChatLibInstance.sendMessage("You already have the [b]" + features[idFeature].title + "[/b] perk.");
                            return;
                        }
                        fChatLibInstance.sendMessage("You can't have more than 2 features.");
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure you're registered?");
                    }
                });
            }
            else {
                fChatLibInstance.sendMessage("This feature has not been found. Check the spelling.");
            }
        }
        else{
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !addFeature Cum Slut\nAvailable moves: "+getAllItemsTitleInArray(features));
        }
    };

    cmdHandler.removeFeatures = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            if (args.length > 0) {
                client.hgetall(args, function (err, result) {
                    if (result != null) {
                        result.features = [];
                        client.hmset(args, result);
                        fChatLibInstance.sendMessage("You've successfully removed all the features from "+args);
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure this user is registered?");
                    }
                });
            }
            else{
                fChatLibInstance.sendMessage("Correct syntax: !removeFeatures user");
            }
        }
        else {
            fChatLibInstance.sendMessage("You don't have sufficient rights.");
        }
    };

    cmdHandler.pass = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                currentFight.actionType = "pass";
                checkRollWinner(true);
            }
            else {
                fChatLibInstance.sendMessage("It's not your turn yet.");
            }

        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }
    };
    cmdHandler.skip = cmdHandler.pass;

    cmdHandler.escape = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                if (isInHold()) {
                    currentFight.actionType = "escape";
                    if (currentFight.turn > 0) {
                        rollBoth();
                    }
                }
                else {
                    fChatLibInstance.sendMessage("You're not in a hold, you can't escape the void!");
                }
            }
            else {
                fChatLibInstance.sendMessage("It's not your turn to attack.");
            }

        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }
    };
    cmdHandler.escapeHold = cmdHandler.escape;
    cmdHandler.e = cmdHandler.escape;

    cmdHandler.giveUp = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                if (isInHold()) {
                    if (currentFight.turn > 0) {
                        currentFight.winner = (currentFight.whoseturn == 0 ? 1 : 0);
                        fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " is giving up! It must have been too much to handle!");
                        checkLifePoints();
                    }
                }
                else {
                    fChatLibInstance.sendMessage("You're not in a hold, you can't escape the void!");
                }
            }
            else {
                fChatLibInstance.sendMessage("It's not your turn to attack.");
            }

        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }
    };
    cmdHandler.tapout = cmdHandler.giveUp;
    cmdHandler.surrender = cmdHandler.giveUp;
    cmdHandler.submit = cmdHandler.giveUp;






    // attacks

    var attack = function(args, data, type) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    if (isInHold()) {
                        fChatLibInstance.sendMessage("You are still in a hold. You can either !escape or !tapout (and lose).");
                        return;
                    }

                    currentFight.actionType = type;
                    currentFight.actionTier = "";
                    currentFight.actionTier = findAttackTier(args);

                    if(currentFight.actionType == "bondage") //then it's maybe a bd attack
                    {
                        currentFight.actionTier = "light";
                    }

                    if (currentFight.actionTier != "") {
                        if (currentFight.turn > 0) {
                            roll();
                        }
                    }
                    else {
                        fChatLibInstance.sendMessage("This tier has not been found. Check the spelling.");
                    }
                }
                else if (data.character == currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character) {
                    fChatLibInstance.sendMessage("It's not your turn to attack.");
                }
                else {
                    fChatLibInstance.sendMessage("You're not in the fight.");
                }

            }
        }
        else {
            //available commands
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !brawl light OR !sexual medium OR !hmove Heavy OR !bondage item");
        }
    };

    cmdHandler.brawl = function(args,data){
        attack(args, data, "brawl");
    };
    cmdHandler.hit = cmdHandler.brawl;


    cmdHandler.martial = function(args,data){
        attack(args, data, "martial");
    };
    cmdHandler.acrobat = cmdHandler.martial;

    cmdHandler.highflyer = function(args,data){
        attack(args, data, "highflyer");
    };
    cmdHandler.tackle = cmdHandler.highflyer;
    cmdHandler.hf = cmdHandler.highflyer;
    cmdHandler.aerial = cmdHandler.highflyer;


    cmdHandler.sexual = function(args,data){
        attack(args, data, "sexual");
    };
    cmdHandler.lust = cmdHandler.sexual;
    cmdHandler.s = cmdHandler.sexual;
    cmdHandler.sex = cmdHandler.sexual;
    cmdHandler.stroke = cmdHandler.sexual;
    cmdHandler.fuck = cmdHandler.sexual;
    cmdHandler.lick = cmdHandler.sexual;


    cmdHandler.submission = function(args,data){
        attack(args, data, "submission");
    };
    cmdHandler.grab = cmdHandler.submission;
    cmdHandler.hold = cmdHandler.submission;
    cmdHandler.grapple = cmdHandler.submission;
    cmdHandler.grappling = cmdHandler.submission;


    cmdHandler.humiliation = function(args,data){
        attack(args, data, "humiliation");
    };
    cmdHandler.hmove = cmdHandler.humiliation;
    cmdHandler.hummove = cmdHandler.humiliation;
    cmdHandler.humiliate = cmdHandler.humiliation;
    cmdHandler.humiliatinghold = cmdHandler.humiliation;
    cmdHandler.smother = cmdHandler.humiliation;

    cmdHandler.bondage = function(args,data){
        attack(args, data, "bondage");
    };
    cmdHandler.bdsm = cmdHandler.bondage;
    cmdHandler.bind = cmdHandler.bondage;
    cmdHandler.restrain = cmdHandler.bondage;
    cmdHandler.tie = cmdHandler.bondage;
    cmdHandler.tieup = cmdHandler.bondage;
    cmdHandler.dominate = cmdHandler.bondage;
    cmdHandler.tame = cmdHandler.bondage;
    cmdHandler.bd = cmdHandler.bondage;


    return cmdHandler;
};

var didYouMean = require('didyoumean');
var redis = require("redis");
var client = redis.createClient(6379, "127.0.0.1");

var features = require(__dirname + '/etc/features.js');
var sextoys = require(__dirname + '/etc/sextoys.js');
var classes = require(__dirname + '/etc/classes.js');

var attackTiers = ['light', 'medium', 'heavy'];
var bondageTiers = ['arms', 'torso', 'legs'];

var currentFighters = [];
var currentFight = {turn: -1, whoseturn: -1, isInit: false, orgasms: 0, winner: -1, currentHold: {}, actionTier: "", actionType: "", dmgHp: 0, dmgLust: 0, actionIsHold: false, diceResult: 0, intMovesCount: [0,0], bothPlayerRoll: 0};
var Dice = require('cappu-dice');

function beginInitiation(){
    currentFight.turn = 0;
    currentFight.isInit = true;
    currentFight.bothPlayerRoll = true;
    fChatLibInstance.sendMessage("\n[b]Let's start![/b]\n\n[b]" + currentFighters[0].character + "[/b]\n\n[color=red]VS[/color]\n\n[b]" + currentFighters[1].character + "[/b]");
    checkFeaturesInit();
    rollBoth();
}

function rollBoth(){
    currentFight.bothPlayerRoll = true;
    var mods0 = (currentFighters[0].dice.getModsSum() + currentFighters[0].dice.getTmpModsSum());
    var mods1 = (currentFighters[1].dice.getModsSum() + currentFighters[1].dice.getTmpModsSum());
    currentFight.diceResultP1 = currentFighters[0].dice.roll();
    currentFight.diceResultP2 = currentFighters[1].dice.roll();
    //currentFight.diceResultP1 = currentFight.diceResultP2; TO CHECK FOR STACK OVERFLOW
    fChatLibInstance.sendMessage("\n[b]" + currentFighters[0].character + "[/b] rolled a [b]" + currentFight.diceResultP1 + "[/b] " + (mods0 != 0 ? "(" + ((mods0 >= 0 ? "+" : "") + mods0 + " applied)") : "" ) + "\n" +
        "[b]" + currentFighters[1].character + "[/b] rolled a [b]" + currentFight.diceResultP2 + "[/b] " + (mods1 != 0 ? "(" + ((mods1 >= 0 ? "+" : "") + mods1 + " applied)") : "" ));
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
        fChatLibInstance.sendMessage("\n[b]" + currentFighters[(dominated == 0 ? 1 : 0)].character + "[/b] really has an imposing dominance!\n[b]" + currentFighters[dominated].character + "[/b] feels a bit scared...");
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
            currentFight.diceResult = parseInt(Math.floor((parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + parseInt(currentFighters[currentFight.whoseturn][typeUsed2]) ) / 2) + diceScore);
            currentFight.actionIsHold = true;
            break;
        case "highflyer":
            typeUsed1 = "agility";
            currentFight.diceResult = parseInt(parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + diceScore);
            break;
        case "martial":
            typeUsed1 = "agility";
            typeUsed2 = "expertise";
            currentFight.diceResult = parseInt(Math.floor((parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + parseInt(currentFighters[currentFight.whoseturn][typeUsed2]) ) / 2) + diceScore);
            break;
        case "sexual":
            typeUsed1 = "expertise";
            currentFight.diceResult = parseInt(parseInt(currentFighters[currentFight.whoseturn][typeUsed1]) + diceScore);
            break;
        case "humiliation":
            typeUsed1 = "expertise";
            typeUsed2 = "strength";
            currentFight.diceResult = parseInt(Math.floor(parseInt(currentFighters[currentFight.whoseturn][typeUsed1] + parseInt(currentFighters[currentFight.whoseturn][typeUsed2])) / 2) + diceScore);
            currentFight.actionIsHold = true;
            break;
        case "bondage":
            currentFight.diceResult = diceScore;
            break;
    }
    fChatLibInstance.sendMessage("\n[b]" + currentFighters[currentFight.whoseturn].character + "[/b] rolled a [b]" + currentFight.diceResult + "[/b] " + (mods != 0 ? "(" + ((mods >= 0 ? "+" : "") + mods + " applied)") : "" ));
    checkRollWinner();
}

function checkRollWinner(blnForceSuccess) {
    if(currentFight.bothPlayerRoll){
        currentFight.bothPlayerRoll = false;
        if(currentFight.diceResultP1 == currentFight.diceResultP2){
            rollBoth();
        }
        var idWinner = (currentFight.diceResultP1 > currentFight.diceResultP2 ? 0 : 1);
        if (currentFight.isInit) {
            currentFight.isInit = false;
            fChatLibInstance.sendMessage("[i]" + currentFighters[idWinner].character + " emotes the attack first.[/i]");
            currentFight.whoseturn = idWinner;
            nextTurn(false);
        }
        else{ //case of both players rolling
            var isPlayerSuccessful = (idWinner == currentFight.whoseturn);
            checkRollWinner(isPlayerSuccessful);
        }
    }
    else{
        var success = false;
        switch (currentFight.actionTier) {
            case "light":
                success = currentFight.diceResult >= 6;
                break;
            case "medium":
                success = currentFight.diceResult >= 8;
                break;
            case "heavy":
                success = currentFight.diceResult >= 10;
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
                fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!\nIt's still " + currentFighters[currentFight.whoseturn].character + "'s turn.");
                return;
            }
            else if (currentFight.actionType == "pass") {
                fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has passed this turn.");
            }
            else if( currentFight.actionType == "bondage"){
                currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownBondageLevel++;
                fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + "'s bondage attack has been [color=green][u]successful![/u][/color][/b]");
                if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownBondageLevel == 3){
                    currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].dice.addMod(-1);
                    fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + "'s bondage items are starting to get in the way! -1 to their dice rolls.[/b]");
                }
                else if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownBondageLevel == 6){
                    currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].dice.addMod(-1);
                    fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + " is looking quite helpless like that! Another -1 to their dice rolls![/b]");
                }
                else if(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].ownBondageLevel == 9){
                    currentFight.winner = currentFight.whoseturn;
                    fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + " is completely bound! The fight is over![/b]");
                }
            }
            else {
                fChatLibInstance.sendMessage("[b]" + currentFighters[currentFight.whoseturn].character + "'s attack has [color=green][u]hit![/u][/color][/b]");
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
    fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] missed![/i]");
    if (currentFight.actionType == "escape") {
        currentFighters[idPlayer].dice.addTmpMod(parseInt(1))
    }
    currentFighters[idPlayer].dice.addTmpMod(parseInt(1), 3);
    fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] has gotten +1 added to their next dice roll.[/i]");
}

function holdHandler(damageHP, damageLust, isSexual) {
    var strAttack = "[b]" + currentFighters[currentFight.whoseturn].character + "[/b] has";

    if (damageHP != undefined || damageLust != undefined) {
        if (currentFight.currentHold == undefined) {
            currentFight.currentHold = {};
        }
        if (currentFight.currentHold.turnsLeft == undefined || isNaN(currentFight.currentHold.turnsLeft) || (!isNaN(currentFight.currentHold.turnsLeft) && parseInt(currentFight.currentHold.turnsLeft) < 0)) {
            currentFight.currentHold.turnsLeft = 0;
        }
        if (currentFight.currentHold.damageHP == undefined || isNaN(currentFight.currentHold.damageHP) || (!isNaN(currentFight.currentHold.damageHP) && parseInt(currentFight.currentHold.damageHP) <= 0)) {
            currentFight.currentHold.damageHP = 0;
        }
        if (currentFight.currentHold.damageLust == undefined || isNaN(currentFight.currentHold.damageLust) || (!isNaN(currentFight.currentHold.damageLust) && parseInt(currentFight.currentHold.damageLust) <= 0)) {
            currentFight.currentHold.damageLust = 0;
        }
        if((currentFight.currentHold.attacker != undefined && currentFight.currentHold.attacker != currentFight.whoseturn) || !holdInPlace()){//reset on turn change
            currentFight.currentHold.turnsLeft = 0;
            currentFight.currentHold.damageHP = 0;
            currentFight.currentHold.damageLust = 0;
            currentFight.currentHold.hpPenalty = 0;
            currentFight.currentHold.lustPenalty = 0;
        }

        var attacker = currentFight.whoseturn;
        var defender = (currentFight.whoseturn == 0 ? 1 : 0);
        var turns = 3; //3 turns by default
        var isInfinite = false;

        var newTurnsLeft = parseInt(currentFight.currentHold.turnsLeft) + parseInt(turns);
        var newDamageHP = parseInt(currentFight.currentHold.damageHP);
        if(damageHP != undefined && damageHP != -1){
            var dmg = parseInt(damageHP);
            if(dmg <= 0){
                dmg = 1;
            }
            newDamageHP += dmg;
        }
        var newDamageLust = parseInt(currentFight.currentHold.damageLust);
        if(damageLust != undefined && damageLust != -1){
            var dmg = parseInt(damageLust);
            if(dmg <= 0){
                dmg = 1;
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

        fChatLibInstance.sendMessage(strAttack);
    }
}

function attackPrepare(actionType, actionId) {
    var typeUsed1 = "";
    var typeUsed2 = "";
    var typeDefender = "";
    var dmgHp = -1;
    var dmgLust = -1;
    var isHold = false;
    var isSexual = 0; // 0 = false, 1 = true, 2 = both
    var divider = 1;

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
        case "humiliation":
            typeUsed1 = "expertise";
            typeUsed2 = "strength";
            typeDefender = "determination";
            isHold = true;
            isSexual = 2;
            break;
    }

    switch(actionId){
        case "light":
            divider = 6;
            break;
        case "medium":
            divider = 4;
            break;
        case "heavy":
            divider = 2;
            break;
    }

    var total = 1;
    if(typeUsed2 == ""){
        var intType1 = parseInt(currentFighters[currentFight.whoseturn][typeUsed1]);
        var intTypeDef = parseInt(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)][typeDefender]);
        total = Math.floor((intType1 + ((intType1 - 1)/divider)) - intTypeDef);
    }
    else{
        var intType1 = parseInt(currentFighters[currentFight.whoseturn][typeUsed1]);
        var intType2 = parseInt(currentFighters[currentFight.whoseturn][typeUsed2]);
        var intTypeDef = parseInt(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)][typeDefender]);
        total = Math.floor(((intType1 + ((intType1 - 1)/divider)) + (intType2 + ((intType2 - 1)/divider)) /2))  - intTypeDef;
    }
    if(isSexual == 0){
        dmgHp = total;
    }
    else if(isSexual == 1){
        dmgLust = total;
    }
    else{
        dmgHp = Math.floor(total / 2);
        dmgLust = Math.floor(total / 2);
    }

    //add xp points
    currentFight.intMovesCount[currentFight.whoseturn] += 1;

    if(!isHold){
        attackHandler(dmgHp, dmgLust);
    }
    else{
        holdHandler(dmgHp, dmgLust, isSexual);
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
            fChatLibInstance.sendMessage(currentFighters[defender].character + " really likes to suffer... Their lust meter has been increased by " + hpRemoved);
        }


        //sadist
        if (featuresAttacker.indexOf(4) != -1) {

            currentFighters[attacker].lust += hpRemoved;
            fChatLibInstance.sendMessage(currentFighters[attacker].character + " really likes to inflict pain! Their lust meter has been increased by " + hpRemoved);
            var isUnder75 = (currentFighters[defender].hp < 0.75 * parseInt(currentFighters[defender].maxHp));
            var isUnder50 = (currentFighters[defender].hp < 0.50 * parseInt(currentFighters[defender].maxHp));
            var isUnder25 = (currentFighters[defender].hp < 0.25 * parseInt(currentFighters[defender].maxHp));
            var wasUpper75 = (hpBeforeAttack >= 0.75 * parseInt(currentFighters[defender].maxHp));
            var wasUpper50 = (hpBeforeAttack >= 0.50 * parseInt(currentFighters[defender].maxHp));
            var wasUpper25 = (hpBeforeAttack >= 0.25 * parseInt(currentFighters[defender].maxHp));
            if (isUnder75 && wasUpper75) {
                //25% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 25% of their HP... " + currentFighters[attacker].character + "'s endurance has been increased by 1!");
            }
            if (isUnder50 && wasUpper50) {
                //50% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 50% of their HP! " + currentFighters[attacker].character + "'s endurance has been increased by 1!");
            }
            if (isUnder25 && wasUpper25) {
                //75% triggered
                currentFighters[attacker].endurance = parseInt(currentFighters[attacker].endurance) + 1;
                fChatLibInstance.sendMessage(currentFighters[defender].character + " has already lost 75% of their HP! " + currentFighters[attacker].character + "'s endurance has been increased by 1!");
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


    fChatLibInstance.sendMessage(strAttack);

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
            fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is still locked in the " + currentFight.currentHold.holdName + "!  (" + currentFight.currentHold.turnsLeft + " turns remaining)");
        }
        else{
            fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is still locked in the " + currentFight.currentHold.holdName + "!");
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
    fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is finally out of the " + currentFight.currentHold.holdName + "!");
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
        fChatLibInstance.sendMessage("[b]After  #" + currentFight.turn + " turns[/b]\n" +
            "[b]" + currentFighters[currentFight.winner].character + "[/b] has finally took " + currentFighters[(currentFight.winner == 0 ? 1 : 0)].character + " down!\nCongratulations to the winner!"
        );
        addWinsLosses(currentFighters[currentFight.winner].character, currentFighters[(currentFight.winner == 0 ? 1 : 0)].character);
        setTimeout(resetFight, 2500);
    }

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
            fChatLibInstance.sendMessage(winnerName+" has gained "+experience+" XP points. ("+currentFight.intMovesCount[currentFight.winner]+" moves, +2XP for completing a fight.)");
            if(!isNaN(result.experience)){
                experience += parseInt(result.experience) ;
            }
            result.experience = experience;
            client.hmset(winnerName, result);
        }
        else {
            fChatLibInstance.sendMessage("Attempt to add the victory point failed.");
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
            fChatLibInstance.sendMessage(loserName+" has gained "+experience+" XP points. ("+currentFight.intMovesCount[(currentFight.winner == 0 ? 1 : 0)]+" moves, +2XP for completing a fight.)");
            if(!isNaN(result.experience)){
                experience += parseInt(result.experience) ;
            }
            result.experience = experience;

            client.hmset(loserName, result);
        }
        else {
            fChatLibInstance.sendMessage("Attempt to add the loss point failed.");
        }
    });
}

function broadcastCombatInfo() {
    if (checkIfFightIsGoingOn()) {
        fChatLibInstance.sendMessage(
            "\n" +
            "[b]Turn #" + currentFight.turn + "[/b] --------------- It's [b][u][color=pink]" + currentFighters[currentFight.whoseturn].character + "[/color][/u][/b]'s turn.\n\n" +
            (currentFighters.length > 0 ? "[b]" + currentFighters[0].character + ": [/b]" + currentFighters[0].hp + "/" + currentFighters[0].maxHp + " [color=red]HP[/color]  |  " + currentFighters[0].lust + "/" + currentFighters[0].maxLust + " [color=pink]Lust[/color]  |  " + currentFighters[0].ownBondageLevel + "/9 Bondage level\n" : "") +
            (currentFighters.length > 1 ? "[b]" + currentFighters[1].character + ": [/b]" + currentFighters[1].hp + "/" + currentFighters[1].maxHp + " [color=red]HP[/color]  |  " + currentFighters[1].lust + "/" + currentFighters[1].maxLust + " [color=pink]Lust[/color]  |  " + currentFighters[0].ownBondageLevel + "/9 Bondage level" : "")
        );
    }
    else {
        fChatLibInstance.sendMessage("There is no match going on at the moment.");
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
