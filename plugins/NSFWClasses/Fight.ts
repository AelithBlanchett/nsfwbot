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
import {Trigger} from "./Modifier";
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
    waitingForAction:boolean = true;

    message:string = "";
    fChatLibInstance:IFChatLib;
    channel:string;

    public constructor(fChatLibInstance:IFChatLib, channel:string, stage?:string) {
        this.stage = stage || this.pickStage();
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.fighterList = new FighterList();
    }

    setFightType(type:string){
        if(!this.hasStarted && !this.hasEnded){
            switch(type.toLowerCase()){
                case "classic":
                    this.fightType = FightType.Classic;
                    this.addMessage("Fight type successfully set to Classic.");
                    break;
                case "tag":
                case "tagteam":
                case "tag-team":
                    this.fightType = FightType.Tag;
                    this.addMessage("Fight type successfully set to Tag-Team.");
                    break;
                default:
                    this.fightType = FightType.Classic;
                    this.addMessage("Type not found. Fight type resetted to Classic.");
                    break;
            }
        }
        else{
            this.addMessage("Can't change the fight type if the fight has already started or is already finished.");
        }
        this.sendMessage();
    }

    saveState(){
        if(this.id == -1){
            var mysqlDataUpdate = function(idFight, idFighter){
                new Promise((resolve, reject) => {
                    //Do the db
                    var sql = "INSERT INTO `flistplugins`.?? (`idFight`, `idFighter`) VALUES (?,?);";
                    sql = Data.db.format(sql, [Constants.fightFightersTableName,idFight, idFighter]);
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
                var sql = "INSERT INTO `flistplugins`.?? (`idFightType`, `idStage`, `usedTeams`, `currentTurn`, `fighterList`) VALUES (?,?,?,?,?)";
                sql = Data.db.format(sql, [Constants.fightTableName, this.fightType, 1, this.usedTeams, this.currentTurn, CircularJSON.stringify(this.fighterList)]);
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
            var sql = "UPDATE `flistplugins`.?? SET `currentTurn` = ?, `fighterList` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [Constants.fightTableName, this.currentTurn, CircularJSON.stringify(this.fighterList), this.id]);
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
        var sql = "SELECT `idFight`,`idFightType`,`idStage`,`usedTeams`,`currentTurn`,`fighterList` FROM `flistplugins`.?? WHERE idFight = ?;";
        sql = Data.db.format(sql, [Constants.fightTableName, fightId]);
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
        this.hasStarted = true;
        this.fighterList.shufflePlayers(); //random order for teams

        this.addMessage(`The fighters will meet in the... [color=red][b]${this.stage}![/b][/color`);

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
            if(this.fightType == FightType.Tag) {
                this.fighterList[i].isInTheRing = false;
            }
        }
        if(this.fightType == FightType.Tag){ //if it's a tag match, only allow the first player of the next team
            for(let i = 1; i < this.fighterList.length; i++){
                if(this.currentPlayer.assignedTeam != this.fighterList[i].assignedTeam){
                    this.fighterList[i].isInTheRing = true;
                    break;
                }
            }
        }
        this.sendMessage();
        this.outputStatus();
    }

    nextTurn(){
        this.currentTurn++;
        for(let fighter of this.fighterList){
            fighter.triggerMods(Trigger.OnTurnTick);
        }
        this.outputStatus();
        this.saveState();
        this.waitingForAction = true;
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
        return this.fighterList.getAlivePlayers()[this.currentTurn % this.fighterList.aliveFighterCount].assignedTeam;
    }

    get currentPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[(this.currentTurn-1) % this.fighterList.aliveFighterCount];
    }

    get nextPlayer():Fighter{
        return this.fighterList.getAlivePlayers()[this.currentTurn % this.fighterList.aliveFighterCount];
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

    canTag(){
        let flag = true;
        let turnsSinceLastTag = (this.currentPlayer.lastTagTurn - this.currentTurn);
        let turnsToWait = (Constants.turnsToWaitBetweenTwoTags * 2) - turnsSinceLastTag; // *2 because there are two fighters
        if(turnsToWait > 0){
            flag = false;
            this.addMessage(`[b][color=red]You can't tag yet. Turns left: ${turnsToWait}[/color][/b]`);
            this.sendMessage();
        }
        return flag;
    }

    canAttack(){
        let flag = true;
        if(!this.waitingForAction){
            flag = false;
            this.addMessage(`[b][color=red]The last action hasn't been processed yet.[/color][/b]`);
        }
        if(this.currentPlayer.isTechnicallyOut()){
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
        if(this.currentTarget.isTechnicallyOut()){
            flag = false;
            this.addMessage(`[b][color=red]Your target is out of this fight.[/color][/b]`);
        }
        if(flag == false){
            this.sendMessage();
        }
        return flag;
    }

    validateTarget(){
        if(this.currentTarget == undefined || this.currentTarget.isTechnicallyOut() || !this.currentTarget.isInTheRing){
            if(this.fightType == FightType.Classic){
                this.currentPlayer.target = this.fighterList.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
            }
            else{
                this.currentPlayer.target = this.fighterList.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
            }
        }
    }

    doAction(idFighter:number, action:string, tier:Tier, customTarget?:Fighter){
        if(this.hasStarted && !this.hasEnded){
            if(this.currentPlayer == undefined || idFighter != this.currentPlayer.id){
                this.addMessage(`[b][color=red]This isn't your turn.[/color][/b]`);
                this.sendMessage();
            }
            else{
                this.validateTarget();
                if(!this.canAttack()){
                    return;
                }
                if(action == "tag"){
                    if(!this.canTag())
                        return;
                    if(customTarget != undefined && customTarget.assignedTeam == this.currentPlayer.assignedTeam){
                        this.currentPlayer.target = customTarget;
                    }
                }
                else{
                    if(customTarget != undefined){
                        if(customTarget.assignedTeam != this.currentPlayer.assignedTeam){
                            this.currentPlayer.target = customTarget;
                        }
                        else{
                            this.addMessage(`[b][color=red]The target for this attack can't be in your team.[/color][/b]`);
                            this.sendMessage();
                            return;
                        }
                    }
                }
                this.waitingForAction = false;
                let theAction = new FightAction(this.id, this.currentTurn, tier, this.currentPlayer, this.currentTarget);
                theAction["action"+Utils.toTitleCase(action)]();
                theAction.commit(this);
            }
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

    pickStage(){
        return Constants.Arenas[Math.floor(Math.random() * Constants.Arenas.length)];
    }

    endFight(){
        this.hasEnded = true;
        this.winnerTeam = this.fighterList.getUsedTeams()[0];
        this.addMessage(`${Team[this.winnerTeam]} team wins the fight!`);
        this.sendMessage();
        var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]];
        var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.tokensPerLossMultiplier;

        Data.db.beginTransaction(err =>{
            var sql = "UPDATE `flistplugins`.?? SET `currentTurn` = ?, `fighterList` = ?, `hasEnded` = ?, `winnerTeam` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [Constants.fightTableName, this.currentTurn, "", true, this.winnerTeam, this.id]);
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