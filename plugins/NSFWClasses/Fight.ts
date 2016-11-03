import {Dice} from "./Dice";
import {Action, ActionType} from "./Action";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import * as Constants from "./Constants";
import Team = Constants.Team;
import BaseDamage = Constants.BaseDamage;
import Tier = Constants.Tier;
import FightType = Constants.FightType;
import {Data} from "./Model";
import FightTier = Constants.FightTier;
import TokensPerWin = Constants.TokensPerWin;
import Trigger = Constants.Trigger;
import {Modifier} from "./Modifier";
import ModifierType = Constants.ModifierType;
import {BondageModifier} from "./CustomModifiers";
import TriggerMoment = Constants.TriggerMoment;
import {Message} from "./Messaging";
var CircularJSON = require('circular-json');
var ES = require("es-abstract/es6.js");
import {Table, Column, PrimaryColumn, ManyToOne, JoinTable, PrimaryGeneratedColumn, ManyToMany} from "typeorm";
import {ActiveFighter} from "./ActiveFighter";
import {OneToMany} from "typeorm/index";
import {CreateDateColumn} from "typeorm/index";
import {UpdateDateColumn} from "typeorm/index";

@Table(Constants.SQL.fightTableName)
export class Fight{

    @PrimaryGeneratedColumn()
    id:number = -1;

    @Column("int")
    requiredTeams:number = 2;

    @Column("boolean")
    hasStarted:boolean = false;

    @Column("boolean")
    hasEnded:boolean = false;

    @Column("string")
    stage:string;

