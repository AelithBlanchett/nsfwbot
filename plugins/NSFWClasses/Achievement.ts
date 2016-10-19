import {Modifier, IModifier} from "./Modifier";
import {Utils} from "./Utils";
import * as Constants from "./Constants";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {AchievementType} from "./Constants";
import {SextoyPickupModifier} from "./CustomModifiers";
var ES = require("es-abstract/es6.js");

export class Achievements extends Array<AchievementType>{
    findIndex(predicate: (value: AchievementType) => boolean, thisArg?: any): number{
        var list = ES.ToObject(this);
        var length = ES.ToLength(ES.ToLength(list.length));
        if (!ES.IsCallable(predicate)) {
            throw new TypeError('Array#findIndex: predicate must be a function');
        }
        if (length === 0) return -1;
        var thisArg = arguments[1];
        for (var i = 0, value; i < length; i++) {
            value = list[i];
            if (ES.Call(predicate, thisArg, [value, i, list])) return i;
        }
        return -1;
    }

    add(feature:AchievementType):string{
        let index = this.findIndex(x => x == feature);
        if(index == -1){
            this.push(feature);
            return "";
        }
        return "Already here.";
    }

    remove(feature:AchievementType):string{
        let index = this.findIndex(x => x == feature);
        if(index != -1){
            this.splice(index,1);
            return "";
        }
        else{
            return "You can only have one achievement of the same type at the same time.";
        }
    }

    clear():string{
        if(this.length > 0){
            this.splice(0, this.length);
            return "";
        }
        else{
            return "You didn't have any achievement to remove.";
        }
    }
}