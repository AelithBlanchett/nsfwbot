import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {TeamList} from "./TeamList";
import BaseDamage = Constants.BaseDamage;
import Tiers = Constants.Tiers;
import RequiredRoll = Constants.RequiredRoll;

export class Fight extends BaseModel{
    id:number = -1;
    hasStarted:boolean  = false;
    stage:string;

    //real fighting variables
    teamList:TeamList;
    currentTurn:number = 0;

    fightActions:Array<FightAction>;
    attacker:Fighter;
    defender:Fighter;
    holdAttacker:Fighter;
    holdDefender:Fighter;

    message:string = "";
    fChatLibInstance:IFChatLib;
    channel:string;

    public constructor(fChatLibInstance:IFChatLib, channel:string, stage?:string) {
        super();
        this.stage = stage || "Wrestling Ring";
        this.fChatLibInstance = fChatLibInstance;
        this.channel = channel;
        this.teamList = new TeamList();
    }

    //Pre-fight utils

    join(fighter:Fighter, team:Team){
        if(!this.hasStarted){
            if(!this.teamList.getFighter(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.teamList.getAvailableTeam();
                    console.log(`assigned team ${fighter.assignedTeam} to ${fighter.name}`);
                }
                if(!this.teamList.containsKey(fighter.assignedTeam)){
                    this.teamList.add(fighter.assignedTeam, []);
                }
                this.teamList.getValue(fighter.assignedTeam).push(fighter);
                return true;
            }
        }
        return false;
    }

