import * as Constants from "./Constants";
import Team = Constants.Team;
import StatTier = Constants.StatTier;
var vsprintf = require('sprintf-js').vsprintf;

export class Utils {
    static minInArray(arr: Array<Number>) {
        return Math.min.apply(Math, arr);
    }
    static maxInArray(arr: Array<Number>) {
        return Math.max.apply(Math, arr);
    }


    static strFormat(str:string, params: Array<string>){
        return vsprintf(str, params);
    }

    static findIndex(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
        return -1;
    }

    static pad(width, string, padding) {
        return (width <= string.length) ? string : Utils.pad(width, string + padding, padding)
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

    static getStatTier(arg:number){
        let tier = -1;
        if(arg <= 2){
            tier = StatTier.Bronze;
        }
        else if(arg <= 4){
            tier = StatTier.Silver;
        }
        else if(arg <= 6){
            tier = StatTier.Gold;
        }
        return tier;
    }

    static generateUUID():string {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };
}

export class EnumEx {
    static getNamesAndValues<T extends number>(e: any) {
        return EnumEx.getNames(e).map(n => ({ name: n, value: e[n] as T }));
    }

    static getNames(e: any) {
        return EnumEx.getObjValues(e).filter(v => typeof v === "string") as string[];
    }

    static getValues<T extends number>(e: any) {
        return EnumEx.getObjValues(e).filter(v => typeof v === "number") as T[];
    }

    private static getObjValues(e: any): (number | string)[] {
        return Object.keys(e).map(k => e[k]);
    }
}