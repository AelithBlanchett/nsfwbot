var fChatLibInstance;

module.exports = function (parent, args) {
    fChatLibInstance = parent;
    var cmdHandler = {};

    client.on("error", function (err) {
        console.log("Redis error " + err);
    });

    cmdHandler.hp = cmdHandler.current = cmdHandler.status = cmdHandler.stamina = function(args, data){
        broadcastCombatInfo();
    }

    cmdHandler.sextoys = cmdHandler.toys = function(){
        var toy = getRandomSextoy();
        fChatLibInstance.sendMessage("Here, take this [b]"+toy+"[/b]!");
    }

    cmdHandler.register = function(args,data){
        if (args.length == 6) {
            if (isNaN(args)) { fChatLibInstance.sendMessage("This is not a valid number, please try again."); return;}
            else {
                if (parseInt(args[0]) <= 0 || parseInt(args[1]) <= 0 || parseInt(args[2]) <= 0 || parseInt(args[3]) <= 0 || parseInt(args[4]) <= 0 || parseInt(args[5]) <= 0) {
                    fChatLibInstance.sendMessage("A stat must have a value greater than 0");
                    return;
                }
                var totalPoints = parseInt(args[0]) + parseInt(args[1]) + parseInt(args[2]) + parseInt(args[3]) + parseInt(args[4]) + parseInt(args[5]);
                if (totalPoints != 20) {
                    fChatLibInstance.sendMessage("All your stats combined must be equal to 20. Current value: "+totalPoints);
                    return;
                }
                client.hexists(data.character, "character", function (err, reply) {
                    console.log(reply);
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
    }



    cmdHandler.ready = cmdHandler.fight = cmdHandler.wrestle = function(args,data){
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                if (currentFighters.length == 0) {
                    result.hp = parseInt(result.maxHp);
                    result.stamina = parseInt(result.maxStamina);
                    result.lust = 0;
                    result.orgasms = 0;
                    currentFighters[0] = result;
                    fChatLibInstance.sendMessage(data.character + " is the first one to step in the ring, ready to fight! Who will be the lucky opponent?");
                }
                else if (currentFighters.length == 1) {
                    if (currentFighters[0].character != data.character) {
                        result.hp = parseInt(result.maxHp);
                        result.stamina = parseInt(result.maxStamina);
                        result.lust = 0;
                        result.orgasms = 0;
                        currentFighters[1] = result;
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
    }

    cmdHandler.leavefight = cmdHandler.forfeit = cmdHandler.unready = cmdHandler.exit = function(args,data){
        if (currentFighters.length > 0) {
            if ((currentFighters.length > 0 && currentFighters[0] != undefined && currentFighters[0].character == data.character) || (currentFighters.length > 1 && currentFighters[1] != undefined && currentFighters[1].character == data.character)) {
                fChatLibInstance.sendMessage("You have been removed from the next fight.");
                resetFight();
            }
            else {
                fChatLibInstance.sendMessage("You are not in a fight.");
            }
        }
        else {
            fChatLibInstance.sendMessage("There isn't any fight going on at the moment.");
        }
    }

    cmdHandler.deleteProfile = function(args,data){
        if (checkIfFightIsGoingOn()) {
            if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                fChatLibInstance.sendMessage("You can't add remove your profile if you're in a fight.");
                return;
            }
        }
        client.del(data.character, function (err, result) {
            if (result == 1) {
                fChatLibInstance.sendMessage("All your stats have been deleted. Thank you for playing!");
            }
            else {
                fChatLibInstance.sendMessage("This profile hasn't been found in the database.");
            }
        });
    }

    cmdHandler.myStats = function(args,data){
        client.hgetall(data.character, function (err, result) {
            if (result != null) {
                var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
                fChatLibInstance.sendMessage("[b]" + stats.character + ":[/b]" + "\n" +
                    "[b][color=red]Strength[/color][/b]: " + stats.strength + "\n" +
                    "[b][color=orange]Toughness[/color][/b]: " + stats.toughness + "\n" +
                    "[i][color=green]Dexterity[/color][/i]: " + stats.dexterity + "\n" +
                    "[i][color=cyan]Agility[/color][/i]: " + stats.agility + "\n" +
                    "[b][color=purple]Flexibility[/color][/b]: " + stats.flexibility + "\n" +
                    "[b][color=blue]Endurance[/color][/b]: " + stats.endurance + "\n\n" +
                    "[b][color=red]Health[/color][/b]: " + stats.maxHp + "\n" +
                    "[b][color=pink]Stamina[/color][/b]: " + stats.maxStamina + "\n\n"+
                    "[b][color=red]Perks[/color][/b]:[b]" + getFeaturesListString(stats.features) + "[/b]");
            }
            else {
                fChatLibInstance.sendMessage("Are you sure you're registered?");
            }
        });
    }

    cmdHandler.addStats = function(args,data) {
        if(fChatLibInstance.isUserChatOP(data.channel, data.character)){
            arr = args.split(' '),
            result = arr.splice(0,2);
            result.push(arr.join(' ')); //split the string (with 3 arguments) only in 3 parts (stat, number, character)

            if(result.length == 3 && result[0] != "" && !isNaN(result[1]) && result[2] != ""){
                fChatLibInstance.sendMessage("Will add "+parseInt(result[1])+" points of "+result[0]+" to "+result[2]);
                var newStats = {strength: 0, dexterity: 0, agility: 0, flexibility: 0, endurance: 0, toughness: 0, character: result[2]};
                switch(result[0].toLowerCase()){
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
                        client.hmset(newStats.character, result);
                        fChatLibInstance.sendMessage("Succesfully added the new points!");
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure this user is registered?");
                    }
                });
            }
            else{
                fChatLibInstance.sendMessage("Invalid syntax. Correct is: !addStats STAT X CHARACTER. Example: !addStats Strength 1 ThatCharacter");
            }

        }
    }

    cmdHandler.stats = function(args,data){
        client.hgetall(args, function (err, result) {
            if (result != null) {
                var stats = result; //Health is (Toughness x 5) while Stamina is (Endurance x 5)
                fChatLibInstance.sendMessage("[b]" + stats.character + ":[/b]" + "\n" +
                    "[b][color=red]Strength: [/color][/b]" + stats.strength + "\n" +
                    "[b][color=red]Toughness: [/color][/b]" + stats.toughness + "\n" +
                    "[b][color=red]Dexterity: [/color][/b]" + stats.dexterity + "\n" +
                    "[b][color=red]Agility: [/color][/b]" + stats.agility + "\n" +
                    "[b][color=red]Flexibility: [/color][/b]" + stats.flexibility + "\n" +
                    "[b][color=red]Endurance: [/color][/b]" + stats.endurance + "\n\n" +
                    "[b][color=red]Health: [/color][/b]" + stats.maxHp + "\n" +
                    "[b][color=red]Stamina: [/color][/b]" + stats.maxStamina + "\n\n"+
                    "[b][color=red]Perks #: [/color][/b]" + stats.features.toString());
            }
            else {
                fChatLibInstance.sendMessage("Are you sure this user is registered?");
            }
        });
    }

    cmdHandler.addFeature = function(args,data){
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    fChatLibInstance.sendMessage("You can't add a feature if you're in a fight.");
                    return;
                }
            }
            var idFeature = findItemIdByTitle(features,args);
            if (idFeature != -1) {
                client.hgetall(data.character, function (err, result) {
                    if (result != null) {
                        var currentFeatures = parseStringToIntArray(result.features);
                        if (currentFeatures.indexOf(idFeature) == -1) {
                            if (features[idFeature].incompatibility != undefined) {
                                if (currentFeatures.indexOf(features[idFeature].incompatibility) != -1) {
                                    fChatLibInstance.sendMessage("You cannot add this feature if you've already got [b]"+ features[features[idFeature].incompatibility].title +"[/b]");
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
                    else {
                        fChatLibInstance.sendMessage("Are you sure you're registered?");
                        return;
                    }
                });
            }
            else {
                fChatLibInstance.sendMessage("This feature has not been found. Check the spelling.");
                return;
            }

        }
    }

    cmdHandler.removeFeature = function(args,data){
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (currentFighters[0].character == data.character || currentFighters[1].character == data.character) {
                    fChatLibInstance.sendMessage("You can't remove a feature if you're in a fight.");
                    return;
                }
            }
            var idFeature = findItemIdByTitle(features,args);
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
                        return;
                    }
                    else {
                        fChatLibInstance.sendMessage("Are you sure you're registered?");
                        return;
                    }
                });
            }
            else {
                fChatLibInstance.sendMessage("This feature has not been found. Check the spelling.");
                return;
            }

        }
    }

    cmdHandler.hit = function(args,data){
        if (checkIfFightIsGoingOn()) {
            if (isNaN(args)) { fChatLibInstance.sendMessage("The syntax is wrong, please try again."); return; }
            else {
                if (args == "" || parseInt(args) <= 0 || parseInt(args) > 9) {
                    fChatLibInstance.sendMessage("This isn't a correct value...");
                    return;
                }
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    currentFight.actionTaken = "hit";
                    currentFight.actionPoints = parseInt(args);
                    if (currentFight.turn > 0) {
                        roll();
                    }
                }
                else {
                    fChatLibInstance.sendMessage("It's not your turn to attack.");
                }

            }
        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }
    }

    cmdHandler.escape = cmdHandler.escapeHold = function(args,data){
        if (checkIfFightIsGoingOn()) {
            if (data.character == currentFighters[currentFight.whoseturn].character) {
                currentFight.actionTaken = "escape";
                if (currentFight.turn > 0) {
                    roll();
                }
            }
            else {
                fChatLibInstance.sendMessage("It's not your turn to attack.");
            }

        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }
    }

    cmdHandler.b = cmdHandler.brawl = function(args,data){
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    var idBrawl = findItemIdByTitle(brawl,args);
                    if (idBrawl != -1) {
                        var dmg = eval(brawl[idBrawl].damageHP);
                        if(dmg <= 0){ dmg = 1;}
                        fChatLibInstance.sendMessage("[b]Brawl move found: " + brawl[idBrawl].title + "[/b].\n" +
                            "[b]Brawl move requirements: " + JSON.stringify(brawl[idBrawl].requirements) + "[/b].\n" +
                            "[b]Brawl move HP removal: " + dmg + "[/b].");
                        client.hgetall(data.character, function (err, result) {
                            if (result != null) {
                                var total = [];

                                for(var i = 0; i < brawl[idBrawl].requirements.length; i++){
                                    var totalDiff = 0;
                                    for (var attrname in brawl[idBrawl].requirements[i])
                                    {
                                        var tempDiff = result[attrname] - brawl[idBrawl].requirements[i][attrname];
                                        if(tempDiff < 0){ totalDiff += tempDiff;}
                                    }
                                    total.push(totalDiff);
                                    fChatLibInstance.sendMessage("Requirements #"+i+" difference: "+totalDiff);
                                }

                                if(max(total) < 0){
                                    fChatLibInstance.sendMessage("Dice penalty: "+max(total));
                                    if(currentFight.whoseturn == 0){
                                        currentFight.firstBonusRoll += ""+max(total);
                                        fChatLibInstance.sendMessage("bonus added: "+currentFight.firstBonusRoll);
                                    }
                                    else if(currentFight.whoseturn == 1){
                                        currentFight.secondBonusRoll += ""+ max(total);
                                        fChatLibInstance.sendMessage("bonus added: "+currentFight.secondBonusRoll);
                                    }
                                }

                                //roll for turn
                                currentFight.actionTaken = "hit";
                                currentFight.actionPoints = parseInt(dmg);


                                if (currentFight.turn > 0) {
                                    roll();
                                }
                            }
                            else {

                            }
                        });
                    }
                    else {
                        fChatLibInstance.sendMessage("This move has not been found. Check the spelling.");
                    }
                }
                else if(data.character == currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character) {
                    fChatLibInstance.sendMessage("It's not your turn to attack.");
                }
                else {
                    fChatLibInstance.sendMessage("You're not in the fight.");
                }

            }


        }
        else{
            //available commands
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !brawl punch");
        }
    }

    cmdHandler.s = cmdHandler.sex = cmdHandler.sexual = function(args,data){
        if (args.length > 0) {
            if (checkIfFightIsGoingOn()) {
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    var idSexual = findItemIdByTitle(sexual, args);
                    if (idSexual != -1) {
                        var dmg = eval(sexual[idSexual].damageLust);
                        if(dmg <= 0){ dmg = 1;}
                        fChatLibInstance.sendMessage("[b]Sexual move found: " + sexual[idSexual].title + "[/b].\n" +
                            "[b]Sexual move requirements: " + JSON.stringify(sexual[idSexual].requirements) + "[/b].\n" +
                            "[b]Sexual move Lust added: " + dmg + "[/b].");
                        client.hgetall(data.character, function (err, result) {
                            if (result != null) {
                                var total = [];

                                for(var i = 0; i < sexual[idSexual].requirements.length; i++){
                                    var totalDiff = 0;
                                    for (var attrname in sexual[idSexual].requirements[i])
                                    {
                                        var tempDiff = result[attrname] - sexual[idSexual].requirements[i][attrname];
                                        if(tempDiff < 0){ totalDiff += tempDiff;}
                                    }
                                    total.push(totalDiff);
                                    //fChatLibInstance.sendMessage("Requirements #"+i+" difference: "+totalDiff);
                                }

                                if(max(total) < 0){
                                    fChatLibInstance.sendMessage("Dice penalty: "+max(total));
                                    if(currentFight.whoseturn == 0){
                                        currentFight.firstBonusRoll += ""+max(total);
                                        fChatLibInstance.sendMessage("bonus added: "+currentFight.firstBonusRoll);
                                    }
                                    else if(currentFight.whoseturn == 1){
                                        currentFight.secondBonusRoll += ""+ max(total);
                                        fChatLibInstance.sendMessage("bonus added: "+currentFight.secondBonusRoll);
                                    }
                                }

                                //roll for turn
                                currentFight.actionTaken = "lust";
                                currentFight.actionPoints = parseInt(dmg);


                                if (currentFight.turn > 0) {
                                    roll();
                                }
                            }
                            else {

                            }
                        });
                    }
                    else {
                        fChatLibInstance.sendMessage("This move has not been found. Check the spelling.");
                    }
                }
                else if(data.character == currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character) {
                    fChatLibInstance.sendMessage("It's not your turn to attack.");
                }
                else {
                    fChatLibInstance.sendMessage("You're not in the fight.");
                }

            }


        }
        else{
            //available commands
            fChatLibInstance.sendMessage("This command requires one argument. Check the page for more information. Example: !brawl punch");
        }
    }

    cmdHandler.lust = function(args,data){
        if (checkIfFightIsGoingOn()) {
            if (isNaN(args)) { fChatLibInstance.sendMessage("The syntax is wrong, please try again."); return;}
            else {
                if (parseInt(args) <= 0 || parseInt(args) > 9) {
                    fChatLibInstance.sendMessage("This isn't a correct value...");
                    return;
                }
                if (data.character == currentFighters[currentFight.whoseturn].character) {
                    currentFight.actionTaken = "lust";
                    currentFight.actionPoints = parseInt(args);
                    if (currentFight.turn > 0) {
                        roll();
                    }
                }
                else if(data.character == currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character) {
                    fChatLibInstance.sendMessage("It's not your turn to attack.");
                }
                else {
                    fChatLibInstance.sendMessage("You're not in the fight.");
                }

            }
        }
        else {
            fChatLibInstance.sendMessage("There isn't a match going on at the moment.");
        }

    }

    cmdHandler.testExtended = function(){
        testExtended();
    }

    cmdHandler.rollTest = function(){
        fChatLibInstance.roll("2d10+0");
    }


    cmdHandler.date = function (args, data) {
        fChatLibInstance.sendMessage("It is "+this.myString);
    };


    fChatLibInstance.addRollListener(rollListener);

    return cmdHandler;
};

