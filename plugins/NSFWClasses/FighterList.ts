import {Fighter} from "./Fighter";
import {Dictionary} from "./Dictionary";
import * as Constants from "./Constants";
import Team = Constants.Team;
import {Utils} from "./Utils";
import {Fight} from "./Fight";
var ES = require("es-abstract/es6.js");

export class FighterList {

    fighters:Fighter[] = [];
    minNumberOfTeamsThatPlay:number = 0;

    public constructor(minNumberOfTeamsThatPlay) {
        this.fighters = [];
        this.minNumberOfTeamsThatPlay = minNumberOfTeamsThatPlay;
    }


    //getAllPlayers():Array<Fighter>{
    //    return this;
    //}
}