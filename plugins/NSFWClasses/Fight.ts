import {Fighter} from "./Fighter";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {FighterList} from "./FighterList";
import BaseDamage = Constants.BaseDamage;
import Tier = Constants.Tier;
import RequiredRoll = Constants.RequiredRoll;
import FightType = Constants.FightType;
import {Data} from "./Model";
import FightTier = Constants.FightTier;
import TokensPerWin = Constants.TokensPerWin;
var CircularJSON = require('circular-json');

export class Fight{
    id:number = -1;
    usedTeams:number = 2;

    hasStarted:boolean = false;
    hasEnded:boolean = false;
    stage:string;
    fighterList:FighterList;
    currentTurn:number = 0;
    fightType:FightType = FightType.Classic;
    pastActions:Array<FightAction> = [];
    winnerTeam:Team = Team.Unknown;

    message:string = "";
    fChatLibInstance:IFChatLib;
    channel:string;

    public constructor(fChatLibInstance:IFChatLib, channel:string, stage?:string) {
        this.stage = stage || "Wrestling Ring";
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.fighterList = new FighterList();
    }

    saveState(){
        if(this.id == -1){
            var mysqlDataUpdate = function(idFight, idFighter){
                new Promise((resolve, reject) => {
                    //Do the db
                    var sql = "INSERT INTO `flistplugins`.`nsfw_fightfighters` (`idFight`, `idFighter`) VALUES (?,?);";
                    sql = Data.db.format(sql, [idFight, idFighter]);
                    Data.db.query(sql, function(err, results) {
                        if(err){
                            reject(err);
                        }
                        else{
                            resolve();
                        }
                    });
                });
            };

            Data.db.beginTransaction(err =>{
                var sql = "INSERT INTO `flistplugins`.`nsfw_fights` (`idFightType`, `idStage`, `usedTeams`, `currentTurn`, `fighterList`) VALUES (?,?,?,?,?)";
                sql = Data.db.format(sql, [this.fightType, 1, this.usedTeams, this.currentTurn, CircularJSON.stringify(this.fighterList)]);
                Data.db.query(sql, (err, results) => {
                    if(err){
                        Data.db.rollback(function(){

                        });
                    }
                    else{
                        this.id = results.insertId;
                        var callsToMake = [];
                        for(let fighter of this.fighterList){
                            callsToMake.push(mysqlDataUpdate(results.insertId, fighter.id));
                        }
                        Promise.all(callsToMake)
                            .then(_ => Data.db.commit(_ => {}))
                            .catch((err) => {
                                Data.db.rollback(function(){

                                });
                            });
                    }
                });
            });
        }
        else{
            var sql = "UPDATE `flistplugins`.`nsfw_fights` SET `currentTurn` = ?, `fighterList` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [this.currentTurn, CircularJSON.stringify(this.fighterList), this.id]);
            Data.db.query(sql, (err, results) => {
                if (err) {
                }
                else {
                    console.log("Successfully updated fight " + this.id + " to database.");
                }
            });
        }
    }

    loadState(fightId:number){
        var sql = "SELECT `nsfw_fights`.`idFight`,`nsfw_fights`.`idFightType`,`nsfw_fights`.`idStage`,`nsfw_fights`.`usedTeams`,`nsfw_fights`.`currentTurn`,`nsfw_fights`.`fighterList` FROM `flistplugins`.`nsfw_fights` WHERE idFight = ?;";
        sql = Data.db.format(sql, [fightId]);
        Data.db.query(sql, (err, results) => {
            if (err) {
            }
            else {
                this.id = fightId;
                this.fightType = results[0].idFightType;
                this.stage = "Virtual Arena";
                this.usedTeams = results[0].usedTeams;
                this.currentTurn = results[0].currentTurn;
                this.fighterList = new FighterList();
                //TODO: LOAD FORMER ACTIONS

                var oldParsedList = CircularJSON.parse(results[0].fighterList);
                for(let nonParsedPlayer of oldParsedList){
                    let player = new Fighter();
                    for(let attrname in nonParsedPlayer){
                        player[attrname] = nonParsedPlayer[attrname];
                    }
                    player.dice = new Dice(10);
                    player.fight = this;
                    player.target = null;
                    this.fighterList.push(player);
                }

                console.log("Successfully loaded  fight " + this.id + " from database.");
                this.outputStatus();
            }
        });
    }