function min(array) {
    return Math.min.apply(Math, array);
}

function max(array){
    return Math.max.apply(Math, array);
}

var date = getDateTime();

var redis = require("redis");
var client = redis.createClient(6379, "127.0.0.1");

var features = require(__dirname+'/etc/features.js');
var sextoys = require(__dirname+'/etc/sextoys.js');
var brawl = require(__dirname+'/etc/brawl.js');
var sexual = require(__dirname+'/etc/sexual.js');
var currentFighters = [];
var currentFight = { turn: -1, whoseturn: -1, isInit: false, orgasms: 0, firstBonusRoll: "", secondBonusRoll: "", staminaPenalty: 5, winner: -1  };
var diceResults = { first: -1, second: -1 };
var waitingForFirstResult = false;
var waitingForSecondResult = false;



function rollListener(parent, args){
    if (args.character == parent.config.character && args.channel == parent.roomName && args.type == "dice") {
        if (waitingForFirstResult) {
            diceResults.first = args.endresult;
            waitingForFirstResult = false;
        }
        else if (waitingForSecondResult) {
            diceResults.second = args.endresult;
            waitingForSecondResult = false;
            checkRollWinner();
        }

    }
}


function testExtended(){
    fChatLibInstance.sendMessage("[b]OK![/b]");
}

