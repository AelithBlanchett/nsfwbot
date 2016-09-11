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

    static getEnumList(myEnum):Array<string>{
        let arrResult = [];
        for (var enumMember in myEnum) {
            var isValueProperty = parseInt(enumMember, 10) >= 0;
            if (isValueProperty) {
                arrResult.push(myEnum[enumMember]);
            }
        }
        return arrResult;
    }

    static getRandomInt(min:number, max:number):number{ //continue
        return Math.floor((Math.random() * max) + min);
    }

    static getAllIndexes(arr, val) {
        var indexes = [], i;
        for(i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indexes.push(i);
        return indexes;
    }

    static toTitleCase(str){
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    static stringToEnum(myEnum, args){
        let enumChildren = Utils.getEnumList(myEnum);
        for(let tierId in enumChildren){
            enumChildren[tierId] = enumChildren[tierId].toLowerCase();
        }
        let indexOfChild = enumChildren.indexOf(args.toLowerCase());
        if(indexOfChild != -1){
            return myEnum[myEnum[indexOfChild]];
        }
        return -1;
    }
}