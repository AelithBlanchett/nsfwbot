import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";

export enum Team {
    Unknown = -1,
    Blue = 0,
    Red = 1
}

export class Fight extends BaseModel{
    id:number = -1;
    hasStarted:boolean  = false;
    fighters:Array<Fighter> = [];
    blueTeam:Array<Fighter> = [];
    redTeam:Array<Fighter> = [];
    stage:string;

    //real fighting variables
    fightActions:Array<FightAction>;
    intCurrentBlueFighter:number = -1;
    intCurrentRedFighter:number = -1;
    currentTeamTurn:Team;
    turnCounter:number = 0;
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
    }



    getFighterCount() {
        return this.fighters.length;
    }

    getId() {
        return this.id;
    }

    join(fighter:Fighter, team?:Team){
        if(!this.hasStarted){
            if(!this.findFighter(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != undefined){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.getTeamToAssign();
                }
                this.fighters.push(fighter);
                return true;
            }
        }
        return false;
    }

    getTeamToAssign(){
        if((this.blueTeam.length == this.redTeam.length) || (this.blueTeam.length < this.redTeam.length)){
            return Team.Blue;
        }
        else{
            return Team.Red;
        }
    }

    setFighterReady(fighter:Fighter){
        if(!this.hasStarted){
            if(!this.findFighter(fighter.name)){
                this.join(fighter);
            }
            var fighterInFight = this.findFighter(fighter.name);
            if(fighterInFight && !fighterInFight.isReady){ //find fighter by its name property instead of comparing objects, which doesn't work.
                fighterInFight.isReady = true;
                if(this.canStartMatch()){

                }
                return true;
            }
        }
        return false;
    }

    findFighter(name){
        let index = this.fighters.map(function(e) { return e.name; }).indexOf(name);
        return this.fighters[index];
    }

    findFighterId(name){
        let index = this.fighters.map(function(e) { return e.name; }).indexOf(name);
        return index;
    }

    canStartMatch(){ //TODO: check if teams are even
        let isEveryoneReady = false;
        let bluePlayers = 0;
        let redPlayers = 0;
        let areTeamsBalanced:boolean = false;
        if(!this.hasStarted && this.fighters.length > 1){
            isEveryoneReady = true;
            for(var fighter of this.fighters){
                if(fighter.assignedTeam == Team.Blue){
                    bluePlayers++;
                }
                else{
                    redPlayers++;
                }
                if(!fighter.isReady){
                    isEveryoneReady = false;
                }
            }
        }
        if(bluePlayers == redPlayers){
            areTeamsBalanced = true;
        }
        return (isEveryoneReady && areTeamsBalanced); //only start if everyone's ready and if the teams are balanced
    }

    startMatch(){
        this.addMessage("\n[color=green]Let's start the match![/color]");

        this.fighters = this.shuffleArray(this.fighters); //random order for teams
        for(var fighter of this.fighters){
            if(fighter.assignedTeam == Team.Blue){
                this.blueTeam.push(fighter);
            }
            else if(fighter.assignedTeam == Team.Red){
                this.redTeam.push(fighter);
            } //possibility to add more
        }

        this.addMessage(`[b][color=blue]${this.blueTeam[0].name}[/color] VS [color=blue]${this.redTeam[0].name}[/color][/b]`);
        if(this.blueTeam.length > 1 && this.redTeam.length > 1){ //do we really want royal rumbles? I guess so
            for(var i = 1; i < (this.blueTeam.length) && (i < this.redTeam.length); i++){
                this.addMessage(`[b][color=blue]${this.blueTeam[i].name}[/color] VS [color=blue]${this.redTeam[i].name}[/color][/b]`);
            }
        }
        this.sendMessage();
        this.currentTeamTurn = this.rollBothDice();
        this.intCurrentBlueFighter = 0;
        this.intCurrentRedFighter = 0;
        this.addMessage(this.currentTeamTurn + " team starts first!");
        this.sendMessage();
    }

    nextTurn(){
        this.addMessage("It's now "+this.getCurrentActor().name+"'s turn.");
    }

    getCurrentActor(){
        if(this.currentTeamTurn == Team.Blue){
            return this.blueTeam[this.intCurrentBlueFighter];
        }
        else{
            return this.redTeam[this.intCurrentRedFighter];
        }
    }

    getCurrentTarget(){
        if(this.currentTeamTurn != Team.Blue){
            return this.blueTeam[this.intCurrentBlueFighter];
        }
        else{
            return this.redTeam[this.intCurrentRedFighter];
        }
    }

    private shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    rollBothDice(){
        let intBlueResult:number = this.blueTeam[0].dice.roll(1);
        let intRedResult:number = this.redTeam[0].dice.roll(1);
        this.addMessage("\nBlue team rolled a "+intBlueResult.toString());
        this.addMessage("\nRed team rolled a "+intRedResult.toString());
        if(intBlueResult == intRedResult){
            this.rollBothDice();
        }
        let winner:Team = Team.Unknown;
        if(intBlueResult > intRedResult){
            winner = Team.Blue;
        }
        else{
            winner = Team.Red;
        }
        return winner;
    }

    addMessage(strMsg:string){
        this.message += strMsg +"\n";
    }

    sendMessage(){
        this.fChatLibInstance.sendMessage(this.message, this.channel);
    }

}