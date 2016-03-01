"use strict";
var fChatLibInstance;
var debug = true;

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


    cmdHandler.sextoys = function () {
        var toy = getRandomSextoy();
        fChatLibInstance.sendMessage("Here, take this [b]" + toy + "[/b]!");
    };
    cmdHandler.toys = cmdHandler.sextoys;

    //cmdHandler.test = function(args, data){ //debug
    //    console.log(didYouMean(args,sexual,"title"));
    //};
    //
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
        client.hgetall('Lustful Aelith', function (err, result) {
            if (result != null) {
                result.hp = parseInt(result.maxHp);
                result.stamina = parseInt(result.maxStamina);
                result.lust = 0;
                result.orgasms = 0;
                currentFighters[0] = result;
                currentFighters[0].dice = new Dice(10);
                //fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                client.hgetall("Bondage Wrestling", function (err, result2) {
                    if (result2 != null) {
                        result2.hp = parseInt(result2.maxHp);
                        result2.stamina = parseInt(result2.maxStamina);
                        result2.lust = 0;
                        result2.orgasms = 0;
                        currentFighters[1] = result2;
                        currentFighters[1].dice = new Dice(10);
                        //fChatLibInstance.sendMessage(data.character + " accepts the challenge! Let's get it on!");
                        startFight();
                    }
                });
            }
        });

    }

    cmdHandler.register = function (args, data) {
        if (args.length == 6) {
            if (isNaN(args)) {
                fChatLibInstance.sendMessage("This is not a valid number, please try again.");
            }
            else
            {
                if (parseInt(args[0]) <= 0 || parseInt(args[1]) <= 0 || parseInt(args[2]) <= 0 || parseInt(args[3]) <= 0 || parseInt(args[4]) <= 0 || parseInt(args[5]) <= 0) {
                    fChatLibInstance.sendMessage("A stat must have a value greater than 0");
                    return;
                }
                var totalPoints = parseInt(args[0]) + parseInt(args[1]) + parseInt(args[2]) + parseInt(args[3]) + parseInt(args[4]) + parseInt(args[5]);
                if (totalPoints != 20) {
                    fChatLibInstance.sendMessage("All your stats combined must be equal to 20. Current value: " + totalPoints);
                    return;
                }
                client.hexists(data.character, "character", function (err, reply) {
                    if (reply == 0) {
                        var statsObj = {};
                        statsObj.character = data.character;
                        statsObj.stats = args;
                        statsObj.strength = parseInt(args[0]);
                        statsObj.toughness = parseInt(args[1]);
                        statsObj.dexterity = parseInt(args[2]);
                        statsObj.agility = parseInt(args[3]);
                        statsObj.flexibility = parseInt(args[4]);
                        statsObj.endurance = parseInt(args[5]);
                        statsObj.maxHp = parseInt(args[1]) * 5;
                        statsObj.maxStamina = parseInt(args[5]) * 5;
                        statsObj.features = "";
                        client.hmset(data.character, statsObj);
                        fChatLibInstance.sendMessage("You've been successfully registered in the list " + data.character);
                    }
                    else {
                        fChatLibInstance.sendMessage("You're already registered " + data.character);
                    }
                });
            }
        }
        else {
            fChatLibInstance.sendMessage("The arguments aren't valid.\nExample: '!register 123455' with 1 being your Strength, 2 your toughness, etc., with 20 points distributed over all.");
        }
    };


    cmdHandler.wrestle = function (args, data) {
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                if (currentFighters.length == 0) {
                    result.hp = parseInt(result.maxHp);
                    result.stamina = parseInt(result.maxStamina);
                    result.lust = 0;
                    result.orgasms = 0;
                    currentFighters[0] = result;
                    currentFighters[0].dice = new Dice(10);
                    fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                }
                else if (currentFighters.length == 1) {
                    if (currentFighters[0].character != data.character) {
                        result.hp = parseInt(result.maxHp);
                        result.stamina = parseInt(result.maxStamina);
                        result.lust = 0;
                        result.orgasms = 0;
                        currentFighters[1] = result;
                        currentFighters[1].dice = new Dice(10);
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
                fChatLibInstance.sendMessage("[b]" + stats.character + "[/b]'s stats" + "\n" +
                    "[b][color=red]Strength[/color][/b]:  " + stats.strength + "      " + "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
                    "[b][color=orange]Toughness[/color][/b]:  " + stats.toughness + "      " + "[b][color=pink]Stamina[/color][/b]: " + stats.maxStamina + "\n" +
                    "[i][color=green]Dexterity[/color][/i]:  " + stats.dexterity + "\n" +
                    "[i][color=cyan]Agility[/color][/i]:    " + stats.agility + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + 0 + " - " + 0 + "\n" +
                    "[b][color=purple]Flexibility[/color][/b]: " + stats.flexibility + "\n" +
                    "[b][color=blue]Endurance[/color][/b]: " + stats.endurance + "\n\n" +
                    "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
            }
            else {
                fChatLibInstance.sendMessage("Are you sure you're registered?");
            }
        });
    };
    cmdHandler.stats = cmdHandler.myStats;

    cmdHandler.addStats = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            var arr = args.split(' ');
            var result = arr.splice(0, 2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if (result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != "") {
                fChatLibInstance.sendMessage("Will add " + parseInt(result[1]) + " points of " + result[0] + " to " + result[2]);
                var newStats = {
                    strength: 0,
                    dexterity: 0,
                    agility: 0,
                    flexibility: 0,
                    endurance: 0,
                    toughness: 0,
                    character: result[2]
                };
                switch (result[0].toLowerCase()) {
                    case "strength":
                        newStats.strength = parseInt(result[1]);
                        break;
                    case "dexterity":
                        newStats.dexterity = parseInt(result[1]);
                        break;
                    case "agility":
                        newStats.agility = parseInt(result[1]);
                        break;
                    case "flexibility":
                        newStats.flexibility = parseInt(result[1]);
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
                        result.dexterity = parseInt(result.dexterity) + newStats.dexterity;
                        result.agility = parseInt(result.agility) + newStats.agility;
                        result.flexibility = parseInt(result.flexibility) + newStats.flexibility;
                        result.endurance = parseInt(result.endurance) + newStats.endurance;
                        result.toughness = parseInt(result.toughness) + newStats.toughness;
                        result.maxHp = parseInt(result.toughness) * 5;
                        result.maxStamina = parseInt(result.endurance) * 5;
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
                    dexterity: 0,
                    agility: 0,
                    flexibility: 0,
                    endurance: 0,
                    toughness: 0,
                    character: result[2]
                };
                switch (result[0].toLowerCase()) {
                    case "strength":
                        newStats.strength = parseInt(result[1]);
                        break;
                    case "dexterity":
                        newStats.dexterity = parseInt(result[1]);
                        break;
                    case "agility":
                        newStats.agility = parseInt(result[1]);
                        break;
                    case "flexibility":
                        newStats.flexibility = parseInt(result[1]);
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
                        result.dexterity = parseInt(result.dexterity) - newStats.dexterity;
                        result.agility = parseInt(result.agility) - newStats.agility;
                        result.flexibility = parseInt(result.flexibility) - newStats.flexibility;
                        result.endurance = parseInt(result.endurance) - newStats.endurance;
                        result.toughness = parseInt(result.toughness) - newStats.toughness;
                        result.maxHp = parseInt(result.toughness) * 5;
                        result.maxStamina = parseInt(result.endurance) * 5;
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

    cmdHandler.getStats = function (args, data) {
        client.hgetall(args, function (err, result) {
            if (result != null) {
                var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
                fChatLibInstance.sendMessage("[b]" + stats.character + "[/b]'s stats" + "\n" +
                    "[b][color=red]Strength[/color][/b]:  " + stats.strength + "      " + "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
                    "[b][color=orange]Toughness[/color][/b]:  " + stats.toughness + "      " + "[b][color=pink]Stamina[/color][/b]: " + stats.maxStamina + "\n" +
                    "[i][color=green]Dexterity[/color][/i]:  " + stats.dexterity + "\n" +
                    "[i][color=cyan]Agility[/color][/i]:    " + stats.agility + "      " + "[b][color=green]Win[/color]/[color=red]Loss[/color] record[/b]: " + 0 + " - " + 0 + "\n" +
                    "[b][color=purple]Flexibility[/color][/b]: " + stats.flexibility + "\n" +
                    "[b][color=blue]Endurance[/color][/b]: " + stats.endurance + "\n\n" +
                    "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
            }
            else {
                fChatLibInstance.sendMessage("Are you sure this user is registered?");
            }
        });
    };

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

    cmdHandler.removeFeature = function (args, data) {
        if (fChatLibInstance.isUserChatOP(data.channel, data.character)) {
            if (args.length > 0) {
                if (checkIfFightIsGoingOn()) {
                    if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                        fChatLibInstance.sendMessage("You can't remove a feature if you're in a fight.");
                        return;
                    }
                }
                var idFeature = findItemIdByTitle(features, args);
                if (idFeature != -1) {
                    client.hgetall(data.character, function (err, result) {
                        if (result != null) {
                            var currentFeatures = parseStringToIntArray(result.features);
                            if (currentFeatures.indexOf(idFeature) != -1) {
                                currentFeatures.splice(currentFeatures.indexOf(idFeature), 1);
                                result.features = currentFeatures.toString();
                                client.hmset(data.character, result);
                                fChatLibInstance.sendMessage("You've successfully removed the [b]" + features[idFeature].title + "[/b] perk.");
                                return;
                            }
                            fChatLibInstance.sendMessage("You don't have the [b]" + features[idFeature].title + "[/b] perk.");
                            return false;
                        }
                        else {
                            fChatLibInstance.sendMessage("Are you sure you're registered?");
                            return false;
                        }
                    });
                }
                else {
                    fChatLibInstance.sendMessage("This feature has not been found. Check the spelling.");
                    return false;
                }

            }
            else {
                fChatLibInstance.sendMessage("You don't have sufficient rights.");
            }
        }
    };

    cmdHandler.escape = function (args, data) {
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                if (isInHold()) {
                    currentFight.actionTaken = "escape";
                    if (currentFight.turn > 0) {
                        if (currentFight.skipRoll) {
                            checkRollWinner();
                        }
                        else {
                            if (hold[currentFight.currentHold.holdId].holdType == "flexibility") { //  For all attacks that do damage based on the flexibility of the victim, the wrestler must use their flexibility to break free and will roll 2d10 + Flexibility v.s the applying wrestler's 2d10 + Strength *or* 2d10 + Flexibility (whichever is higher).
                                currentFighters[currentFight.currentHold.defender].dice.addTmpMod(currentFighters[currentFight.currentHold.defender].flexibility);
                                if (currentFighters[currentFight.currentHold.attacker].flexibility > currentFighters[currentFight.currentHold.attacker].strength) {
                                    currentFighters[currentFight.currentHold.attacker].dice.addTmpMod(currentFighters[currentFight.currentHold.attacker].flexibility);
                                }
                                else {
                                    currentFighters[currentFight.currentHold.attacker].dice.addTmpMod(currentFighters[currentFight.currentHold.attacker].strength);
                                }
                            }
                            roll();
                        }
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
                    currentFight.actionTaken = "escape";
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

    cmdHandler.brawl = function (args, data) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    if (isInHold()) {
                        fChatLibInstance.sendMessage("You are still in a hold. You can either !escape or !tapout (and lose).");
                        return;
                    }
                    var idBrawl = findItemIdByTitle(brawl, args);
                    if (idBrawl != -1) {
                        currentFight.actionTaken = "brawl";
                        currentFight.actionId = idBrawl;
                        if (!getAttackInfo(currentFighters[currentFight.whoseturn], brawl, idBrawl)) {
                            return;
                        }

                        if (currentFight.turn > 0) {
                            if (currentFight.skipRoll) {
                                checkRollWinner();
                            }
                            else {
                                roll();
                            }
                        }
                    }
                    else {
                        fChatLibInstance.sendMessage("This move has not been found. Check the spelling.");
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
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !b kick\nAvailable moves: "+getAllItemsTitleInArray(brawl));
        }
    };
    cmdHandler.hit = cmdHandler.brawl;
    cmdHandler.b = cmdHandler.brawl;

    cmdHandler.sexual = function (args, data) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    if (isInHold()) {
                        fChatLibInstance.sendMessage("You are still in a hold. You can either !escape or !tapout (and lose).");
                        return;
                    }
                    var idSexual = findItemIdByTitle(sexual, args);
                    if (idSexual != -1) {
                        currentFight.actionTaken = "sexual";
                        currentFight.actionId = idSexual;
                        if (!getAttackInfo(currentFighters[currentFight.whoseturn], sexual, idSexual)) {
                            return;
                        }

                        if (currentFight.turn > 0) {
                            if (currentFight.skipRoll) {
                                checkRollWinner();
                            }
                            else {
                                roll();
                            }
                        }
                    }
                    else {
                        fChatLibInstance.sendMessage("This move has not been found. Check the spelling.");
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
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !s slap\nAvailable moves: "+getAllItemsTitleInArray(sexual));
        }
    };
    cmdHandler.lust = cmdHandler.sexual;
    cmdHandler.s = cmdHandler.sexual;
    cmdHandler.sex = cmdHandler.sexual;

    cmdHandler.grapple = function (args, data) {
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    if (isInHold()) {
                        fChatLibInstance.sendMessage("You are still in a hold. You can either !escape or !tapout (and lose).");
                        return;
                    }
                    var idHold = findItemIdByTitle(hold, args);
                    if (idHold != -1) {
                        currentFight.actionTaken = "hold";
                        currentFight.actionId = idHold;
                        if (!getAttackInfo(currentFighters[currentFight.whoseturn], hold, idHold)) {
                            return;
                        }
                        if (currentFight.turn > 0) {
                            if (currentFight.skipRoll) {
                                checkRollWinner();
                            }
                            else {
                                roll();
                            }
                        }
                    }
                    else {
                        fChatLibInstance.sendMessage("This move has not been found. Check the spelling.");
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
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !h Arm Bar\nAvailable moves: "+getAllItemsTitleInArray(holds));
        }
    };
    cmdHandler.h = cmdHandler.grapple;
    cmdHandler.hold = cmdHandler.grapple;
    cmdHandler.holds = cmdHandler.grapple;
    cmdHandler.submission = cmdHandler.grapple;
    cmdHandler.grappling = cmdHandler.grapple;


    return cmdHandler;
};

function min(array) {
    return Math.min.apply(Math, array);
}

function max(array) {
    return Math.max.apply(Math, array);
}

var didYouMean = require('didyoumean');
var redis = require("redis");
var client = redis.createClient(6379, "127.0.0.1");

var features = require(__dirname + '/etc/features.js');
var sextoys = require(__dirname + '/etc/sextoys.js');
var brawl = require(__dirname + '/etc/brawl.js');
var sexual = require(__dirname + '/etc/sexual.js');
var hold = require(__dirname + '/etc/holds.js');
var currentFighters = [];
var currentFight = {turn: -1, whoseturn: -1, isInit: false, orgasms: 0, staminaPenalty: 5, winner: -1, currentHold: {}};
var diceResults = {first: -1, second: -1};

var Dice = require('cappu-dice');
var d10Plus = new Dice(10);

function getAttackInfo(result, type, id) {
    var total = [];
    var attacker = currentFight.whoseturn;
    var defender = (currentFight.whoseturn == 0 ? 1 : 0);

    //check conditions first
    if (type[id].conditions != undefined) {
        var conditionsChecked = eval(type[id].conditions);
        if (conditionsChecked != true) {
            fChatLibInstance.sendMessage("The conditions for this move aren't met: " + type[id].conditionsText);
            return false;
        }
    }


    if (type[id].statRequirements != undefined) {
        for (var i = 0; i < type[id].statRequirements.length; i++) {
            var totalDiff = 0;
            for (var attrname in type[id].statRequirements[i]) {
                var tempDiff = result[attrname] - type[id].statRequirements[i][attrname];
                if (tempDiff < 0) {
                    totalDiff += tempDiff;
                }
            }
            total.push(totalDiff);
        }
    }

    if (total.length >= 1 && max(total) < 0) {
        if (currentFight.whoseturn == 0) {
            currentFighters[0].dice.addTmpMod(max(total));
        }
        else if (currentFight.whoseturn == 1) {
            currentFighters[1].dice.addTmpMod(max(total));
        }
    }

    var strType = "";

    switch (type) {
        case sexual:
            strType = "sexual";
            if(sexual[id].isHold == "true"){
                currentFight.actionTaken = "hold";
            }
            break;
        case brawl:
            strType = "brawl";
            break;
        case hold:
            strType = "holds";
            break;
    }



    if (holdInPlace()) {
        var type;
        if(currentFight.currentHold.type == "sexual"){
            type = sexual;
        }
        else{
            type = hold
        }
        if (type[currentFight.currentHold.holdId].bonusForAttacks != undefined && type[currentFight.currentHold.holdId].bonusRoll != undefined) {
            if (!isNaN(type[currentFight.currentHold.holdId].bonusRoll) && type[currentFight.currentHold.holdId].bonusForAttacks.indexOf(type + ":" + currentFight.actionId) != -1) {
                currentFighters[currentFight.whoseturn].dice.addTmpMod(parseInt(type[currentFight.currentHold.holdId].bonusRoll));
                fChatLibInstance.sendMessage("Added " + type[currentFight.currentHold.holdId].bonusRoll + " to the dice, since the last hold buffs this attack.")
            }
        }
    }

    return true;
}


function getMods() {
    if (checkIfFightIsGoingOn()) {
        fChatLibInstance.sendMessage("\nFirst player dice mods, permanent: " + currentFighters[0].dice.getModsSum() + " and for the next turn: " + currentFighters[0].dice.getTmpModsSum() + "\n"
            + "Second player dice mods, permanent: " + currentFighters[1].dice.getModsSum() + " and for the next turn: " + currentFighters[1].dice.getTmpModsSum());
    }
}

function rollInitiation() {
    fChatLibInstance.sendMessage("\n[b]Let's start![/b]\n\n[b]" + currentFighters[0].character + "[/b]\n\n[color=red]VS[/color]\n\n[b]" + currentFighters[1].character + "[/b]");
    checkFeaturesInit();
    roll();
}

function checkFeaturesInit() {
    var featuresP0 = parseStringToIntArray(currentFighters[0].features);
    var featuresP1 = parseStringToIntArray(currentFighters[1].features);

    var dominated = -1;

    if (featuresP0.indexOf(1) != -1 && featuresP1.indexOf(8) != -1) { //P1 is dom, P2 sub
        currentFighters[1].dice.addMod(-2);
        dominated = 1;
    }
    if (featuresP0.indexOf(8) != -1 && featuresP1.indexOf(1) != -1) { //P2 is dom, P1 sub
        currentFighters[0].dice.addMod(-2);
        dominated = 0;
    }

    if (currentFight.isInit && dominated > -1) {
        fChatLibInstance.sendMessage("\n[b]" + currentFighters[(dominated == 0 ? 1 : 0)].character + "[/b] really has an imposing dominance!\n[b]" + currentFighters[dominated].character + "[/b] feels a bit scared...");
    }
}

function roll() {
    var modFirst = (currentFighters[0].dice.getModsSum() + currentFighters[0].dice.getTmpModsSum());
    var modSecond = (currentFighters[1].dice.getModsSum() + currentFighters[1].dice.getTmpModsSum());
    diceResults.first = currentFighters[0].dice.roll() + d10Plus.roll();
    diceResults.second = currentFighters[1].dice.roll() + d10Plus.roll();
    fChatLibInstance.sendMessage("\n[b]" + currentFighters[0].character + "[/b] rolled a [b]" + diceResults.first + "[/b] " + (modFirst != 0 ? "(" + ((modFirst >= 0 ? "+" : "") + modFirst + " applied)") : "" ) + "\n[b]"
        + currentFighters[1].character + "[/b] rolled a [b]" + diceResults.second + "[/b] " + (modSecond != 0 ? "(" + ((modSecond >= 0 ? "+" : "") + modSecond + " applied)") : "" ));
    // complicated line, but echoes the bonus/malus if present
    checkRollWinner();
}

function checkRollWinner() {
    if (currentFight.skipRoll) {
        currentFighters[currentFight.whoseturn].dice.resetTmpMods();
        if (currentFight.actionTaken == "sexual" || currentFight.actionTaken == "brawl") {
            brawlOrSexualGateway(currentFight.actionTaken, currentFight.actionId);
        }
        else if (currentFight.actionTaken == "hold") {
            holdHandler(currentFight.actionId);
        }
        else if (currentFight.actionTaken == "escape") {
            //success
            fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!\nIt's still " + currentFighters[currentFight.whoseturn].character + "'s turn.");
            currentFight.currentHold.turnsLeft = 0;
            currentFight.currentHold.isInfinite = false;
            return;
        }
        else {
            fChatLibInstance.sendMessage("Was it... lust? a hit?");
        }
        if (currentFight.winner != -1) {
            console.log("winner");
            return;
        }
        currentFight.skipRoll = false;
        currentFight.whoseturn = (currentFight.whoseturn == 0 ? 1 : 0);
        fChatLibInstance.sendMessage("[i][b]" + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "[/b] got a free roll (but the roll was made in case you wanted it), and it's now [b]" + currentFighters[currentFight.whoseturn].character + "[/b]'s turn to emote their reaction/attack.[/i]");
        nextTurn();
        return;
    }

    currentFight.skipRoll = false;

    if (diceResults.first != -1 && diceResults.second != -1) {
        if (diceResults.first > diceResults.second) {
            checkDiceRollWinner(0);
        }
        if (diceResults.second > diceResults.first) {
            checkDiceRollWinner(1);
        }
        if (diceResults.first == diceResults.second) {
            roll();
        }

    }
}

function checkDiceRollWinner(idWinner) {
    if (currentFight.isInit) {
        currentFight.isInit = false;
        fChatLibInstance.sendMessage("[i]" + currentFighters[idWinner].character + " emotes the attack first.[/i]");
        currentFight.whoseturn = idWinner;
    }
    else {
        fChatLibInstance.sendMessage("[b]" + currentFighters[idWinner].character + " wins the roll.[/b]");
        //attack process
        if (currentFight.whoseturn == idWinner) { // si c'était deja a lui, alors attaque destructrice et on change pas de tour
            //hit
            currentFighters[currentFight.whoseturn].dice.resetTmpMods();
            if (currentFight.actionTaken == "sexual" || currentFight.actionTaken == "brawl") {
                brawlOrSexualGateway(currentFight.actionTaken, currentFight.actionId);
            }
            else if (currentFight.actionTaken == "hold") {
                holdHandler(currentFight.actionId);
            }
            else if (currentFight.actionTaken == "escape") {
                //success
                currentFight.currentHold.turnsLeft = 0;
                currentFight.currentHold.isInfinite = false;
                fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!");
                return;
            }
            else {
                fChatLibInstance.sendMessage("Was it... lust? a hit?");
            }
        }
        else { //si ce n'était pas a lui, garde super efficace et on change de tour
            //failed
            missHandler((idWinner == 0 ? 1 : 0));
        }
        if (currentFight.winner != -1) { // FIGHT GETS RESETED BEFORE ANYTHING
            return;
        }

        var difference;
        if (idWinner == 0) {
            difference = diceResults.first - diceResults.second;
        }
        else {
            difference = diceResults.second - diceResults.first;
        }
        if (difference >= 10) {
            currentFight.skipRoll = true;
            if (currentFight.whoseturn == idWinner) { // si c'était deja a lui, alors attaque destructrice et on change pas de tour
                fChatLibInstance.sendMessage("[i][b]" + currentFighters[idWinner].character + "[/b] just landed a super effecitve attack! [b]" + currentFighters[idWinner].character + "[/b] have their roll-less, free [b]attack[/b].[/i]");
            }
            else { //si ce n'était pas a lui, garde super efficace et on change de tour
                fChatLibInstance.sendMessage("[i][b]" + currentFighters[idWinner].character + "[/b] successfully blocked/dodged the attack, letting [b]" + currentFighters[idWinner].character + "[/b] have their roll-less, free [b]counter[/b]. (still have to !roll at the end of the emote)[/i]");
                currentFight.whoseturn = idWinner;
            }
        }
        else {
            if (currentFight.whoseturn == idWinner) { // si c'était deja a lui, alors on change la main vu qu'il n'a pas fait de score >= 10
                currentFight.whoseturn = (idWinner == 0 ? 1 : 0);
                fChatLibInstance.sendMessage("[i]It's now [b]" + currentFighters[currentFight.whoseturn].character + "[/b]'s turn to emote their reaction/attack.[/i]");
            }
            else { //si ce n'était pas a lui mais qu'il a gagné le roll, !counter! et on lui rend la main
                if (idWinner == 0) {
                    currentFighters[0].dice.addTmpMod(difference <= 5 ? difference : 5);
                }
                else {
                    currentFighters[1].dice.addTmpMod(difference <= 5 ? difference : 5);
                }
                fChatLibInstance.sendMessage("[i][b]" + currentFighters[idWinner].character + "[/b] successfully blocked/dodged the attack, and gets a +" + (difference <= 5 ? difference : 5) + " advantage on the next roll.[/i]");
                currentFight.whoseturn = idWinner;
            }
        }
    }
    nextTurn();
}

function missHandler(idPlayer) {
    fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] missed their attack![/i]");
    if (currentFight.actionTaken == "sexual" || currentFight.actionTaken == "brawl") {
        failHandler(currentFight.actionTaken, currentFight.actionId);
    }
    if (currentFight.actionTaken == "escape") {
        currentFighters[idPlayer].dice.addTmpMod(1)
    }
    currentFighters[idPlayer].dice.addTmpMod(2, 10);
    fChatLibInstance.sendMessage("[i][b]" + currentFighters[idPlayer].character + "[/b] got +2 added to their next dice roll.[/i]");
}

function failHandler(stringType, id) {
    var type;

    switch (stringType) {
        case "sexual":
            type = sexual;
            break;
        case "brawl":
            type = brawl;
            break;
        case "hold":
            type = hold;
            break;
    }

    if (type[id].penalty != undefined) {
        eval(type[id].penalty);
        fChatLibInstance.sendMessage(type[id].penaltyText);
    }
}

function holdHandler(id, type) {
    var strAttack = "[b]" + currentFighters[currentFight.whoseturn].character + "[/b] has";
    var type;
    switch (type) {
        case "sexual":
            type = sexual;
            break;
        case "hold":
            type = hold;
            break;
        default:
            type = hold;
            break;
    }

    if (type[id].damageHP != undefined || type[id].damageLust != undefined) {
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

        var attacker = currentFight.whoseturn;
        var defender = (currentFight.whoseturn == 0 ? 1 : 0);
        var turns = 0;
        var isInfinite = false;
        if(type[id].maxTurns != undefined){
            turns = type[id].maxTurns;
        }
        else{
            isInfinite = true;
        }

        var newTurnsLeft = parseInt(currentFight.currentHold.turnsLeft) + parseInt(turns);
        var newDamageHP = parseInt(currentFight.currentHold.damageHP);
        if(type[id].damageHP != undefined && !isNaN(type[id].damageHP)){
            newDamageHP += parseInt(eval(type[id].damageHP));
        }
        var newDamageLust = parseInt(currentFight.currentHold.damageLust);
        if(type[id].damageLust != undefined && !isNaN(type[id].damageLust)){
            newDamageLust += parseInt(eval(type[id].damageLust));
        }
        currentFight.currentHold = {
            holdId: id,
            holdName: type[id].title,
            turnsLeft: newTurnsLeft,
            damageHP: newDamageHP,
            damageLust: newDamageLust,
            attacker: attacker,
            defender: defender,
            isInfinite: isInfinite,
            type: type
        }
        //fChatLibInstance.sendMessage("Hold established: "+JSON.stringify(currentFight.currentHold));
        strAttack += " applied " + type[id].title;
        fChatLibInstance.sendMessage(strAttack);
    }
}

function brawlOrSexualGateway(stringType, id) {
    var type;

    switch (stringType) {
        case "sexual":
            type = sexual;
            if(type[id].isHold == "True" || type[id].isHold == "true"){
                holdHandler(id, "sexual");
                return;
            }
            break;
        case "brawl":
            type = brawl;
            break;
    }

    attackHandler(type[id].damageHP, type[id].damageLust, type[id].hpPenalty, type[id].lustPenalty)
}

function attackHandler(damageHP, damageLust, hpPenalty, lustPenalty, attacker, defender) {
    var hpRemoved = 0,
        lustAdded = 0,
        ownLustAdded = 0,
        ownHpRemoved = 0;

    if (attacker == undefined) {
        attacker = currentFight.whoseturn;
    }
    if (defender == undefined) {
        defender = (currentFight.whoseturn == 0 ? 1 : 0);
    }

    var strAttack = "[b]" + currentFighters[attacker].character + "[/b] has";

    var featuresVictim = parseStringToIntArray(currentFighters[defender].features);
    var featuresAttacker = parseStringToIntArray(currentFighters[attacker].features);


    if (damageHP != undefined && damageHP != 0) {
        hpRemoved = eval(damageHP);
        if(hpRemoved <= 0){
            hpRemoved = 1;
        }


        var hpBeforeAttack = currentFighters[defender].hp;

        //if (featuresVictim.indexOf(6) != -1 || featuresVictim.indexOf(7) != -1) { //stripped
        //    hpRemoved++;
        //    fChatLibInstance.sendMessage(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s outfit is a bit too revealing for an attack like that, and takes [b]1[/b] more damage from that attack!");
        //}
        //
        //if (featuresAttacker.indexOf(7) != -1) { //stripped
        //    hpRemoved--;
        //    fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + "'s outfit is a bit too embarrassing! Their attack removes one less HP...");
        //}


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
        strAttack += " removed " + hpRemoved + " HP"
    }


    if (damageLust != undefined && damageLust != 0) {
        lustAdded = eval(damageLust);

        if (featuresAttacker.indexOf(5) != -1 || featuresVictim.indexOf(5) != -1) { // cum slut
            lustAdded += 1;
        }

        if (lustAdded <= 0) { //attack can't do 0 dmg
            lustAdded = 1;
        }
        currentFighters[defender].lust += lustAdded;
        strAttack += " added " + lustAdded + " Lust point"
    }

    strAttack += " to [b]" + currentFighters[defender].character + "[/b]";


    if ((hpPenalty != undefined && hpPenalty != 0) || (lustPenalty != undefined && lustPenalty != 0)) {
        strAttack += "\nThey also"
        if (lustPenalty != undefined) {
            ownLustAdded = eval(lustPenalty);
            currentFighters[attacker].lust += ownLustAdded;
            strAttack += " gained " + ownLustAdded + " lust point";
        }

        if (hpPenalty != undefined) {
            ownHpRemoved = eval(hpPenalty);
            currentFighters[attacker].hp -= ownHpRemoved;
            strAttack += " lost " + ownHpRemoved + " HP"
        }
        strAttack += " in the process!";
    }


    fChatLibInstance.sendMessage(strAttack);

    checkLifePoints();
}

function nextTurn() {
    tickHold();
    currentFight.turn++;

    var featuresP0 = parseStringToIntArray(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].features);
    var featuresP1 = parseStringToIntArray(currentFighters[currentFight.whoseturn].features);

    //if(featuresP0.indexOf(6) != -1 || featuresP1.indexOf(6) != -1){
    //    fChatLibInstance.sendMessage("[i]It looks like we've got an exhibitionist inside the ring...[/i] [b]"+currentFighters[currentFight.whoseturn].character+"[/b] is quite aroused by the scene!");
    //    currentFighters[currentFight.whoseturn].lust++;
    //    checkLifePoints();
    //}
    //
    //if(featuresP0.indexOf(7) != -1){ //stripped down
    //    fChatLibInstance.sendMessage("[b]"+currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character+"[/b] is looking quite hot in that 'outfit'! [b]"+currentFighters[currentFight.whoseturn].character+"[/b] can't take their eyes off them!");
    //    currentFighters[currentFight.whoseturn].lust++;
    //    checkLifePoints();
    //}

    broadcastCombatInfo();
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

        attackHandler(currentFight.currentHold.damageHP, currentFight.currentHold.damageLust, currentFight.currentHold.hpPenalty, currentFight.currentHold.lustPenalty, currentFight.currentHold.attacker, currentFight.currentHold.defender);
        if (currentFight.currentHold.turnsLeft <= 0 && currentFight.currentHold.isInfinite == false) {
            fChatLibInstance.sendMessage(currentFighters[currentFight.currentHold.defender].character + " is finally out of the " + currentFight.currentHold.holdName + "!");
        }
    }
}

