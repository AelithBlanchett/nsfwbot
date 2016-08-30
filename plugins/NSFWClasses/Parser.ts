import {Team} from "./Fight";
var _ = require('lodash');

export class Commands{
    public static register(args){
        let result = {success: false, args: {name: "", power: 0, dexterity: 0, toughness: 0, endurance: 0, willpower: 0}};

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
        if(args.toLowerCase() == "blue"){
            return Team.Blue;
        }
        else if(args.toLowerCase() == "red"){
            return Team.Red;
        }
        return Team.Unknown;
    }
}