    //Pre-fight utils

    join(fighter:Fighter, team:Team){
        if(!this.hasStarted){
            if(!this.fighterList.getFighterByName(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.fighterList.getAvailableTeam();
                    console.log(`assigned team ${fighter.assignedTeam} to ${fighter.name}`);
                }
                fighter.fight = this;
                this.fighterList.push(fighter);
                return true;
            }
        }
        return false;
    }

    setFighterReady(fighter:Fighter){
        if(!this.hasStarted){
            if(!this.fighterList.getFighterByName(fighter.name)){
                this.join(fighter, Team.Unknown);
            }
            var fighterInFight = this.fighterList.getFighterByName(fighter.name);
            if(fighterInFight && !fighterInFight.isReady){ //find fighter by its name property instead of comparing objects, which doesn't work.
                fighterInFight.isReady = true;
                this.addMessage("[color=red]"+fighter.name+" is now ready to get it on![/color]");
                this.sendMessage();
                if(this.canStartMatch()){
                    this.startMatch();
                }
                return true;
            }
        }
        return false;
    }

    canStartMatch(){
        let canGo = (this.fighterList.isEveryoneReady() && !this.hasStarted && this.fighterList.getUsedTeams().length >= this.usedTeams);
        return canGo; //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");

        this.fighterList.shufflePlayers(); //random order for teams

        for(let i = 0; i < this.fighterList.maxPlayersPerTeam; i++){ //Prints as much names as there are team
            let fullStringVS = "[b]";
            for(let j of this.fighterList.getUsedTeams()){
                let theFighter=this.fighterList.getTeam(j)[i];
                if(theFighter != undefined){
                    fullStringVS = `${fullStringVS} VS ${theFighter.getStylizedName()}`;
                }
            }
            fullStringVS = `${fullStringVS}[/b]`;
            fullStringVS =  fullStringVS.replace(" VS ","");
            this.addMessage(fullStringVS);
        }


        this.sendMessage();
        this.fighterList.reorderFightersByInitiative(this.rollAllDice());
        this.currentTurn = 1;
        this.addMessage(`${this.currentPlayer.getStylizedName()} starts first for the ${this.currentTeamName} team!`);
        for(let i = 1; i < this.fighterList.length; i++){
            this.addMessage(`${this.fighterList[i].getStylizedName()} will follow for the ${Team[this.fighterList[i].assignedTeam]} team.`);
        }
        this.sendMessage();
        this.outputStatus();
    }

    nextTurn(){
        this.currentTurn++;
        this.outputStatus();
        //this.saveState();
    }

    //Fighting info displays

    outputStatus(){
        this.addMessage(`\n[b]Turn #${this.currentTurn}[/b] [color=${this.currentTeamName}]------ ${this.currentTeamName} team ------[/color] It's [u]${this.currentPlayer.getStylizedName()}[/u]'s turn.\n`);

         for(let i = 0; i < this.fighterList.length; i++){ //Prints as much names as there are team
             let theFighter=this.fighterList[i];
             if(theFighter != undefined){
                 this.addMessage(theFighter.outputStatus());
             }
        }

        this.sendMessage();
    }

    get currentTeam():Team{
        return this.fighterList.getAlivePlayers()[(this.currentTurn-1) % this.fighterList.aliveFighterCount].assignedTeam;
    }

    get nextTeamToPlay():Team{
        return this.fighterList.getAlivePlayers()[(this.currentTurn-1) % this.fighterList.aliveFighterCount].assignedTeam;
    }