    setFighterReady(fighter:Fighter){
        if(!this.hasStarted){
            if(!this.teamList.getFighter(fighter.name)){
                this.join(fighter, Team.Unknown);
            }
            var fighterInFight = this.teamList.getFighter(fighter.name);
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
        let areTeamsBalanced:boolean = true;
        for(var i = 1; i < this.teamList.keys().length; i++)
        {
            if(this.teamList.values()[i].length !== this.teamList.values()[i].length)
                areTeamsBalanced = false;
        }
        return (this.teamList.isEveryoneReady() && areTeamsBalanced && !this.hasStarted && this.teamList.keys().length >= Constants.usedTeams); //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");
        this.hasStarted = true;

        this.teamList.resetCurrentFighters();

        this.teamList.shufflePlayers(); //random order for teams

        for(let i = 0; i < this.teamList.playersPerTeam; i++){ //Prints as much names as there are team
            let fullStringVS = "[b]";
            for(let j = 0; j < this.teamList.teamsInvolved; j++){
                let theFighter=this.teamList.getValue(this.teamList.keys()[j])[i];
                fullStringVS = `${fullStringVS} VS ${theFighter.getStylizedName()}`;
            }
            fullStringVS = `${fullStringVS}[/b]`;
            fullStringVS =  fullStringVS.replace(" VS ","");
            this.addMessage(fullStringVS);
        }


        this.sendMessage();
        this.teamList.currentTeamTurn = this.rollAllDiceForTurns();
        this.teamList.currentTeamTurnIndex = 0;
        this.addMessage(`${this.currentTeamName} team starts first!`);
        this.sendMessage();
        this.currentTurn++;
        this.outputStatus();
    }

    nextTurn(){
        this.currentTurn++;
        this.teamList.nextTurn();
        this.outputStatus();
        this.actionBrawl(Tiers.Light);
    }

    //Fighting info displays

    outputStatus(){
        this.addMessage(`\n[b]Turn #${this.currentTurn}[/b] [color=${this.currentTeamName}]------ ${this.currentTeamName} team ------[/color] It's [u]${this.currentActor.getStylizedName()}[/u]'s turn.\n`);

        for(let i = 0; i < this.teamList.teamsInvolved; i++){ //Prints as much names as there are team
            for(let j = 0; j < this.teamList.playersPerTeam; j++){
                let fighter = this.teamList.getPlayerInTeamAtIndex(this.teamList.keys()[i], j);
                this.addMessage(fighter.outputStatus());
            }
        }

        this.sendMessage();
    }


    //Fight helpers
    get currentTeamName(){
        return Team[this.teamList.currentTeamTurn];
    }

    get currentActor():Fighter{
        return this.teamList.getValue(this.teamList.currentTeamTurn)[this.teamList.arrCurrentFighterForTeam.getValue(this.teamList.currentTeamTurn)];
    }

    get currentTarget():Fighter{
        return this.currentActor.target;
    }

    assignRandomTargetToAllFighters():void{
        for(let fighter of this.teamList.getAllPlayers()){
            fighter.target = this.teamList.getRandomFighter();
        }
    }

    assignRandomTarget(fighter:Fighter):void{
        fighter.target = this.teamList.getRandomFighter();
    }

    assignMatchingTarget(fighter:Fighter):void{
        fighter.target = this.teamList.getRandomFighter();
    }

    //Dice rolling

    rollAllDiceForTurns(){ //make this modular to teams
        let arrResults = new Dictionary<Team,number>();
        let theDice = new Dice(10);
        for(var team of this.teamList.keys()){
            arrResults.add(team, theDice.roll(1));
            this.addMessage(`[color=${Team[team]}]${Team[team]}[/color] team rolled a ${arrResults.getValue(team)}`);
        }

        let bestScore = Math.max(...arrResults.values());
        let indexOfBestTeam = arrResults.values().indexOf(bestScore);
        let worstScore = Math.min(...arrResults.values());
        let indexOfWorstTeam = arrResults.values().indexOf(worstScore);

        if(bestScore == worstScore || Utils.getAllIndexes(arrResults.values(),bestScore).length != 1){
            this.addMessage("Tie! Re-rolling.")
            this.sendMessage();
            this.rollAllDiceForTurns();
        }

        let arrSortedTeams = new Array<Team>();
        for(let i = 0; i <this.teamList.teamsInvolved; i++){
            let worstScore = Math.min(...arrResults.values());
            let indexOfWorstTeam = arrResults.values().indexOf(worstScore);
            let worstTeam = arrResults.keys()[indexOfWorstTeam] as Team;
            this.addMessage(`\n[color=${Team[worstTeam]}]${Team[worstTeam]} team[/color] will start at position #${this.teamList.teamsInvolved-i}`)
            arrSortedTeams.unshift(worstTeam);
            arrResults.remove(worstTeam);
        }
        this.teamList.arrTeamsTurn = arrSortedTeams;

        let winner:Team;
        winner = Team[Team[arrSortedTeams[0]]];
        return winner;
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

    attackFormula(tier:Tiers, actorAtk:number, targetDef:number, roll:number):number{
        return BaseDamage[BaseDamage[tier]]-(actorAtk-targetDef)+roll;
    }

    actionBrawl(tier:Tiers){//todo
        let action = new FightAction();
        action.tier = tier;
        action.atTurn = this.currentTurn;
        action.action = "brawl";
        action.isHold = false;
        action.attacker = this.currentActor;
        action.defender = this.currentTarget;
        let roll = this.currentActor.dice.roll(1);
        if(roll >= RequiredRoll[Tiers[tier]]){
            action.missed = false;
            action.diceScore = roll;
            this.addMessage(`${this.currentActor.name} rolled ${action.diceScore}, the attack [b][color=green]HITS![/color][/b]`);
        }
        else{
            this.addMessage(`${this.currentActor.name} rolled ${action.diceScore}, the attack [b][color=red]MISSED![/color][/b]`);
        }

        if(!action.missed){
            if(this.currentTarget == undefined){
                this.currentActor.target = this.teamList.getNextPlayer();
            }
            action.hpDamage = this.attackFormula(tier, this.currentActor.power, this.currentTarget.toughness, action.diceScore);
        }
        this.currentActor.pastActions.push(action);
        if(action.hpDamage){
            this.currentTarget.hitHp(action.hpDamage);
        }

        this.nextTurn();
    }

}