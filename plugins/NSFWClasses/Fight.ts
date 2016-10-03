/// <reference path="./Dice.ts" />
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
import FightType = Constants.FightType;
import {Data} from "./Model";
import FightTier = Constants.FightTier;
import TokensPerWin = Constants.TokensPerWin;
import Trigger = Constants.Trigger;
import Action = Constants.Action;
import {Modifier} from "./Modifier";
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
        this.fighterList = new FighterList(this.usedTeams);
    }

    changeMinTeamsInvolvedInFight(intNewNumberOfTeams:number){
        if(intNewNumberOfTeams >= 2 ){
            this.fighterList.minNumberOfTeamsThatPlay = intNewNumberOfTeams;
            this.addMessage("Number of teams involved in the fight updated!.");
        }
        else{
            this.addMessage("The number of teams should be superior or equal than 2.");
        }
        this.sendMessage();
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

    static saveState(fight){
        return new Promise<number>((resolve, reject) => {
            if (fight.id == -1) {
                var mysqlDataUpdate = function (idFight, idFighter) {
                    new Promise((resolve, reject) => {
                        //Do the db
                        var sql = "INSERT INTO `flistplugins`.?? (`idFight`, `idFighter`) VALUES (?,?);";
                        sql = Data.db.format(sql, [Constants.fightFightersTableName, idFight, idFighter]);
                        Data.db.query(sql, function (err, results) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                };

                Data.db.beginTransaction(err => {
                    var sql = "INSERT INTO `flistplugins`.?? (`idFightType`, `idStage`, `usedTeams`, `currentTurn`, `fighterList`) VALUES (?,?,?,?,?)";
                    sql = Data.db.format(sql, [Constants.fightTableName, fight.fightType, 1, fight.usedTeams, fight.currentTurn, CircularJSON.stringify(fight.fighterList)]);
                    Data.db.query(sql, (err, results) => {
                        if (err) {
                            Data.db.rollback(() => {
                                reject(err);
                            });
                        }
                        else {
                            fight.id = results.insertId;
                            var callsToMake = [];
                            for (let fighter of fight.fighterList) {
                                callsToMake.push(mysqlDataUpdate(results.insertId, fighter.id));
                            }
                            Promise.all(callsToMake)
                                .then(_ => Data.db.commit(() => {
                                    resolve(fight.id);
                                }))
                                .catch((err) => {
                                    Data.db.rollback(() => {
                                        reject(err);
                                    });
                                });
                        }
                    });
                });
            }
            else {
                var sql = "UPDATE `flistplugins`.?? SET `currentTurn` = ?, `fighterList` = ? WHERE `idFight` = ?;";
                sql = Data.db.format(sql, [Constants.fightTableName, fight.currentTurn, CircularJSON.stringify(fight.fighterList), fight.id]);
                Data.db.query(sql, (err, results) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("Successfully updated fight " + fight.id + " to database.");
                        resolve(fight.id);
                    }
                });
            }
        });
    }

    static loadState(fightId:number, fight:Fight){
        var sql = "SELECT `idFight`,`idFightType`,`idStage`,`usedTeams`,`currentTurn`,`fighterList` FROM `flistplugins`.?? WHERE idFight = ?;";
        sql = Data.db.format(sql, [Constants.fightTableName, fightId]);
        Data.db.query(sql, (err, results) => {
            if (err) {
            }
            else {
                fight.id = fightId;
                fight.fightType = results[0].idFightType;
                fight.stage = "Virtual Arena";
                fight.usedTeams = results[0].usedTeams;
                fight.currentTurn = results[0].currentTurn;
                fight.fighterList = new FighterList(fight.usedTeams);
                //TODO: LOAD FORMER ACTIONS

                var oldParsedList = CircularJSON.parse(results[0].fighterList);
                for(let nonParsedPlayer of oldParsedList){
                    let player = new Fighter();
                    for(let attrname in nonParsedPlayer){
                        player[attrname] = nonParsedPlayer[attrname];
                    }
                    player.dice = new Dice(10);
                    player.fight = fight;
                    player.target = null;
                    fight.fighterList.push(player);
                }

                console.log("Successfully loaded  fight " + fight.id + " from database.");
                fight.outputStatus();
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
                    //console.log(`assigned team ${fighter.assignedTeam} to ${fighter.name}`);
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
        let canGo = (this.fighterList.isEveryoneReady() && !this.hasStarted && this.fighterList.getAllUsedTeams().length >= this.usedTeams);
        return canGo; //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");
        this.hasStarted = true;
        this.fighterList.shufflePlayers(); //random order for teams

        this.addMessage(`The fighters will meet in the... [color=red][b]${this.stage}![/b][/color]`);

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
        this.fighterList.reorderFightersByInitiative(this.rollAllDice(Trigger.BeforeInitiationRoll, Trigger.AfterInitiationRoll));
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
        Fight.saveState(this);
        this.outputStatus();
    }

    nextTurn(){
        for(let fighter of this.fighterList){
            fighter.triggerMods(Trigger.BeforeTurnTick);
        }
        this.currentTurn++;
        for(let fighter of this.fighterList){
            fighter.triggerMods(Trigger.AfterTurnTick);
        }
        this.outputStatus();

        if (this.isFightOver()) { //Check for the ending
            this.outputStatus();
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]];
            var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.tokensPerLossMultiplier;
            this.endFight(tokensToGiveToWinners, tokensToGiveToLosers);
        }
        else{
            Fight.saveState(this);
            this.waitingForAction = true;
        }
    }

    isFightOver():boolean{
        return this.fighterList.getUsedTeams().length <= 1;
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

    setCurrentPlayer(fighterName:string){
        let index = this.fighterList.findIndex((x) => x.name == fighterName && !x.isTechnicallyOut());
        if(index != -1 && this.fighterList[0].name != fighterName){ //switch positions
            var temp = this.fighterList[0];
            this.fighterList[0] = this.fighterList[index];
            this.fighterList[index] = temp;
            this.fighterList[0].isInTheRing = true;
            if(this.fighterList[index].assignedTeam == this.fighterList[0].assignedTeam && this.fighterList[index].isInTheRing == true && this.fightType == FightType.Tag){
                this.fighterList[index].isInTheRing = false;
            }
            this.addMessage(`Successfully changed ${temp.name}'s place with ${this.fighterList[0].name}'s!`)
        }
        else{
            this.addMessage("Couldn't switch the two wrestlers. The name is either wrong, this fighter is already in the ring or this fighter isn't able to fight right now.")
        }
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

    rollAllDice(eventBefore:Trigger = Trigger.BeforeRoll, eventAfter:Trigger = Trigger.AfterRoll):Array<Fighter>{
        let arrSortedFightersByInitiative = new Array<Fighter>();
        for(let player of this.fighterList.getAlivePlayers()){
            player.lastDiceRoll = player.roll(10, eventBefore, eventAfter);
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
        if(!this.currentTarget.canMoveFromOrOffRing){
            flag = false;
            this.addMessage(`[b][color=red]You can't tag with this character. They're permanently out.[/color][/b]`);
            this.sendMessage();
        }
        return flag;
    }

    canAttack(action:Action){
        let flag = true;
        if(action == undefined){
            flag = false;
            this.addMessage(`[b][color=red]The last action hasn't been processed yet.[/color][/b]`);
        }
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
        if(action == Action.SubHold || action == Action.SexHold || action == Action.HumHold || action == Action.Bondage){
            if(this.currentPlayer.isInHold()){
                flag = false;
                this.addMessage(`[b][color=red]You cannot do that since you're in a hold.[/color][/b]`);
            }
        }
        if(flag == false){
            this.sendMessage();
        }
        return flag;
    }

    checkAttackRequirements(action:Action) {
        let flag = true;
        if(action == Action.HumHold || action == Action.Bondage){
            if(!this.currentTarget.isInSpecificHold(Constants.Modifier.SexHold)){
                flag = false;
                this.addMessage(`[b][color=red]You cannot do that since your target is not in a sexual hold.[/color][/b]`);
            }
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

    doAction(idFighter:number, action:Action, tier:Tier, customTarget?:Fighter){
        if(this.hasStarted && !this.hasEnded){
            if(this.currentPlayer == undefined || idFighter != this.currentPlayer.id){
                this.addMessage(`[b][color=red]This isn't your turn.[/color][/b]`);
                this.sendMessage();
            }
            else{
                this.validateTarget();
                if(!this.canAttack(action)){
                    return;
                }
                if(action == Action.Tag){ //put in the condition any attacks that could focus allies
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
                if(!this.checkAttackRequirements(action)){
                    return;
                }
                this.waitingForAction = false;
                let attacker = this.currentPlayer; // need to store them in case of turn-changing logic
                let defender = this.currentTarget;
                attacker.pendingAction = new FightAction(this.id, this.currentTurn, tier, action, attacker, defender);
                let eventToTriggerAfter = attacker.pendingAction.triggerAction(); //The specific trigger BEFORE is executed inside the attacks, see FightAction.ts
                attacker.triggerMods(eventToTriggerAfter, attacker.pendingAction);
                attacker.pendingAction.commit(this);
            }
        }
    }

    getFightTier(winnerTeam){
        var highestWinnerTier = FightTier.Bronze;
        for(let fighter of this.fighterList.getTeam(winnerTeam)){
            if(fighter.tier() > highestWinnerTier){
                highestWinnerTier = fighter.tier();
            }
        }

        var lowestLoserTier;
        for(let fighter of this.fighterList){
            if(fighter.assignedTeam != winnerTeam){
                if(lowestLoserTier == undefined){
                    lowestLoserTier = fighter.tier();
                }
                else if(lowestLoserTier > fighter.tier()){
                    lowestLoserTier = fighter.tier();
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

    forfeit(fighter:Fighter){
        if(fighter != null){
            if(!fighter.isTechnicallyOut()){
                this.addMessage(`${fighter.getStylizedName()} forfeits! Which means... 3 bondage items landing on them to punish them!`);
                for(var i = 0; i < 3; i++){
                    fighter.modifiers.push(new Modifier(fighter, null, 0, 0, 0, 0, 0, 1, Constants.Trigger.None, [], false, Constants.Modifier.Bondage));
                }
                fighter.forfeits++;
                this.addMessage(`${fighter.getStylizedName()} has too many items on them to possibly fight! [b][color=red]They're out![/color][/b]`);
                fighter.triggerPermanentOutsideRing();
            }
            else{
                this.addMessage(`You are already out of the match. No need to forfeit.`);
                this.sendMessage();
                return;
            }
        }
        else{
            this.addMessage(`You are not participating in the match. OH, and that message should NEVER happen.`);
            this.sendMessage();
            return;
        }
        this.sendMessage();
        if (this.isFightOver()) {
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]]*Constants.tokensPerLossMultiplier;
            this.endFight(tokensToGiveToWinners, 0);
        }
    }

    checkForDraw(){
        let neededDrawFlags = this.fighterList.getAlivePlayers().length;
        let drawFlags = 0;
        for(let fighter of this.fighterList.getAlivePlayers()){
            if(fighter.wantsDraw){
                drawFlags++;
            }
        }
        if(neededDrawFlags == drawFlags){
            this.addMessage(`Everybody agrees, it's a draw!`);
            this.sendMessage();
            let tokensToGive:number = this.currentTurn;
            if(tokensToGive > parseInt(TokensPerWin[FightTier.Bronze])){
                tokensToGive = parseInt(TokensPerWin[FightTier.Bronze]);
            }
            this.endFight(0,tokensToGive, Team.Unknown); //0 because there isn't a winning team
        }
        else{
            this.addMessage(`Waiting for the other players still in the fight to call the draw.`);
            this.sendMessage();
        }
    }

    endFight(tokensToGiveToWinners, tokensToGiveToLosers, forceWinner?:Team){
        this.hasEnded = true;
        if(!forceWinner){
            this.winnerTeam = this.fighterList.getUsedTeams()[0];
        }
        else{
            this.winnerTeam = forceWinner;
        }
        if(this.winnerTeam != Team.Unknown){
            this.addMessage(`${Team[this.winnerTeam]} team wins the fight!`);
            this.sendMessage();
        }
        Fight.commitEndFightDb(this, tokensToGiveToWinners, tokensToGiveToLosers);
    }

    static commitEndFightDb(fight, tokensToGiveToWinners, tokensToGiveToLosers){
        Data.db.beginTransaction(err =>{
            var sql = "UPDATE `flistplugins`.?? SET `currentTurn` = ?, `fighterList` = ?, `hasEnded` = ?, `winnerTeam` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [Constants.fightTableName, fight.currentTurn, "", true, fight.winnerTeam, fight.id]);
            Data.db.query(sql, (err, results) => {
                if(err){
                    Data.db.rollback(function(){

                    });
                }
                else{
                    var callsToMake = [];
                    for(let fighter of fight.fighterList){
                        fighter.totalFights++;
                        if(fighter.assignedTeam == fight.winnerTeam){
                            fighter.wins++;
                            fight.addMessage(`Awarded ${tokensToGiveToWinners} ${Constants.currencyName} to ${fighter.getStylizedName()}`);
                            fighter.giveTokens(tokensToGiveToWinners)
                            callsToMake.push(fighter.update());
                        }
                        else{
                            if(fight.winnerTeam != Team.Unknown){
                                fighter.losses++;
                            }
                            fight.addMessage(`Awarded ${tokensToGiveToLosers} ${Constants.currencyName} to ${fighter.getStylizedName()}`);
                            fighter.giveTokens(tokensToGiveToLosers)
                            callsToMake.push(fighter.update());
                        }
                    }
                    Promise.all(callsToMake)
                        .then(_ => {
                            Data.db.commit(_ => {
                                console.log(`Finished fight ${fight.id} and given all the according tokens successfully`);
                                fight.sendMessage(); //send tokens message and everything
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