function rollInitiation(){
    fChatLibInstance.sendMessage("[b]Let's start![/b]\nThe first roll will be attributed to:\n[b]"+currentFighters[0].character+"[/b]\n\nAnd the second one will be for:\n[b]"+currentFighters[1].character+"[/b]");
    roll("1d10");
}

function checkRollFeatures(bonusRoll){
    var featuresP0 = parseStringToIntArray(currentFighters[0].features);
    var featuresP1 = parseStringToIntArray(currentFighters[1].features);

    var dominated = -1;

    if (currentFight.firstBonusRoll == undefined) { currentFight.firstBonusRoll = ""; }
    if (currentFight.secondBonusRoll == undefined) { currentFight.secondBonusRoll = ""; }

    if (featuresP0.indexOf(1) != -1 && featuresP1.indexOf(1) == -1) { //P1 is dom, P2 sub
        currentFight.secondBonusRoll += "-1";
        dominated = 1;
    }
    if (featuresP0.indexOf(1) == -1 && featuresP1.indexOf(1) != -1) { //P2 is dom, P1 sub
        currentFight.firstBonusRoll += "-1";
        dominated = 0;
    }

    if (currentFight.isInit && dominated > -1) {
        fChatLibInstance.sendMessage("[b]"+currentFighters[(dominated == 0 ? 1 : 0)].character+"[/b] really has an imposing dominance!\n[b]" + currentFighters[dominated].character + "[/b] feels a bit scared...");
    }
    return bonusRoll;
}

