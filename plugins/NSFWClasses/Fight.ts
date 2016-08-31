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
    arrayCurrentFighterForTeam:Array<number>;
    currentTeamTurn:Team;
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
    }



    getFighterCount() {
        return this.fighters.length;
    }

    getId() {
        return this.id;
    }

    join(fighter:Fighter, team:Team){
        if(!this.hasStarted){
            if(!this.findFighter(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
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
        let bluePlayers = this.countPlayersInTeam(Team.Blue);
        let redPlayers = this.countPlayersInTeam(Team.Red);
        if((bluePlayers == redPlayers) || (bluePlayers < redPlayers)){
            return Team.Blue;
        }
        else{
            return Team.Red;
        }
    }

    setFighterReady(fighter:Fighter){
        if(!this.hasStarted){
            if(!this.findFighter(fighter.name)){
                this.join(fighter, Team.Unknown);
            }
            var fighterInFight = this.findFighter(fighter.name);
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

    findFighter(name){
        let index = this.fighters.map(function(e) { return e.name; }).indexOf(name);
        return this.fighters[index];
    }

    findFighterId(name){
        let index = this.fighters.map(function(e) { return e.name; }).indexOf(name);
        return index;
    }

    canStartMatch(){
        let areTeamsBalanced:boolean = false;
        if(this.countPlayersInTeam(Team.Red) == this.countPlayersInTeam(Team.Blue)){
            areTeamsBalanced = true;
        }
        return (this.isEveryoneReady() && areTeamsBalanced && !this.hasStarted && this.fighters.length > 1); //only start if everyone's ready and if the teams are balanced
    }

    isEveryoneReady(){
        let isEveryoneReady = true;
        for(var fighter of this.fighters){
            if(!fighter.isReady){
                isEveryoneReady = false;
            }
        }
        return isEveryoneReady;
    }

    countPlayersInTeam(team:Team){
        let count = 0;
        for(var fighter of this.fighters){
            if(fighter.assignedTeam == team){
                count++;
            }
        }
        return count;
    }

    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");
        this.hasStarted = true;

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
        this.currentTeamTurn = this.rollAllDice();
        for(var team in Team){
            this.arrayCurrentFighterForTeam[team] = 0;
        }
        this.addMessage(`${Team[this.currentTeamTurn]} team starts first!`);
        this.sendMessage();
        this.nextTurn();
    }

    outputStatus(){
        this.addMessage("\n[b]Turn #" + this.currentTurn + "[/b] --------------- It's [b][u][color=pink]P1[/color][/u][/b]'s turn.\n");
        for(var fighter of this.blueTeam){
            this.addMessage(this.outputPlayerStatus(fighter, Team.Blue));
        }
        for(var fighter of this.redTeam){
            this.addMessage(this.outputPlayerStatus(fighter, Team.Red));
        }
        this.sendMessage();
    }

    outputPlayerStatus(fighter:Fighter, team?:Team){
        return `[color=${Team[team]}][b]${fighter.name}: [/b]${fighter.hp}/${fighter.hpPerHeart} [color=red]HP[/color]  |  ${fighter.heartsRemaining}/${fighter.maxHearts} [color=red]Hearts[/color]  |  ${fighter.lust}/${fighter.lustPerOrgasm} [color=pink]Lust[/color]  |  ${fighter.orgasmsRemaining}/${fighter.maxOrgasms} [color=pink]Orgasms[/color]  |  [sub]${fighter.minFocus}[/sub]|[b]${fighter.focus}[/b]|[sub]${fighter.maxFocus}[/sub] Focus[/color]\n`;
    }

    nextTurn(){
        this.addMessage("It's now "+this.getCurrentActor().name+"'s turn.");
        this.outputStatus();
        //TODO: do turns
    }

    getCurrentActor(){
        if(this.currentTeamTurn == Team.Blue){
            return this.blueTeam[this.arrayCurrentFighterForTeam[Team.Blue]];
        }
        else{
            return this.redTeam[this.arrayCurrentFighterForTeam[Team.Red]];
        }
    }

    getCurrentTarget(){
        if(this.currentTeamTurn != Team.Blue){
            return this.blueTeam[this.arrayCurrentFighterForTeam[Team.Blue]];
        }
        else{
            return this.redTeam[this.arrayCurrentFighterForTeam[Team.Red]];
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

    rollAllDice(){ //make this modular to teams
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
        this.message = "";
    }

}