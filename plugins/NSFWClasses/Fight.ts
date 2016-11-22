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
import FightTier = Constants.FightTier;
import TokensPerWin = Constants.TokensPerWin;
import Trigger = Constants.Trigger;
import {Modifier} from "./Modifier";
import ModifierType = Constants.ModifierType;
import {BondageModifier} from "./CustomModifiers";
import TriggerMoment = Constants.TriggerMoment;
import {Message} from "./Messaging";
var CircularJSON = require('circular-json');
import {ActiveFighter} from "./ActiveFighter";
import {Feature} from "./Feature";
import {Fighter} from "./Fighter";

export class Fight{

    id:number = -1;
    requiredTeams:number = 2;
    hasStarted:boolean = false;
    hasEnded:boolean = false;
    stage:string;
    fighters:ActiveFighter[] = [];
    currentTurn:number = 0;
    fightType:FightType = FightType.Rumble;
    pastActions:Array<Action> = [];
    winnerTeam:Team = Team.Unknown;
    waitingForAction:boolean = true;
    message:Message;
    lastMessage:Message;
    fChatLibInstance:IFChatLib;
    channel:string;
    createdAt:Date;
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

    //Pre-fight utils

    async leave(fighterName:string) {
        if(!this.hasStarted){
            let index = this.getFighterIndex(fighterName);
            if(index != -1){
                let fighter = this.fighters[index];
                this.fighters.splice(index, 1);

                //delete from DB
                try {
                    let activeFighterToRemove = await ActiveFighter.load(fighter.name, this.id);
                    await ActiveFighter.delete(fighter.name, this.id);
                }
                catch (ex) {
                    this.fChatLibInstance.throwError(Utils.strFormat(Constants.Messages.commandError, ex.message));
                }
            }
        }
    }

    async join(fighterName:string, team:Team):Promise<number> {
        if(!this.hasStarted){
            if (!this.getFighterByName(fighterName)) { //find fighter by its name property instead of comparing objects, which doesn't work.
                let activeFighter:ActiveFighter = new ActiveFighter(fighterName);
                await activeFighter.init(this);
                if(team != Team.Unknown){
                    activeFighter.assignedTeam = team;
                }
                else{
                    team = this.getAvailableTeam();
                    activeFighter.assignedTeam = team;
                }
                activeFighter.fight = this;
                this.fighters.push(activeFighter);
                return team;
            }
            else {
                throw new Error("You have already joined the fight.");
            }
        }
        else {
            throw new Error("The fight has already started");
        }
    }

