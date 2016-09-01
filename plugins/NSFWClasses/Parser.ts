import {Team} from "./Fight";
import {Utils} from "./Utils";
var _ = require('lodash');

export class Commands{
    public static register(args){
        let result = {success: false, args: {name: "", power: 0, dexterity: 0, toughness: 0, endurance: 0, willpower: 0}};
        //TODO: real parse
        result.args.name = "te";
        result.args.power = 3;
        result.args.dexterity = 3;
        result.args.toughness = 3;
        result.args.endurance = 3;
        result.args.willpower = 3;

        result.success = true;

        return result;
    }

    public static join(args){
        let teams = Utils.getTeamsList();
        for(let teamId in teams){
            teams[teamId] = teams[teamId].toLowerCase();
        }
        let indexOfTeam = teams.indexOf(args.toLowerCase());
        if(indexOfTeam != -1){
            return Team[Team[indexOfTeam]];
        }
        return Team.Unknown;
    }
}