function holdInPlace() {
    return (typeof currentFight.currentHold == "object" && (currentFight.currentHold.turnsLeft != undefined && currentFight.currentHold.turnsLeft > 0) || (currentFight.currentHold.isInfinite != undefined && currentFight.currentHold.isInfinite == true));
}

function isInHold(whoseTurn) {
    if(whoseTurn == undefined){
        whoseTurn = currentFight.whoseturn;
    }
    if (holdInPlace() && currentFight.currentHold.defender == currentFight.whoseturn) {
        return true;
    }
    return false;
}

function resetFight() {
    currentFighters = [];
    currentFight = {turn: -1, whoseturn: -1, isInit: false, orgasms: 0, staminaPenalty: 5, winner: -1};
    diceResults = {first: -1, second: -1};
}

function startFight() {
    currentFight.turn = 0;
    currentFight.isInit = true;
    setTimeout(rollInitiation(), 2500);
}

function triggerOrgasm(id) {
    currentFighters[id].lust = 0;
    currentFighters[id].orgasms++;

    var featuresP0 = parseStringToIntArray(currentFighters[id].features);
    if (featuresP0.indexOf(0) != -1) {
        currentFighters[id].endurance = 1;
    }
    else if (featuresP0.indexOf(2) != -1) {
        if (currentFighters[id].endurance > 1) {
            currentFighters[id].endurance--;
        }
    }
    else {
        currentFighters[id].endurance++;
    }

    if (featuresP0.indexOf(2) != -1) {
        currentFighters[id].stamina -= Math.floor(0.8 * currentFight.staminaPenalty);
        fChatLibInstance.sendMessage(currentFighters[id].character + " is multi-orgasmic! The stamina penalty has been reduced by one, but their endurance has decreased by 1.");
    }
    else {
        currentFighters[id].stamina -= currentFight.staminaPenalty;
    }

    var featuresP1 = parseStringToIntArray(currentFighters[(id == 0 ? 1 : 0)].features);
    if (featuresP1.indexOf(5) != -1) { //cum slut
        currentFighters[(id == 0 ? 1 : 0)].lust++;
    }

    currentFight.orgasms++;
    broadcastOrgasm(id);
}