    @OneToMany(type => ActiveFighter, fighter => fighter.fight, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true
    })
    @JoinTable()
    fighters:ActiveFighter[] = [];

    @Column("int")
    currentTurn:number = 0;

    @Column("int")
    fightType:FightType = FightType.Rumble;

    @ManyToOne(type => Action, fightAction => fightAction.fight, {
        cascadeInsert: true,
        cascadeUpdate: true,
        cascadeRemove: true
    })
    @JoinTable()
    pastActions:Array<Action> = [];

    @Column("int")
    winnerTeam:Team = Team.Unknown;

    @Column("boolean")
    waitingForAction:boolean = true;

    message:Message;
    lastMessage:Message;
    fChatLibInstance:IFChatLib;

    @Column("string")
    channel:string;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    public constructor(fChatLibInstance?:IFChatLib, channel?:string, stage?:string) {
        this.stage = stage || this.pickStage();
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.message = new Message(fChatLibInstance, channel);
    }

    setTeamsCount(intNewNumberOfTeams:number){
        if(intNewNumberOfTeams >= 2){
            this.requiredTeams = intNewNumberOfTeams;
            this.message.addInfo(Constants.Messages.changeMinTeamsInvolvedInFightOK);
        }
        else{
            this.message.addInfo(Constants.Messages.changeMinTeamsInvolvedInFightFail);
        }
        this.message.send();
    }

    setFightType(type:string){
        if(!this.hasStarted && !this.hasEnded){
            switch(type.toLowerCase()){
                case "classic":
                    this.fightType = FightType.Rumble;
                    this.message.addInfo(Constants.Messages.setFightTypeRumble);
                    break;
                case "tag":
                case "tagteam":
                case "tag-team":
                    this.fightType = FightType.Tag;
                    this.message.addInfo(Constants.Messages.setFightTypeTag);
                    break;
                case "lastmanstanding":
                    this.fightType = FightType.LastManStanding;
                    this.message.addInfo(Constants.Messages.setFightTypeLMS);
                    break;
                case "sex-fight":
                case "sexfight":
                    this.fightType = FightType.SexFight;
                    this.message.addInfo(Constants.Messages.setFightTypeSexFight);
                    break;
                case "humiliation":
                    this.fightType = FightType.Humiliation;
                    this.message.addInfo(Constants.Messages.setFightTypeHMatch);
                    break;
                case "bondage":
                    this.fightType = FightType.Humiliation;
                    this.message.addInfo(Constants.Messages.setFightTypeBondageMatch);
                    break;
                default:
                    this.fightType = FightType.Rumble;
                    this.message.addInfo(Constants.Messages.setFightTypeNotFound);
                    break;
            }
        }
        else{
            this.message.addInfo(Constants.Messages.setFightTypeFail);
        }
        this.message.send();
    }

    static async saveState(fight) {
        let connection = await Data.getDb();
        let fightRepo = connection.getRepository(Fight);
        await fightRepo.persist(fight);
    }

    static async loadState(fightId:number, fight:Fight) {
        let connection = await Data.getDb();
        let fightRepo = connection.getRepository(Fight);
        fight = await fightRepo.findOneById(fightId);
    }

    //Pre-fight utils

    //TODO transition between Fighter and ActiveFighter
    leave(fighter:ActiveFighter) {
        if(!this.hasStarted){
            let index = this.findFighterIndex(x => x.name == fighter.name);
            if(index != -1){
                fighter.assignedTeam = null;
                fighter.fight = null;
                this.fighters.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    //TODO transition between Fighter and ActiveFighter
    join(fighter:ActiveFighter, team:Team) {
        if(!this.hasStarted){
            if (!this.getFighterByName(fighter.name)) { //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.getAvailableTeam();
                    //console.log(`assigned team ${fighter.assignedTeam} to ${fighter.name}`);
                }
                fighter.fight = this;
                this.fighters.push(fighter);
                return true;
            }
        }
        return false;
    }

    //TODO transition between Fighter and ActiveFighter
    setFighterReady(fighter:ActiveFighter) {
        if(!this.hasStarted){
            if (!this.getFighterByName(fighter.name)) {
                this.join(fighter, Team.Unknown);
            }
            var fighterInFight = this.getFighterByName(fighter.name);
            if(fighterInFight && !fighterInFight.isReady){ //find fighter by its name property instead of comparing objects, which doesn't work.
                fighterInFight.isReady = true;
                this.message.addInfo(Utils.strFormat(Constants.Messages.Ready, [fighter.getStylizedName()]));
                this.message.send();
                if (this.canStart()) {
                    this.start();
                }
                return true;
            }
        }
        return false;
    }

    canStart() {
        let canGo = (this.isEveryoneReady() && !this.hasStarted && this.getTeamsStillInGame().length >= this.requiredTeams);
        return canGo; //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    start() {
        this.message.addInfo(Constants.Messages.startMatchAnnounce);
        this.hasStarted = true;
        this.shufflePlayers(); //random order for teams

        this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchStageAnnounce, [this.stage]));

        for (let i = 0; i < this.maxPlayersPerTeam; i++) { //Prints as much names as there are team
            let fullStringVS = "[b]";
            for (let j of this.getTeamsStillInGame()) {
                let theFighter = this.getTeam(j)[i];
                if(theFighter != undefined){
                    fullStringVS = `${fullStringVS} VS ${theFighter.getStylizedName()}`;
                }
            }
            fullStringVS = `${fullStringVS}[/b]`;
            fullStringVS =  fullStringVS.replace(" VS ","");
            this.message.addInfo(fullStringVS);
        }


        this.reorderFightersByInitiative(this.rollAllDice(Trigger.InitiationRoll));
        this.currentTurn = 1;
        this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchFirstPlayer, [this.currentPlayer.getStylizedName(), this.currentTeamName.toLowerCase(), this.currentTeamName]));
        for (let i = 1; i < this.fighters.length; i++) {
            this.message.addInfo(Utils.strFormat(Constants.Messages.startMatchFollowedBy, [this.fighters[i].getStylizedName(), Team[this.fighters[i].assignedTeam].toLowerCase(), Team[this.fighters[i].assignedTeam]]));
            if(this.fightType == FightType.Tag) {
                this.fighters[i].isInTheRing = false;
            }
        }
        if(this.fightType == FightType.Tag){ //if it's a tag match, only allow the first player of the next team
            for (let i = 1; i < this.fighters.length; i++) {
                if (this.currentPlayer.assignedTeam != this.fighters[i].assignedTeam) {
                    this.fighters[i].isInTheRing = true;
                    break;
                }
            }
        }

        //Features loading
        for (let i = 0; i < this.fighters.length; i++) {
            for (let feature of this.fighters[i].features) {
                let modToAdd = feature.getModifier(this, this.fighters[i]);
                if(modToAdd){
                    this.fighters[i].modifiers.push(modToAdd);
                }
                if(feature.isExpired()){
                    this.fighters[i].removeFeature(feature.type);
                    this.message.addHint("This feature has expired.");
                    this.fighters[i].update();
                }
            }
        }

        this.message.send();
        Fight.saveState(this);
        this.outputStatus();
    }

    nextTurn(){
        for (let fighter of this.fighters) {
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

        if (this.isOver()) { //Check for the ending
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

    isOver():boolean {
        return this.getTeamsStillInGame().length <= 1;
    }

    //Fighting info displays

    outputStatus(){
        this.message.addInfo(Utils.strFormat(Constants.Messages.outputStatusInfo, [this.currentTurn.toString(), this.currentTeamName.toLowerCase(), this.currentTeamName, this.currentPlayer.getStylizedName()]));

        for (let i = 0; i < this.fighters.length; i++) { //Prints as much names as there are team
            let theFighter = this.fighters[i];
             if(theFighter != undefined){
                 this.message.addStatus(theFighter.outputStatus());
             }
        }

        this.message.send();
    }

    get currentTeam():Team{
        return this.getAlivePlayers()[(this.currentTurn - 1) % this.aliveFighterCount].assignedTeam;
    }

    get nextTeamToPlay():Team{
        return this.getAlivePlayers()[this.currentTurn % this.aliveFighterCount].assignedTeam;
    }

    get currentPlayer():ActiveFighter {
        return this.getAlivePlayers()[(this.currentTurn - 1) % this.aliveFighterCount];
    }

    get nextPlayer():ActiveFighter {
        return this.getAlivePlayers()[this.currentTurn % this.aliveFighterCount];
    }

    setCurrentPlayer(fighterName:string){
        let index = this.findFighterIndex((x) => x.name == fighterName && !x.isTechnicallyOut());
        if (index != -1 && this.fighters[0].name != fighterName) { //switch positions
            var temp = this.fighters[0];
            this.fighters[0] = this.fighters[index];
            this.fighters[index] = temp;
            this.fighters[0].isInTheRing = true;
            if (this.fighters[index].assignedTeam == this.fighters[0].assignedTeam && this.fighters[index].isInTheRing == true && this.fightType == FightType.Tag) {
                this.fighters[index].isInTheRing = false;
            }
            this.message.addInfo(Utils.strFormat(Constants.Messages.setCurrentPlayerOK, [temp.name, this.fighters[0].name]));
        }
        else{
            this.message.addInfo(Constants.Messages.setCurrentPlayerFail)
        }
    }

    //Fight helpers
    get currentTeamName(){
        return Team[this.currentTeam];
    }

    get currentTarget():ActiveFighter {
        return this.currentPlayer.target;
    }

    assignRandomTargetToAllFighters():void{
        for (let fighter of this.getAlivePlayers()) {
            this.assignRandomTargetToFighter(fighter);
        }
    }

    assignRandomTargetToFighter(fighter:ActiveFighter):void {
        fighter.target = this.getRandomFighterNotInTeam(fighter.assignedTeam);
    }

    //Dice rolling
    rollAllDice(event:Trigger):Array<ActiveFighter> {
        let arrSortedFightersByInitiative = [];
        for (let player of this.getAlivePlayers()) {
            player.lastDiceRoll = player.roll(10, event);
            arrSortedFightersByInitiative.push(player);
            this.message.addHint(Utils.strFormat(Constants.Messages.rollAllDiceEchoRoll, [player.getStylizedName(), player.lastDiceRoll.toString()]));
        }

        arrSortedFightersByInitiative.sort((a,b):number => {
            return b.lastDiceRoll - a.lastDiceRoll;
        });

        return arrSortedFightersByInitiative;
    }

    rollAllGetWinner(event:Trigger):ActiveFighter {
        return this.rollAllDice(event)[0];
    }

    //Attacks
    canTag(){
        let flag = true;
        let turnsSinceLastTag = (this.currentPlayer.lastTagTurn - this.currentTurn);
        let turnsToWait = (Constants.Fight.Action.Globals.turnsToWaitBetweenTwoTags * 2) - turnsSinceLastTag; // *2 because there are two fighters
        if(turnsToWait > 0){
            flag = false;
            this.message.addHit(`[b][color=red]You can't tag yet. Turns left: ${turnsToWait}[/color][/b]`);
            this.message.send();
        }
        if(!this.currentTarget.canMoveFromOrOffRing){
            flag = false;
            this.message.addHit(`[b][color=red]You can't tag with this character. They're permanently out.[/color][/b]`);
            this.message.send();
        }
        if(this.currentTarget.assignedTeam != this.currentPlayer.assignedTeam){
            flag = false;
            this.message.addHit(`[b][color=red]You can't tag with this character as they are not in your team.[/color][/b]`);
            this.message.send();
        }
        return flag;
    }

    canAttack(action:ActionType) {
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
        if (action == ActionType.SubHold || action == ActionType.SexHold || action == ActionType.HumHold || action == ActionType.Bondage) {
            if(this.currentPlayer.isInHold()){
                flag = false;
                this.message.addError(Constants.Messages.canAttackIsInHold);
            }
        }
        if(flag == false){
            this.message.send();
        }
        return flag;
    }

    checkAttackRequirements(action:ActionType) {
        let flag = true;
        if (action == ActionType.HumHold || action == ActionType.Bondage) {
            if(!this.currentTarget.isInSpecificHold(Constants.Modifier.SexHold)){
                flag = false;
                this.message.addError(Constants.Messages.checkAttackRequirementsNotInSexualHold);
            }
        }
        if (action == ActionType.Submit && this.fightType == FightType.LastManStanding) {
            flag = false;
            this.message.addError(Utils.strFormat(Constants.Messages.wrongMatchTypeForAction, ["submit", "Last Man Standing"]));
        }
        if(flag == false){
            this.message.send();
        }
        return flag;
    }

    validateTarget(){
        if(this.currentTarget == undefined || this.currentTarget.isTechnicallyOut() || !this.currentTarget.isInTheRing || this.currentTarget == this.currentPlayer){
            this.currentPlayer.target = this.getRandomFighterNotInTeam(this.currentPlayer.assignedTeam);
        }
    }

    assignTarget(fighterName:string, name:string) {
        let theTarget = this.getFighterByName(name);
        if(theTarget != undefined){
            this.getFighterByName(fighterName).target = theTarget;
            this.message.addInfo("Successfully set the target to "+name);
            this.message.send();
        }
        else{
            this.message.addError("Target not found.");
            this.message.send();
        }
    }

    doAction(fighterName:string, action:ActionType, tier:Tier, customTarget?:ActiveFighter) {
        if(this.hasStarted && !this.hasEnded){
            if (this.currentPlayer == undefined || fighterName != this.currentPlayer.name) {
                this.message.addError(Constants.Messages.doActionNotActorsTurn);
                this.message.send();
            }
            else{
                this.validateTarget();
                if(!this.canAttack(action)){
                    return;
                }
                if (action == ActionType.Tag) { //put in the condition any attacks that could focus allies
                    if(customTarget != undefined && customTarget.assignedTeam == this.currentPlayer.assignedTeam){
                        this.currentPlayer.target = customTarget;
                    }
                    if(!this.canTag())
                        return;
                }
                else{
                    if(customTarget != undefined){
                        if(customTarget.assignedTeam != this.currentPlayer.assignedTeam){
                            this.currentPlayer.target = customTarget;
                        }
                        else{
                            this.message.addInfo(Constants.Messages.doActionTargetIsSameTeam);
                            this.message.send();
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
                attacker.pendingAction = new Action(this, this.currentTurn, tier, action, attacker, defender);
                let eventToTriggerAfter = attacker.pendingAction.triggerAction(); //The specific trigger BEFORE is executed inside the attacks, see Action.ts
                attacker.triggerMods(TriggerMoment.After, eventToTriggerAfter, attacker.pendingAction);
                attacker.pendingAction.commit(this);
            }
        }
    }

    getFightTier(winnerTeam){
        var highestWinnerTier = FightTier.Bronze;
        for (let fighter of this.getTeam(winnerTeam)) {
            if(fighter.tier() > highestWinnerTier){
                highestWinnerTier = fighter.tier();
            }
        }

        var lowestLoserTier = -99;
        for (let fighter of this.fighters) {
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

    forfeit(fighter:ActiveFighter) {
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
                this.message.send();
                return;
            }
        }
        else{
            this.message.addInfo(`You are not participating in the match. OH, and that message should NEVER happen.`);
            this.message.send();
            return;
        }
        this.message.send();
        if (this.isOver()) {
            var tokensToGiveToWinners:number = TokensPerWin[FightTier[this.getFightTier(this.winnerTeam)]]*Constants.Fight.Globals.tokensPerLossMultiplier;
            this.endFight(tokensToGiveToWinners, 0);
        }
        else{
            this.nextTurn();
        }
    }

    checkForDraw(){
        let neededDrawFlags = this.getAlivePlayers().length;
        let drawFlags = 0;
        for (let fighter of this.getAlivePlayers()) {
            if(fighter.wantsDraw){
                drawFlags++;
            }
        }
        if(neededDrawFlags == drawFlags){
            this.message.addInfo(Constants.Messages.checkForDrawOK);
            this.message.send();
            let tokensToGive:number = this.currentTurn;
            if(tokensToGive > parseInt(TokensPerWin[FightTier.Bronze])){
                tokensToGive = parseInt(TokensPerWin[FightTier.Bronze]);
            }
            this.endFight(0,tokensToGive, Team.Unknown); //0 because there isn't a winning team
        }
        else{
            this.message.addInfo(Constants.Messages.checkForDrawWaiting);
            this.message.send();
        }
    }

    pickFinisher(){
        return Constants.finishers[Math.floor(Math.random() * Constants.finishers.length)];
    }

    endFight(tokensToGiveToWinners, tokensToGiveToLosers, forceWinner?:Team){
        this.hasEnded = true;
        this.hasStarted = false;
        
        if(!forceWinner){
            this.winnerTeam = this.getTeamsStillInGame()[0];
        }
        else{
            this.winnerTeam = forceWinner;
        }
        if(this.winnerTeam != Team.Unknown){
            this.message.addInfo(Utils.strFormat(Constants.Messages.endFightAnnounce, [Team[this.winnerTeam]]));
            this.message.addHit("Finisher suggestion: " + this.pickFinisher());
            this.message.send();
        }

        for (let fighter of this.fighters) {
            fighter.totalFights++;
            if (fighter.assignedTeam == this.winnerTeam) {
                fighter.wins++;
                this.message.addInfo(`Awarded ${tokensToGiveToWinners} ${Constants.Globals.currencyName} to ${fighter.getStylizedName()}`);
                fighter.giveTokens(tokensToGiveToWinners);
            }
            else {
                if (this.winnerTeam != Team.Unknown) {
                    fighter.losses++;
                }
                this.message.addInfo(`Awarded ${tokensToGiveToLosers} ${Constants.Globals.currencyName} to ${fighter.getStylizedName()}`);
                fighter.giveTokens(tokensToGiveToLosers);
            }
            this.message.addInfo(fighter.checkAchievements());
        }

        //TODO save fighters

        //TODO persist
        Fight.commitDb(this);
    }

    static async commitDb(fight) {
        let connection = await Data.getDb();
        let fightRepo = connection.getRepository(Fight);
        await fightRepo.persist(fight);
    }


    //FORMERLY FIGHTERLIST.TS

    findFighterIndex(predicate:(value:ActiveFighter) => boolean, thisArg?:any):number {
        var list = ES.ToObject(this.fighters);
        var length = ES.ToLength(ES.ToLength(list.length));
        if (!ES.IsCallable(predicate)) {
            throw new TypeError('Array#findIndex: predicate must be a function');
        }
        if (length === 0) return -1;
        var thisArg = arguments[1];
        for (var i = 0, value; i < length; i++) {
            value = list[i];
            if (ES.Call(predicate, thisArg, [value, i, list])) return i;
        }
        return -1;
    }

    reorderFightersByInitiative(arrFightersSortedByInitiative:Array<ActiveFighter>) {
        var index = 0;
        for (let fighter of arrFightersSortedByInitiative) {
            let indexToMoveInFront = this.getIndexOfPlayer(fighter);
            var temp = this[index];
            this.fighters[index] = this.fighters[indexToMoveInFront];
            this.fighters[indexToMoveInFront] = temp;
            index++;
        }
    }

    getAlivePlayers():Array<ActiveFighter> {
        let arrPlayers = new Array<ActiveFighter>();
        for (let player of this.fighters) {
            if (!player.isTechnicallyOut() && player.isInTheRing) {
                arrPlayers.push(player);
            }
        }
        return arrPlayers;
    }

    getFighterByName(name:string) {
        let fighter = null;
        for (let player of this.fighters) {
            if (player.name == name) {
                fighter = player;
            }
        }
        return fighter;
    }

    getIndexOfPlayer(fighter:ActiveFighter) {
        let index = -1;
        for (let i = 0; i < this.fighters.length; i++) {
            if (this[i].name == fighter.name) {
                index = i;
            }
        }
        return index;
    }

    getFirstPlayerIDAliveInTeam(team:Team, afterIndex:number = 0):number {
        let fullTeam = this.getTeam(team);
        var index = -1;
        for (let i = afterIndex; i < fullTeam.length; i++) {
            if (fullTeam[i] != undefined && !fullTeam[i].isTechnicallyOut() && fullTeam[i].isInTheRing) {
                index = i;
            }
        }
        return index;
    }

    shufflePlayers():void {
        for (var i = 0; i < this.fighters.length - 1; i++) {
            var j = i + Math.floor(Math.random() * (this.fighters.length - i));

            var temp = this.fighters[j];
            this.fighters[j] = this.fighters[i];
            this.fighters[i] = temp;
        }
    }

    getTeam(team:Team):Array<ActiveFighter> {
        let teamList = new Array<ActiveFighter>();
        for (let player of this.fighters) {
            if (player.assignedTeam == team) {
                teamList.push(player);
            }
        }
        return teamList;
    }

    getNumberOfPlayersInTeam(team:Team):number {
        let count = 0;
        let fullTeamCount = this.getTeam(team);
        return fullTeamCount.length;
    }

    getAllUsedTeams():Array<Team> {
        let usedTeams:Array<Team> = [];
        for (let player of this.fighters) {
            if (usedTeams.indexOf(player.assignedTeam) == -1) {
                usedTeams.push(player.assignedTeam);
            }
        }
        var teamIndex = 0;
        while (usedTeams.length < this.requiredTeams) {
            let teamToAdd = Team[Team[teamIndex]];
            if (usedTeams.indexOf(teamToAdd)) {
                usedTeams.push(teamToAdd);
            }
            teamIndex++;
        }
        return usedTeams;
    }

    getTeamsStillInGame():Array<Team> {
        let usedTeams:Array<Team> = [];
        for (let player of this.getAlivePlayers()) {
            if (usedTeams.indexOf(player.assignedTeam) == -1) {
                usedTeams.push(player.assignedTeam);
            }
        }
        return usedTeams;
    }

    getTeamsIdList():Array<number> {
        let arrResult = [];
        for (var enumMember in Team) {
            var isValueProperty = parseInt(enumMember, 10) >= 0;
            if (isValueProperty) {
                arrResult.push(enumMember);
            }
        }
        return arrResult;
    }

    getRandomTeam():Team {
        return this.getTeamsStillInGame()[Utils.getRandomInt(0, this.numberOfTeamsInvolved)];
    }

    get numberOfTeamsInvolved():number {
        return this.getTeamsStillInGame().length;
    }

    get numberOfPlayersPerTeam():Array<number> {
        let count = Array<number>();
        for (let player of this.fighters) {
            if (count[player.assignedTeam] == undefined) {
                count[player.assignedTeam] = 1;
            }
            else {
                count[player.assignedTeam] = count[player.assignedTeam] + 1;
            }
        }
        return count;
    }

    get maxPlayersPerTeam():number { //returns 0 if there aren't any teams
        let maxCount = 0;
        for (let nb of this.numberOfPlayersPerTeam) {
            if (nb > maxCount) {
                maxCount = nb;
            }
        }
        return maxCount;
    }

    isEveryoneReady():boolean {
        let isEveryoneReady = true;
        for (let fighter of this.fighters) {
            if (!fighter.isReady) {
                isEveryoneReady = false;
            }
        }
        return isEveryoneReady;
    }

    getAvailableTeam():Team {
        let teamToUse:Team = Team.Blue;
        let arrPlayersCount = new Dictionary<Team, number>();
        let usedTeams = this.getAllUsedTeams();
        for (var teamId of usedTeams) {
            arrPlayersCount.add(teamId as Team, this.getNumberOfPlayersInTeam(Team[Team[teamId]]));
        }

        let mostPlayersInTeam = Math.max(...arrPlayersCount.values());
        let leastPlayersInTeam = Math.min(...arrPlayersCount.values());
        let indexOfFirstEmptiestTeam = arrPlayersCount.values().indexOf(leastPlayersInTeam);

        if (mostPlayersInTeam == leastPlayersInTeam || mostPlayersInTeam == -Infinity || leastPlayersInTeam == Infinity) {
            teamToUse = Team.Blue;
        }
        else {
            teamToUse = Team[Team[indexOfFirstEmptiestTeam]];
        }

        return teamToUse;
    }

    getRandomFighter():ActiveFighter {
        return this.getAlivePlayers()[Utils.getRandomInt(0, this.getAlivePlayers().length)];
    }

    getRandomFighterNotInTeam(team:Team):ActiveFighter {
        let tries = 0;
        let fighter:ActiveFighter;
        while (tries < 99 && (fighter == undefined || fighter.assignedTeam == undefined || fighter.assignedTeam == team)) {
            fighter = this.getRandomFighter();
            tries++;
        }
        return fighter;
    }


    //Misc. shortcuts
    get fighterCount():number {
        return this.fighters.length;
    }

    get aliveFighterCount():number {
        return this.getAlivePlayers().length;
    }

}