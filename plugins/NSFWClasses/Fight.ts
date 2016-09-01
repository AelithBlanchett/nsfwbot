import {Fighter} from "./Fighter";
import {BaseModel} from "./Model";
import {Dice} from "./Dice";
import {FightAction} from "./FightAction";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Utils} from "./Utils";
import {Dictionary} from "./Dictionary";
import {Constants} from "./Constants";
import Team = Constants.Team;

export class Fight extends BaseModel{
    id:number = -1;
    hasStarted:boolean  = false;
    stage:string;

    //real fighting variables
    arrCurrentFighterForTeam:Dictionary<Team,number>;
    arrTeams:Dictionary<Team,Array<Fighter>>;
    currentTeamTurn:Team = Team.Unknown;
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
        this.arrTeams = new Dictionary<Team,Array<Fighter>>();
        this.arrCurrentFighterForTeam = new Dictionary<Team,number>();
    }

    //Pre-fight utils

    join(fighter:Fighter, team:Team){
        if(!this.hasStarted){
            if(!this.findFighter(fighter.name)){ //find fighter by its name property instead of comparing objects, which doesn't work.
                if(team != Team.Unknown){
                    fighter.assignedTeam = team;
                }
                else{
                    fighter.assignedTeam = this.getTeamToAssign();
                }
                if(!this.arrTeams.containsKey(fighter.assignedTeam)){
                    this.arrTeams.add(fighter.assignedTeam, []);
                }
                this.arrTeams.getValue(fighter.assignedTeam).push(fighter);
                return true;
            }
        }
        return false;
    }

    getTeamToAssign(){
        let teamToUse:Team = Team.Blue;
        let arrPlayersCount = new Dictionary<Team, number>();
        let usedTeams= this.getUsedTeams();
        for(var teamId of usedTeams){
            arrPlayersCount.add(teamId as Team, this.getPlayersInTeam(Team[Team[teamId]]));
        }

        let mostPlayersInTeam = Math.max(...arrPlayersCount.values());
        let leastPlayersInTeam = Math.min(...arrPlayersCount.values());
        let indexOfFirstEmptiestTeam = arrPlayersCount.values().indexOf(leastPlayersInTeam);

        if(mostPlayersInTeam == leastPlayersInTeam){
            teamToUse = Team.Blue;
        }
        else{
            teamToUse = Team[Team[indexOfFirstEmptiestTeam]];
        }

        return teamToUse;
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

    isEveryoneReady(){
        let isEveryoneReady = true;
        for(let teamsList of this.arrTeams.values()){
            for(let fighter of teamsList){
                if(!fighter.isReady){
                    isEveryoneReady = false;
                }
            }
        }
        return isEveryoneReady;
    }

    canStartMatch(){
        let areTeamsBalanced:boolean = true;
        for(var i = 1; i < this.arrTeams.keys().length; i++)
        {
            if(this.arrTeams.values()[i].length !== this.arrTeams.values()[i].length)
                areTeamsBalanced = false;
        }
        return (this.isEveryoneReady() && areTeamsBalanced && !this.hasStarted && this.arrTeams.keys().length >= Constants.usedTeams); //only start if everyone's ready and if the teams are balanced
    }


    //Fight logic

    get teamsInvolved():number{
        return this.arrTeams.keys().length;
    }

    get playersPerTeam():number{ //returns 0 if there aren't any teams
        let number = 0;
        if(this.arrTeams.keys().length > 0){
            number = this.arrTeams.getValue(this.arrTeams.keys()[0]).length;
        }
        return number;
    }


    startMatch(){
        this.addMessage("\n[color=green]Everyone's ready, let's start the match![/color]");
        this.hasStarted = true;

        for(var team of this.getUsedTeams()){
            this.arrCurrentFighterForTeam.add(team, 0);
        }

        //random order for teams

        for(let i = 0; i < this.playersPerTeam; i++){ //Prints as much names as there are team
            let fullStringVS = "[b]";
            for(let j = 0; j < this.teamsInvolved; j++){
                let theFighter=this.arrTeams.getValue(this.arrTeams.keys()[j])[i];
                fullStringVS = `${fullStringVS} VS ${theFighter.getStylizedName()}`;
            }
            fullStringVS = `${fullStringVS}[/b]`;
            fullStringVS =  fullStringVS.replace(" VS ","");
            this.addMessage(fullStringVS);
        }


        this.sendMessage();
        this.currentTeamTurn = this.rollAllDice();
        this.addMessage(`${Team[this.currentTeamTurn]} team starts first!`);
        this.sendMessage();
        this.nextTurn();
    }

    nextTurn(){
        this.currentTurn++;
        this.outputStatus();
        //TODO: do turns
    }

    //Fighting info displays

    outputStatus(){
        this.addMessage(`\n[b]Turn #${this.currentTurn}[/b] --------------- It's [u]${this.currentActor.getStylizedName()}[/u]'s turn.\n`);

        for(let i = 0; i < this.teamsInvolved; i++){ //Prints as much names as there are team
            for(let j = 0; j < this.playersPerTeam; j++){
                let fighter = this.getPlayerInTeamAtIndex(this.arrTeams.keys()[i], j);
                this.addMessage(fighter.outputStatus());
            }
        }
        this.sendMessage();
    }


    //Fight helpers

    findFighter(name){
        for(let team of this.getUsedTeams()){
            if(this.arrTeams.getValue(team) != undefined){
                for(let i = 0; i < this.arrTeams.getValue(team).length; i++){
                    let tempFighter = this.getPlayerInTeamAtIndex(team, i);
                    if(tempFighter && tempFighter.name == name){
                        return tempFighter
                    }
                }
            }
        }
        return;
    }

    get currentActor():Fighter{
        return this.arrTeams.getValue(this.currentTeamTurn)[this.arrCurrentFighterForTeam.getValue(this.currentTeamTurn)];
    }

    get currentTarget():Fighter{
        return this.currentActor.target;
    }

    getPlayersInTeam(team:Team){
        let count = 0;
        for(let i = 0; i < this.teamsInvolved; i++){
            count += this.arrTeams.getValue(this.arrTeams.keys()[i]).length;
        }
        return count;
    }

    getPlayerInTeamAtIndex(team:Team, index:number):Fighter{
        let indexOfTeam = this.arrTeams.keys().indexOf(team);
        if(indexOfTeam != -1){
            let teamList = this.arrTeams.getValue(this.arrTeams.keys()[indexOfTeam]);
            if(teamList[index] != undefined){
                return teamList[index];
            }
        }
        return;
    }

    getUsedTeams():Array<Team>{
        let teamsList:Array<Team> = this.getTeamsIdList();
        let arrUsedTeamOrNot:Array<boolean> = [];
        for(var team of teamsList){
            arrUsedTeamOrNot[team] = false;
            if((this.getPlayersInTeam(Team[Team[team]]) > 0) || (team < Constants.usedTeams)){
                arrUsedTeamOrNot[team] = true;
            }
        }
        let usedTeams:Array<Team> = [];
        for(var i = 0; i<arrUsedTeamOrNot.length; i++){
            if(arrUsedTeamOrNot[i]){
                usedTeams.push(i);
            }
        }
        return usedTeams;
    }

    //Dice rolling

    rollAllDice(){ //make this modular to teams
        let arrResults = new Dictionary<Team,number>();
        let theDice = new Dice(10);
        for(var team of this.arrTeams.keys()){
            arrResults.add(team, theDice.roll(1));
            this.addMessage(`\n[color=${Team[team]}]${Team[team]}[/color] team rolled a ${arrResults.getValue(team)}`);
        }

        let bestScore = Math.max(...arrResults.values());
        let indexOfBestTeam = arrResults.values().indexOf(bestScore);
        let worstScore = Math.min(...arrResults.values());
        let indexOfWorstTeam = arrResults.values().indexOf(worstScore);

        if(bestScore == worstScore){
            this.rollAllDice();
        }
        let winner:Team = Team.Unknown;
        if(this.getAllIndexes(arrResults.values(),bestScore).length == 1){
            winner = Team[Team[arrResults.keys()[indexOfBestTeam]]];
        }
        else{
            this.addMessage("Tie! Re-rolling.")
            this.rollAllDice();
        }
        return winner;
    }

    getAllIndexes(arr, val) {
        var indexes = [], i;
        for(i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indexes.push(i);
        return indexes;
    }

    //Messaging

    addMessage(strMsg:string){
        this.message += strMsg +"\n";
    }

    sendMessage(){
        this.fChatLibInstance.sendMessage(this.message, this.channel);
        this.message = "";
    }

    //Misc. shortcuts
    get fighterCount():number {
        return this.teamsInvolved * this.playersPerTeam;
    }

    getTeamsIdList():Array<number>{
        let arrResult = [];
        for (var enumMember in Team) {
            var isValueProperty = parseInt(enumMember, 10) >= 0
            if (isValueProperty) {
                arrResult.push(enumMember);
            }
        }
        return arrResult;
    }

}