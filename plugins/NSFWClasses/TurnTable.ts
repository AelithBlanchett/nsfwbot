import * as Constants from "./Constants";
import Team = Constants.Team;
export class TurnTable extends Array<TeamPlayerId>{

    public constructor(){
        super();
    }

    addPlayerInTeam(playerIndex:number, team:Team):void{
        this.push(new TeamPlayerId(team, playerIndex));
    }

    getPlayerForTurn(turnCounter:number){
        return this[turnCounter];
    }
}

export class TeamPlayerId{
    team:Team;
    playerId:number;

    public constructor(team:Team, playerId:number){
        this.team = team;
        this.playerId = playerId;
    }
}