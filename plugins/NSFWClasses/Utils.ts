import {Constants} from "./Constants";
import Team = Constants.Team;
export class Utils {
    static minInArray(arr: Array<Number>) {
        return Math.min.apply(Math, arr);
    }
    static maxInArray(arr: Array<Number>) {
        return Math.max.apply(Math, arr);
    }

    static pad(width, string, padding) {
        return (width <= string.length) ? string : Utils.pad(width, padding + string, padding)
    }

    static shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    static getTeamsList():Array<string>{
        let arrResult = [];
        for (var enumMember in Team) {
            var isValueProperty = parseInt(enumMember, 10) >= 0;
            if (isValueProperty) {
                arrResult.push(Team[enumMember]);
            }
        }
        return arrResult;
    }

    static getRandomInt(min:number, max:number):number{ //continue
        return Math.floor((Math.random() * max) + min);
    }
}