function roll(custom){
    checkRollFeatures();
    var myOriginalDice = "2d10";
    myDice = custom || myOriginalDice;
    if (myDice == myOriginalDice && currentFight.firstBonusRoll != "") {
        myDice = myOriginalDice + "" + currentFight.firstBonusRoll;
    }
    waitingForFirstResult = true;
    fChatLibInstance.roll(myDice);

    myDice = custom || myOriginalDice;
    if (myDice == myOriginalDice && currentFight.secondBonusRoll != "") {
        myDice = myOriginalDice + "" + currentFight.secondBonusRoll; //TODO: garder bonus sur rejouer
    }
    waitingForSecondResult = true;
    fChatLibInstance.roll(myDice);
    //rollwinner is checked while RLL event is triggered.
}

function checkRollWinner() {
    if (currentFight.skipRoll) {
        if (currentFight.actionTaken == "hit") {
            attackHP(currentFight.actionPoints);
        }
        else if (currentFight.actionTaken == "lust") {
            attackLust(currentFight.actionPoints);
        }
        else if (currentFight.actionTaken == "escape") {
            //success
            fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!");
        }
        else {
            fChatLibInstance.sendMessage("Was it... lust? a hit?");
        }
        if (currentFight.winner != -1) {
            console.log("winner");
            return;
        }
        currentFight.skipRoll = false;
        fChatLibInstance.sendMessage("[i][b]" + currentFighters[currentFight.whoseturn].character + "[/b] got a free roll (but the roll was made in case you wanted it), and it's now [b]" + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "[/b]'s turn to emote their reaction/attack.[/i]");
        currentFight.whoseturn = (currentFight.whoseturn == 0 ? 1 : 0);
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
            if (currentFight.isInit) {
                roll("1d10");
            }
            else {
                roll();
            }
        }

    }
    //broadcastCombatInfo();
}