    get currentPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[(this.currentTurn-1) % this.fighterList.aliveFighterCount];
    }

    get nextPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[(this.currentTurn-1) % this.fighterList.aliveFighterCount];
    }

    //Fight helpers
    get currentTeamName(){
        return Team[this.currentTeam];
    }

    get currentTarget():Fighter{
        return this.currentPlayer.target;
    }

    assignRandomTargetToAllFighters():void{
        for(let fighter of this.fighterList.getAlivePlayers()){
            this.assignRandomTarget(fighter);
        }
    }

    assignRandomTarget(fighter:Fighter):void{
        fighter.target = this.fighterList.getRandomFighterNotInTeam(fighter.assignedTeam);
    }

    //Dice rolling

    rollAllDice():Array<Fighter>{
        let arrSortedFightersByInitiative = new Array<Fighter>();
        for(let player of this.fighterList.getAlivePlayers()){
            player.lastDiceRoll = player.dice.roll(10).reduce(function(a, b){return a+b;});
            arrSortedFightersByInitiative.push(player);
            this.addMessage(`[color=${Team[player.assignedTeam]}]${player.name}[/color] rolled a ${player.lastDiceRoll}`);
        }

        this.sendMessage();

        arrSortedFightersByInitiative.sort((a,b):number => {
            return b.lastDiceRoll - a.lastDiceRoll;
        });

        return arrSortedFightersByInitiative;
    }

    rollAllGetWinner():Fighter{
        return this.rollAllDice()[0];
    }



    //Messaging

    addMessage(strMsg:string){
        this.message += strMsg +"\n";
    }

    sendMessage(){
        this.fChatLibInstance.sendMessage(this.message, this.channel);
        this.message = "";
    }

    //attacks

    attackFormula(tier:Tier, actorAtk:number, targetDef:number, roll:number):number{
        return BaseDamage[Tier[tier]]-(actorAtk-targetDef)+roll;
    }

    canAttack(){
        let flag = true;
        if(this.currentPlayer.isOut()){
            flag = false;
            this.addMessage(`[b][color=red]You are out of this fight.[/color][/b]`);
        }
        if(!this.currentPlayer.isInTheRing){
            flag = false;
            this.addMessage(`[b][color=red]You cannot do that since you're not inside the ring.[/color][/b]`);
        }
        if(!this.currentTarget.isInTheRing){
            flag = false;
            this.addMessage(`[b][color=red]Your target isn't inside the ring.[/color][/b]`);
        }
        if(this.currentTarget.isOut()){
            flag = false;
            this.addMessage(`[b][color=red]Your target is out of this fight.[/color][/b]`);
        }
        if(flag == false){
            this.sendMessage();
        }
        return flag;
    }

    validateTarget(){
        if(this.currentTarget == undefined || this.currentTarget.isOut()){
            if(this.fightType == FightType.Classic){
                this.currentPlayer.target = this.fighterList.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
            }
            else{
                this.currentPlayer.target = this.fighterList.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
            }
        }
    }

    doAction(idFighter:number, action:string, tier:Tier){
        if(this.currentPlayer == undefined || idFighter != this.currentPlayer.id){
            this.addMessage(`[b][color=red]This isn't your turn.[/color][/b]`);
            this.sendMessage();
        }
        else{
            this.validateTarget();
            if(!this.canAttack()){
                return;
            }
            let theAction = this["action"+Utils.toTitleCase(action)](tier);
            this.commitAction(theAction);
        }

    }

    actionBrawl(tier:Tier):FightAction{
        let action = new FightAction(this.id);
        action.tier = tier;
        action.atTurn = this.currentTurn;
        action.type = "brawl";
        action.attacker = this.currentPlayer;
        action.defender = this.currentTarget;
        action.diceScore = this.currentPlayer.dice.roll(1) + action.attacker.power;
        if(action.diceScore >= RequiredRoll[Tier[action.tier]]){
            action.missed = false;
            action.hpDamage = this.attackFormula(action.tier, this.currentPlayer.power, this.currentTarget.toughness, action.diceScore);
        }
        return action;
    }

    commitAction(action:FightAction){
        if(action.missed = false){
            this.addMessage(`${action.attacker.name} rolled ${action.diceScore}, the ${action.type} attack [b][color=green]HITS![/color][/b]`);
        }
        else{
            this.addMessage(`${action.attacker.name} rolled ${action.diceScore}, the ${action.type} attack [b][color=red]MISSED![/color][/b]`);
        }

        this.pastActions.push(action);

        if(action.hpDamage > 0){
            action.defender.hitHp(action.hpDamage);
        }
        if(action.lustDamage > 0){
            action.defender.hitLust(action.lustDamage);
        }

        if(action.defender.isDead()){
            this.addMessage(`${action.defender.name} couldn't take the hits anymore! [b][color=red]They're out![/color][/b]`);
            action.defender.triggerOutsideRing();
        }
        else if(action.defender.isSexuallyExhausted()){
            this.addMessage(`${action.defender.name} is too sexually exhausted to continue! [b][color=red]They're out![/color][/b]`);
            action.defender.triggerOutsideRing();
        }

        //Save it to the DB
        action.commitDb();

        //check for fight ending status
        if (this.fighterList.getUsedTeams().length != 1) {
            this.nextTurn();
        } else { //if there's only one team left in the fight, then we're sure it's over
            this.outputStatus();
            this.endFight();
        }
    }

    getFightTier(winnerTeam){
        var highestWinnerTier = FightTier.Bronze;
        for(let fighter of this.fighterList.getTeam(winnerTeam)){
            if(fighter.tier > highestWinnerTier){
                highestWinnerTier = fighter.tier;
            }
        }

        var lowestLoserTier;
        for(let fighter of this.fighterList){
            if(fighter.assignedTeam != winnerTeam){
                if(lowestLoserTier == undefined){
                    lowestLoserTier = fighter.tier;
                }
                else if(lowestLoserTier > fighter.tier){
                    lowestLoserTier = fighter.tier;
                }
            }
        }

        var fightTier;

        if(lowestLoserTier >= highestWinnerTier){ //if the weakest wrestler was equal or more powerful, the fight tier matches the loser's tier
            fightTier = lowestLoserTier;
        }
        else{ //If the loser was weaker, the fight tier matches the winner's tier
            fightTier = highestWinnerTier;
        }

        return fightTier;
    }

    endFight(){
        this.winnerTeam = this.fighterList.getUsedTeams()[0];
        this.addMessage(`${Team[this.winnerTeam]} team wins the fight!`);
        this.sendMessage();
        var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]];
        var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.tokensPerLossMultiplier;

        Data.db.beginTransaction(err =>{
            var sql = "UPDATE `flistplugins`.`nsfw_fights` SET `currentTurn` = ?, `fighterList` = ?, `hasEnded` = ?, `winnerTeam` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [this.currentTurn, "", true, this.winnerTeam, this.id]);
            Data.db.query(sql, (err, results) => {
                if(err){
                    Data.db.rollback(function(){

                    });
                }
                else{
                    var callsToMake = [];
                    for(let fighter of this.fighterList){
                        if(fighter.assignedTeam == this.winnerTeam){
                            this.addMessage(`Awarded ${tokensToGiveToWinners} tokens to ${fighter.getStylizedName()}`);
                            callsToMake.push(fighter.giveTokens(tokensToGiveToWinners));
                        }
                        else{
                            this.addMessage(`Awarded ${tokensToGiveToLosers} tokens to ${fighter.getStylizedName()}`);
                            callsToMake.push(fighter.giveTokens(tokensToGiveToLosers));
                        }
                    }
                    Promise.all(callsToMake)
                        .then(_ => {
                            Data.db.commit(_ => {
                                console.log(`Finished fight ${this.id} and given all the according tokens successfully`);
                                this.sendMessage(); //send tokens message and everything
                            });
                        })
                        .catch((err) => {
                            console.log("There was an error during the fight ending:"+err);
                            Data.db.rollback(function(){
                            });
                        });
                }
            });
        });
    }

}