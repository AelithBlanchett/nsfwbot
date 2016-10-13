import {Fighter} from "./Fighter";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import * as Constants from "./Constants";
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
import {Promise} from "es6-promise";
import ModifierType = Constants.ModifierType;
import {BondageModifier} from "./CustomModifiers";
import TriggerMoment = Constants.TriggerMoment;
import {Message} from "./Messaging";
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

    message:Message;
    fChatLibInstance:IFChatLib;
    channel:string;

    public constructor(fChatLibInstance:IFChatLib, channel:string, stage?:string) {
        this.stage = stage || this.pickStage();
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.fighterList = new FighterList(this.usedTeams);
        this.message = new Message();
    }

    changeMinTeamsInvolvedInFight(intNewNumberOfTeams:number){
        if(intNewNumberOfTeams >= 2){
            this.fighterList.minNumberOfTeamsThatPlay = intNewNumberOfTeams;
            this.message.addInfo(Constants.Messages.changeMinTeamsInvolvedInFightOK);
        }
        else{
            this.message.addInfo(Constants.Messages.changeMinTeamsInvolvedInFightFail);
        }
        this.sendMessage();
    }

    setFightType(type:string){
        if(!this.hasStarted && !this.hasEnded){
            switch(type.toLowerCase()){
                case "classic":
                    this.fightType = FightType.Classic;
                    this.message.addInfo(Constants.Messages.setFightTypeClassic);
                    break;
                case "tag":
                case "tagteam":
                case "tag-team":
                    this.fightType = FightType.Tag;
                    this.message.addInfo(Constants.Messages.setFightTypeTag);
                    break;
                default:
                    this.fightType = FightType.Classic;
                    this.message.addInfo(Constants.Messages.setFightTypeNotFound);
                    break;
            }
        }
        else{
            this.message.addInfo(Constants.Messages.setFightTypeFail);
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
                        sql = Data.db.format(sql, [Constants.SQL.fightFightersTableName, idFight, idFighter]);
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
                    sql = Data.db.format(sql, [Constants.SQL.fightTableName, fight.fightType, 1, fight.usedTeams, fight.currentTurn, CircularJSON.stringify(fight.fighterList)]);
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
                sql = Data.db.format(sql, [Constants.SQL.fightTableName, fight.currentTurn, CircularJSON.stringify(fight.fighterList), fight.id]);
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
        sql = Data.db.format(sql, [Constants.SQL.fightTableName, fightId]);
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
                this.message.addInfo(Utils.strFormat(Constants.Messages.Ready, [fighter.getStylizedName()]));
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
        this.message.addInfo(Constants.Messages.startMatchAnnounce);
        this.hasStarted = true;
        this.fighterList.shufflePlayers(); //random order for teams

        this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchStageAnnounce, [this.stage]));

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
            this.message.addInfo(fullStringVS);
        }


        this.fighterList.reorderFightersByInitiative(this.rollAllDice(Trigger.InitiationRoll));
        this.currentTurn = 1;
        this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchFirstPlayer, [this.currentPlayer.getStylizedName(), this.currentTeamName.toLowerCase(), this.currentTeamName]));
        for(let i = 1; i < this.fighterList.length; i++){
            this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchFollowedBy, [this.fighterList[i].getStylizedName(), Team[this.fighterList[i].assignedTeam].toLowerCase(), Team[this.fighterList[i].assignedTeam]]));
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
            fighter.triggerMods(TriggerMoment.Any, Trigger.OnTurnTick);
            if(!fighter.isInHold()){
                fighter.healFP(1);
            }
            if(fighter.focus < fighter.minFocus()){
                fighter.consecutiveTurnsWithoutFocus++;
            }
            else{
                fighter.consecutiveTurnsWithoutFocus = 0;
            }
        }
        this.currentTurn++;
        this.outputStatus();

        if (this.isFightOver()) { //Check for the ending
            this.outputStatus();
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]];
            var tokensToGiveToLosers:number = tokensToGiveToWinners*Constants.Fight.Globals.tokensPerLossMultiplier;
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
        this.message.addInfo(Utils.strFormat(Constants.Messages.outputStatusInfo, [this.currentTurn.toString(), this.currentTeamName.toLowerCase(), this.currentTeamName, this.currentPlayer.getStylizedName()]));

         for(let i = 0; i < this.fighterList.length; i++){ //Prints as much names as there are team
             let theFighter=this.fighterList[i];
             if(theFighter != undefined){
                 this.message.addStatus(theFighter.outputStatus());
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
            this.message.addInfo(Utils.strFormat(Constants.Messages.setCurrentPlayerOK, [temp.name, this.fighterList[0].name]));
        }
        else{
            this.message.addInfo(Constants.Messages.setCurrentPlayerFail)
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
    rollAllDice(event:Trigger):Array<Fighter>{
        let arrSortedFightersByInitiative = [];
        for(let player of this.fighterList.getAlivePlayers()){
            player.lastDiceRoll = player.roll(10, event);
            arrSortedFightersByInitiative.push(player);
            this.message.addHint(Utils.strFormat(Constants.Messages.rollAllDiceEchoRoll, [player.getStylizedName(), player.lastDiceRoll.toString()]));
        }

        arrSortedFightersByInitiative.sort((a,b):number => {
            return b.lastDiceRoll - a.lastDiceRoll;
        });

        return arrSortedFightersByInitiative;
    }

    rollAllGetWinner(event:Trigger):Fighter{
        return this.rollAllDice(event)[0];
    }



    //Messaging
    sendMessage(){
        this.fChatLibInstance.sendMessage(this.message.getMessage(), this.channel);
    }

    //Attacks
    canTag(){
        let flag = true;
        let turnsSinceLastTag = (this.currentPlayer.lastTagTurn - this.currentTurn);
        let turnsToWait = (Constants.Fight.Action.Globals.turnsToWaitBetweenTwoTags * 2) - turnsSinceLastTag; // *2 because there are two fighters
        if(turnsToWait > 0){
            flag = false;
            this.message.addHit(`[b][color=red]You can't tag yet. Turns left: ${turnsToWait}[/color][/b]`);
            this.sendMessage();
        }
        if(!this.currentTarget.canMoveFromOrOffRing){
            flag = false;
            this.message.addHit(`[b][color=red]You can't tag with this character. They're permanently out.[/color][/b]`);
            this.sendMessage();
        }
        return flag;
    }

    canAttack(action:Action){
        let flag = true;
        if(action == undefined){
            flag = false;
            this.message.addError(Constants.Messages.canAttackNoAction);
        }
        if(!this.waitingForAction){
            flag = false;
            this.message.addError(Constants.Messages.canAttackNotWaitingForAction);
        }
        if(this.currentPlayer.isTechnicallyOut()){
            flag = false;
            this.message.addError(Constants.Messages.canAttackIsOut);
        }
        if(!this.currentPlayer.isInTheRing){
            flag = false;
            this.message.addError(Constants.Messages.canAttackIsOutOfTheRing);
        }
        if(!this.currentTarget.isInTheRing){
            flag = false;
            this.message.addError(Constants.Messages.canAttackTargetIsOutOfTheRing);
        }
        if(this.currentTarget.isTechnicallyOut()){
            flag = false;
            this.message.addError(Constants.Messages.canAttackTargetOutOfFight);
        }
        if(action == Action.SubHold || action == Action.SexHold || action == Action.HumHold || action == Action.Bondage){
            if(this.currentPlayer.isInHold()){
                flag = false;
                this.message.addError(Constants.Messages.canAttackIsInHold);
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
                this.message.addError(Constants.Messages.checkAttackRequirementsNotInSexualHold);
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
                this.message.addError(Constants.Messages.doActionNotActorsTurn);
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
                            this.message.addInfo(Constants.Messages.doActionTargetIsSameTeam);
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
                attacker.triggerMods(TriggerMoment.After, eventToTriggerAfter, attacker.pendingAction);
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

        var lowestLoserTier = -99;
        for(let fighter of this.fighterList){
            if(fighter.assignedTeam != winnerTeam){
                if(lowestLoserTier == -99){
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
                this.message.addHit(Utils.strFormat(Constants.Messages.forfeitItemApply, [fighter.getStylizedName()]));
                for(var i = 0; i < 3; i++){
                    fighter.modifiers.push(new BondageModifier(fighter));
                }
                fighter.forfeits++;
                this.message.addHit(Utils.strFormat(Constants.Messages.forfeitTooManyItems, [fighter.getStylizedName()]));
                fighter.triggerPermanentOutsideRing();
            }
            else{
                this.message.addError(Constants.Messages.forfeitAlreadyOut);
                this.sendMessage();
                return;
            }
        }
        else{
            this.message.addInfo(`You are not participating in the match. OH, and that message should NEVER happen.`);
            this.sendMessage();
            return;
        }
        this.sendMessage();
        if (this.isFightOver()) {
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]]*Constants.Fight.Globals.tokensPerLossMultiplier;
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
            this.message.addInfo(Constants.Messages.checkForDrawOK);
            this.sendMessage();
            let tokensToGive:number = this.currentTurn;
            if(tokensToGive > parseInt(TokensPerWin[FightTier.Bronze])){
                tokensToGive = parseInt(TokensPerWin[FightTier.Bronze]);
            }
            this.endFight(0,tokensToGive, Team.Unknown); //0 because there isn't a winning team
        }
        else{
            this.message.addInfo(Constants.Messages.checkForDrawWaiting);
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
            this.message.addInfo(Utils.strFormat(Constants.Messages.endFightAnnounce, [Team[this.winnerTeam]]));
            this.sendMessage();
        }
        Fight.commitEndFightDb(this, tokensToGiveToWinners, tokensToGiveToLosers);
    }

    static commitEndFightDb(fight, tokensToGiveToWinners, tokensToGiveToLosers){
        Data.db.beginTransaction(err =>{
            var sql = "UPDATE `flistplugins`.?? SET `currentTurn` = ?, `fighterList` = ?, `hasEnded` = ?, `winnerTeam` = ? WHERE `idFight` = ?;";
            sql = Data.db.format(sql, [Constants.SQL.fightTableName, fight.currentTurn, "", true, fight.winnerTeam, fight.id]);
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
                            fight.message.addInfo(`Awarded ${tokensToGiveToWinners} ${Constants.Globals.currencyName} to ${fighter.getStylizedName()}`);
                            fighter.giveTokens(tokensToGiveToWinners)
                            callsToMake.push(fighter.update());
                        }
                        else{
                            if(fight.winnerTeam != Team.Unknown){
                                fighter.losses++;
                            }
                            fight.message.addInfo(`Awarded ${tokensToGiveToLosers} ${Constants.Globals.currencyName} to ${fighter.getStylizedName()}`);
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