function checkDiceRollWinner(idWinner) {
    currentFight.firstBonusRoll = "";
    currentFight.secondBonusRoll = "";
    if (currentFight.isInit) {
        currentFight.isInit = false;
        currentFight.firstBonusRoll = "";
        currentFight.secondBonusRoll = "";
        fChatLibInstance.sendMessage("[i]" + currentFighters[idWinner].character + " emotes the attack first.[/i]");
        currentFight.whoseturn = idWinner;
    }
    else {
        fChatLibInstance.sendMessage("[b]" + currentFighters[idWinner].character + " wins the roll.[/b]");

        //attack process
        if (currentFight.whoseturn == idWinner) { // si c'était deja a lui, alors attaque destructrice et on change pas de tour
            //hit
            if (currentFight.actionTaken == "hit") {
                attackHP(currentFight.actionPoints);
            }
            else if(currentFight.actionTaken == "lust"){
                attackLust(currentFight.actionPoints);
            }
            else if(currentFight.actionTaken == "escape"){
                //success
                fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has escaped " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s hold!");
            }
            else {
                fChatLibInstance.sendMessage("Was it... lust? a hit?");
            }
        }
        else { //si ce n'était pas a lui, garde super efficace et on change de tour
            //failed
            fChatLibInstance.sendMessage("[i][b]" + currentFighters[(idWinner == 0 ? 1 : 0)].character + "[/b] missed their attack![/i]");
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
                    currentFight.firstBonusRoll = "+" + (difference <= 5 ? difference : 5);
                }
                else {
                    currentFight.secondBonusRoll = "+" + (difference <= 5 ? difference : 5);
                }
                fChatLibInstance.sendMessage("[i][b]" + currentFighters[idWinner].character + "[/b] successfully blocked/dodged the attack, and gets a " + (idWinner == 0 ? currentFight.firstBonusRoll : currentFight.secondBonusRoll)+ " advantage on the next roll.[/i]");
                currentFight.whoseturn = idWinner;
            }
        }
    }
    nextTurn();
}