function checkLifePoints() {
    //test
    if (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].lust >= currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].endurance) {
        triggerOrgasm((currentFight.whoseturn == 0 ? 1 : 0));
    }
    if (currentFighters[currentFight.whoseturn].lust >= currentFighters[currentFight.whoseturn].endurance) {
        triggerOrgasm(currentFight.whoseturn);
    }
    if (currentFighters[0].hp <= 0) {
        currentFighters[0].hp = 0;
        currentFight.winner = 1;
    }
    if (currentFighters[1].hp <= 0) {
        currentFighters[1].hp = 0;
        currentFight.winner = 0;
    }
    if (currentFighters[0].stamina <= 0) {
        currentFighters[0].stamina = 0;
        currentFight.winner = 1;
    }
    if (currentFighters[1].stamina <= 0) {
        currentFighters[1].stamina = 0;
        currentFight.winner = 0;
    }


    if (currentFight.winner > -1) {
        //winner!
        fChatLibInstance.sendMessage("[b]After  #" + currentFight.turn + " turns[/b] and [b]" + currentFight.orgasms + " orgasms[/b]\n" +
            "[b]" + currentFighters[currentFight.winner].character + "[/b] has finally took " + currentFighters[(currentFight.winner == 0 ? 1 : 0)].character + " down!\nCongrats to the winner!"
        );
        setTimeout(resetFight, 2500);
    }

}