    async setFighterReady(fighterName:string) {
        if(!this.hasStarted){
            if (!this.getFighterByName(fighterName)) {
                await this.join(fighterName, Team.Unknown);
            }
            var fighterInFight:ActiveFighter = this.getFighterByName(fighterName);
            if(fighterInFight && !fighterInFight.isReady){ //find fighter by its name property instead of comparing objects, which doesn't work.
                fighterInFight.isReady = true;
                this.message.addInfo(Utils.strFormat(Constants.Messages.Ready, [fighterInFight.getStylizedName()])); //Find out why the f it doesn't work
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
        let canGo = (this.isEveryoneReady() && !this.hasStarted && this.getAllOccupiedTeams().length >= this.requiredTeams);
        return canGo; //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    async start() {
        this.message.addInfo(Constants.Messages.startMatchAnnounce);
        this.currentTurn = 1;
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

        for (let i = 0; i < this.fighters.length; i++) {
            for (let feature of this.fighters[i].features) {
                let modToAdd = feature.getModifier(this, this.fighters[i]);
                if (modToAdd) {
                    this.fighters[i].modifiers.push(modToAdd);
                }
                if (feature.isExpired()) {
                    this.fighters[i].removeFeature(feature.type);
                    this.message.addHint("This feature has expired.");
                    Fighter.save(this.fighters[i]); //save Fighter or ActiveFighter?
                }
            }
        }

        this.message.send();
        await Fight.save(this);
        this.outputStatus();
    }

    requestDraw(fighterName:string) {
        let fighter = this.getFighterByName(fighterName);
        if (fighter) {
            if (!fighter.isRequestingDraw()) {
                fighter.requestDraw();
            }
            else {
                throw new Error("You already have requested a draw.");
            }
        }
        else {
            throw new Error("You aren't in this fight.");
        }
    }

    unrequestDraw(fighterName:string) {
        let fighter = this.getFighterByName(fighterName);
        if (fighter) {
            if (fighter.isRequestingDraw()) {
                fighter.unrequestDraw();
            }
            else {
                throw new Error("You already have requested a draw.");
            }
        }
        else {
            throw new Error("You aren't in this fight.");
        }
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
            Fight.save(this);
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

    get currentPlayerIndex():number {
        let curTurn = 1;
        if(this.currentTurn > 0){
            curTurn = this.currentTurn - 1;
        }
        return curTurn % this.aliveFighterCount;
    }

    get currentPlayer():ActiveFighter {
        return this.getAlivePlayers()[this.currentPlayerIndex];
    }

    get nextPlayer():ActiveFighter {
        return this.getAlivePlayers()[this.currentTurn % this.aliveFighterCount];
    }

    setCurrentPlayer(fighterName:string){
        let index = this.fighters.findIndex((x) => x.name == fighterName && !x.isTechnicallyOut());
        if (index != -1 && this.fighters[this.currentPlayerIndex].name != fighterName) { //switch positions
            var temp = this.fighters[this.currentPlayerIndex];
            this.fighters[this.currentPlayerIndex] = this.fighters[index];
            this.fighters[index] = temp;
            this.fighters[this.currentPlayerIndex].isInTheRing = true;
            if (this.fighters[index].assignedTeam == this.fighters[this.currentPlayerIndex].assignedTeam && this.fighters[index].isInTheRing == true && this.fightType == FightType.Tag) {
                this.fighters[index].isInTheRing = false;
            }
            this.message.addInfo(Utils.strFormat(Constants.Messages.setCurrentPlayerOK, [temp.name, this.fighters[this.currentPlayerIndex].name]));
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
    checkIfCanTag() {
        let turnsSinceLastTag = (this.currentPlayer.lastTagTurn - this.currentTurn);
        let turnsToWait = (Constants.Fight.Action.Globals.turnsToWaitBetweenTwoTags * 2) - turnsSinceLastTag; // *2 because there are two fighters
        if(turnsToWait > 0){
            throw new Error(`[b][color=red]You can't tag yet. Turns left: ${turnsToWait}[/color][/b]`);
        }
        if(!this.currentTarget.canMoveFromOrOffRing){
            throw new Error(`[b][color=red]You can't tag with this character. They're permanently out.[/color][/b]`);
        }
        if(this.currentTarget.assignedTeam != this.currentPlayer.assignedTeam){
            throw new Error(`[b][color=red]You can't tag with this character as they are not in your team.[/color][/b]`);
        }
    }

    canAttack(action:ActionType) {
        if(action == undefined){
            throw new Error(Constants.Messages.canAttackNoAction);
        }
        if(!this.waitingForAction){
            throw new Error(Constants.Messages.canAttackNotWaitingForAction);
        }
        if(this.currentPlayer.isTechnicallyOut()){
            throw new Error(Constants.Messages.canAttackIsOut);
        }
        if(!this.currentPlayer.isInTheRing){
            throw new Error(Constants.Messages.canAttackIsOutOfTheRing);
        }
        //if(!this.currentTarget.isInTheRing){
        //    throw new Error(Constants.Messages.canAttackTargetIsOutOfTheRing);
        //}
        //if(this.currentTarget.isTechnicallyOut()){
        //    throw new Error(Constants.Messages.canAttackTargetOutOfFight);
        //}
        if (action == ActionType.SubHold || action == ActionType.SexHold || action == ActionType.HumHold || action == ActionType.Bondage) {
            if(this.currentPlayer.isInHold()){
                throw new Error(Constants.Messages.canAttackIsInHold);
            }
        }
        return true;
    }

    isTargetValid() {
        if (!this.currentTarget.isInTheRing) {
            throw new Error(Constants.Messages.canAttackTargetIsOutOfTheRing);
        }
        if (this.currentTarget.isTechnicallyOut()) {
            throw new Error(Constants.Messages.canAttackTargetOutOfFight);
        }
        return true;
    }

    checkAttackRequirements(action:ActionType) {
        if (action == ActionType.HumHold || action == ActionType.Bondage) {
            if(!this.currentTarget.isInSpecificHold(Constants.Modifier.SexHold)){
                throw new Error(Constants.Messages.checkAttackRequirementsNotInSexualHold);
            }
        }
        if (action == ActionType.Submit && this.fightType == FightType.LastManStanding) {
            throw new Error(Utils.strFormat(Constants.Messages.wrongMatchTypeForAction, ["submit", "Last Man Standing"]));
        }
    }

    assignValidTargetIfWrong() {
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

    prepareAction(fighterName:string, actionType:ActionType, tierRequired:boolean, isCustomTargetInsteadOfTier:boolean, args:string) {
        let tier = Tier.None;
        let customTarget:string = null;
        if (!this.hasStarted) {
            throw new Error("There isn't any fight going on.");
        }

        if (this.currentPlayer == undefined || fighterName != this.currentPlayer.name) {
            throw new Error(Constants.Messages.doActionNotActorsTurn);
        }

        if (tierRequired) {
            tier = Utils.stringToEnum(Tier, args);
            if (tier == -1) {
                throw new Error(`The tier is required, and neither Light, Medium or Heavy was specified. Example: !${ActionType[actionType]} Medium`);
            }
        }
        if (isCustomTargetInsteadOfTier) {
            customTarget = args;
            if (this.getFighterByName(args) == null) {
                throw new Error("The character to tag with is required and wasn't found.");
            }
        }

        if (this.getFighterByName(fighterName)) {
            this.doAction(actionType, tier, customTarget);
        }
        else {
            throw new Error("You aren't participating in this fight.");
        }
    }

    doAction(action:ActionType, tier:Tier, customTarget:string) {
        if(this.hasStarted && !this.hasEnded){
            this.assignValidTargetIfWrong();
            if (!this.canAttack(action)) {
                return;
            }

            if (action == ActionType.Tag) { //put in the condition any attacks that could focus allies

                if (customTarget != null) {
                    let target = this.getFighterByName(customTarget);
                    if (target.assignedTeam == this.currentPlayer.assignedTeam) {
                        this.currentPlayer.target = target;
                    }
                }
                this.checkIfCanTag();
            }
            else {
                if (customTarget != null) {
                    let target = this.getFighterByName(customTarget);
                    if (target.assignedTeam != this.currentPlayer.assignedTeam) {
                        this.currentPlayer.target = target;
                    }
                    else {
                        throw new Error(Constants.Messages.doActionTargetIsSameTeam);
                    }
                }
                this.isTargetValid();
            }

            this.checkAttackRequirements(action);

            this.waitingForAction = false;
            let attacker = this.currentPlayer; // need to store them in case of turn-changing logic
            let defender = this.currentTarget;

            attacker.pendingAction = new Action(this, this.currentTurn, tier, action, attacker, defender);
            let eventToTriggerAfter = attacker.pendingAction.triggerAction(); //The specific trigger BEFORE is executed inside the attacks, see Action.ts
            attacker.triggerMods(TriggerMoment.After, eventToTriggerAfter, attacker.pendingAction);
            attacker.pendingAction.commit(this);
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

    forfeit(fighterName:string) {
        let fighter = this.getFighterByName(fighterName);
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

        Fight.save(this);
    }

    reorderFightersByInitiative(arrFightersSortedByInitiative:Array<ActiveFighter>) {
        var index = 0;
        for (let fighter of arrFightersSortedByInitiative) {
            let indexToMoveInFront = this.getFighterIndex(fighter.name);
            var temp = this.fighters[index];
            this.fighters[index] = this.fighters[indexToMoveInFront];
            this.fighters[indexToMoveInFront] = temp;
            index++;
        }
    }

    getAlivePlayers():Array<ActiveFighter> {
        let arrPlayers = [];
        for (let player of this.fighters) {
            if (!player.isTechnicallyOut() && player.isInTheRing) {
                arrPlayers.push(player);
            }
        }
        return arrPlayers;
    }

    getFighterByName(name:string):ActiveFighter {
        let fighter:ActiveFighter = null;
        for (let player of this.fighters) {
            if (player.name == name) {
                fighter = player;
            }
        }
        if (fighter == null) {
            //throw new Error("This fighter isn't participating in the fight.");
        }
        return fighter;
    }

    getFighterIndex(fighterName:string) {
        let index = -1;
        for (let i = 0; i < this.fighters.length; i++) {
            if (this.fighters[i].name == fighterName) {
                index = i;
            }
        }
        if (index == -1) {
            //throw new Error("This fighter isn't participating in the fight.");
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
        let teamList = [];
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

    getAllOccupiedTeams():Array<Team> {
        let usedTeams:Array<Team> = [];
        for (let player of this.fighters) {
            if (usedTeams.indexOf(player.assignedTeam) == -1) {
                usedTeams.push(player.assignedTeam);
            }
        }
        return usedTeams;
    }
    
    getAllUsedTeams():Array<Team> {
        let usedTeams:Array<Team> = this.getAllOccupiedTeams();
        
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


    static dbToObject():Fight{
        return new Fight(null, null);
    }

    static async save(fight:Fight):Promise<boolean>{
        return true;
    }

    static async delete(fightId:number):Promise<boolean>{
        return true;
    }

    static async load(fightId:number):Promise<Fight>{
        return new Fight(null);
    }

}