function nextTurn() {
    currentFight.turn++;
    broadcastCombatInfo();
}

function resetFight(){
    currentFighters = [];
    currentFight = { turn: -1, whoseturn: -1, isInit: false, orgasms: 0, firstBonusRoll: "", secondBonusRoll: "", staminaPenalty: 5, winner: -1 };
    diceResults = { first: -1, second: -1 };
    waitingForFirstResult = false;
    waitingForSecondResult = false;
}

function startFight(){
    currentFight.turn = 0;
    currentFight.isInit = true;
    setTimeout(rollInitiation(), 2500);
}

function checkLifePoints(){
    if (currentFighters[0].lust >= currentFighters[0].endurance) {
        currentFighters[0].lust = 0;
        currentFighters[0].orgasms++;
        var featuresP0 = parseStringToIntArray(currentFighters[0].featuresP0);
        if (featuresP0.indexOf(1) != -1) {
            currentFighters[0].endurance = 1;
        }
        else {
            currentFighters[0].endurance++;
        }
        currentFighters[0].stamina -= currentFight.staminaPenalty;
        currentFight.orgasms++;
        broadcastOrgasm(0);
    }
    if (currentFighters[1].lust >= currentFighters[1].endurance) {
        currentFighters[1].lust = 0;
        currentFighters[1].orgasms++;
        var featuresP1 = parseStringToIntArray(currentFighters[1].featuresP1);
        if (featuresP1.indexOf(1) != -1) {
            currentFighters[1].endurance = 1;
        }
        else if(featuresP1.indexOf(2) != -1 && currentFighters[1].endurance > 1){
            currentFighters[1].endurance--;
        }
        else{
            currentFighters[1].endurance++;
        }

        if(featuresP1.indexOf(2) != -1){
            currentFighters[1].stamina -= Math.floor(0.5*currentFight.staminaPenalty);
            fChatLibInstance.sendMessage(currentFighters[1].character +" is multi-orgasmic! The stamina penalty has been reduced by half, but their endurance has decreased by 1.");
        }
        else{
            currentFighters[1].stamina -= currentFight.staminaPenalty;
        }
        currentFight.orgasms++;
        broadcastOrgasm(1);
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
            "[b]"+currentFighters[currentFight.winner].character+"[/b] has finally took "+currentFighters[(currentFight.winner == 0 ? 1 : 0)].character+" down!\nCongrats to the winner!"
        );
        setTimeout(resetFight, 2500);
    }

}