function broadcastCombatInfo() {
    if (checkIfFightIsGoingOn()) {
        fChatLibInstance.sendMessage(
            "\n" +
            "[b]Turn #" + currentFight.turn + "[/b] --------------- It's [b][u][color=pink]" + currentFighters[currentFight.whoseturn].character + "[/color][/u][/b]'s turn.\n\n" +
            (currentFighters.length > 0 ? "[b]" + currentFighters[0].character + ": [/b]" + currentFighters[0].hp + "/" + currentFighters[0].maxHp + " HP  |  " + currentFighters[0].stamina + "/" + currentFighters[0].maxStamina + " Stamina  |  " + currentFighters[0].lust + "/" + currentFighters[0].endurance + " Lust  |  " + currentFighters[0].orgasms + " Orgasms\n" : "") +
            (currentFighters.length > 1 ? "[b]" + currentFighters[1].character + ": [/b]" + currentFighters[1].hp + "/" + currentFighters[1].maxHp + " HP  |  " + currentFighters[1].stamina + "/" + currentFighters[1].maxStamina + " Stamina  |  " + currentFighters[1].lust + "/" + currentFighters[1].endurance + " Lust  |  " + currentFighters[1].orgasms + " Orgasms" : "")
        );
    }
    else {
        fChatLibInstance.sendMessage("There is no match going on at the moment.");
    }
}

function broadcastOrgasm(id) {
    fChatLibInstance.sendMessage("[b]" + currentFighters[id].character + ": [/b] couldn't take it anymore, seems like someone's going to cum!\n[color=red]Orgasm count:[/color] " + currentFighters[id].orgasms + "\n");
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