function broadcastCombatInfo(){
    if (checkIfFightIsGoingOn()) {
        fChatLibInstance.sendMessage(
            "\n" +
            "[b]Turn #" + currentFight.turn + "[/b]\n" +
            (currentFighters.length > 0 ? "[b]" + currentFighters[0].character + ": [/b]" + currentFighters[0].hp + "/" + currentFighters[0].maxHp + " HP  |  " + currentFighters[0].stamina + "/" + currentFighters[0].maxStamina + " Stamina  |  " + currentFighters[0].lust + "/" + currentFighters[0].endurance + " Lust  |  " + currentFighters[0].orgasms + " Orgasms\n" : "") +
            (currentFighters.length > 1 ? "[b]" + currentFighters[1].character + ": [/b]" + currentFighters[1].hp + "/" + currentFighters[1].maxHp + " HP  |  " + currentFighters[1].stamina + "/" + currentFighters[1].maxStamina + " Stamina  |  " + currentFighters[1].lust + "/" + currentFighters[1].endurance + " Lust  |  " + currentFighters[1].orgasms + " Orgasms" : "")
        );
    }
    else {
        fChatLibInstance.sendMessage("There is no match going on at the moment.");
    }
}

function broadcastOrgasm(id) {
    fChatLibInstance.sendMessage("[b]" + currentFighters[id].character + ": [/b] couldn't take it anymore, seems like someone's going to cum!\n[color=red]Orgasm count:[/color] "+currentFighters[id].orgasms+"\n");
}

function getFeaturesListString(rawFeatures){
    var parsedFeatures = parseStringToIntArray(rawFeatures);
    var str = "";
    for (var i = 0; i < parsedFeatures.length; i++){
        str += ", "+ features[parsedFeatures[i]].title;
    }
    str = str.substr(1);
    return str;
}

function findItemIdByTitle(array, title){
    for (var i = 0; i < array.length; i++) {
        if(array[i].title.toLowerCase() == title.toLowerCase()){ return i};
    };
    return -1;
}


function parseStringToIntArray(myString){
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

function getRandomSextoy(){
    var randomInt = parseInt(getRandomArbitrary(0, sextoys.length));
    return sextoys[randomInt].title;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function attackHP(hp){
    if(hp > 0) {
        var hpBeforeAttack = currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp;

        currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp -= hp;
        fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has removed " + hp + " HP to " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " with that blow!");

        //ryona enthusiast
        var featuresVictim = parseStringToIntArray(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].features);
        if (featuresVictim.indexOf(3) != -1) {
            currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].lust += hp;
            fChatLibInstance.sendMessage(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " really likes to suffer... Their lust meter has been increased by " + hp);
        }

        //sadist
        var featuresAttacker = parseStringToIntArray(currentFighters[currentFight.whoseturn].features);
        if (featuresAttacker.indexOf(4) != -1) {

            currentFighters[currentFight.whoseturn].lust += hp;
            fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " really likes to inflict pain! Their lust meter has been increased by " + hp);
            if (hpBeforeAttack > (0.75 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp)) && currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp < (0.75 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp))) {
                //25% triggered
                currentFighters[currentFight.whoseturn].endurance += 1;
                fChatLibInstance.sendMessage(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " has already lost 25% of their HP... " + currentFighters[currentFight.whoseturn].character + "'s endurance has been increased by 1!");
            }
            if (hpBeforeAttack > (0.5 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp)) && currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp < (0.5 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp))) {
                //50% triggered
                currentFighters[currentFight.whoseturn].endurance += 1;
                fChatLibInstance.sendMessage(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " has already lost 50% of their HP! " + currentFighters[currentFight.whoseturn].character + "'s endurance has been increased by 1!");
            }
            if (hpBeforeAttack > (0.25 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp)) && currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp < (0.25 * (currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].hp))) {
                //75% triggered
                currentFighters[currentFight.whoseturn].endurance += 1;
                fChatLibInstance.sendMessage(currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + " has already lost 75% of their HP! " + currentFighters[currentFight.whoseturn].character + "'s endurance has been increased by 1!");
            }
        }
        checkLifePoints();
    }
}

function attackLust(hp) {
    if(hp > 0) {
        currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].lust += hp;
        fChatLibInstance.sendMessage(currentFighters[currentFight.whoseturn].character + " has added " + hp + " points to " + currentFighters[(currentFight.whoseturn == 0 ? 1 : 0)].character + "'s lust meter!");
        checkLifePoints();
    }
}

function checkIfFightIsGoingOn(){
    if (currentFight.turn > 0 && currentFighters.length == 2 && currentFight.whoseturn != -1) {
        return true;
    }
    return false;
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}
