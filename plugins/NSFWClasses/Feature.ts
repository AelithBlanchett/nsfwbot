import {Modifier, IModifier} from "./Modifier";
import {Utils} from "./Utils";
import * as Constants from "./Constants";
import {ItemPickupModifier} from "./CustomModifiers";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {FeatureType} from "./Constants";
import {SextoyPickupModifier} from "./CustomModifiers";
var ES = require("es-abstract/es6.js");

export class Feature{
    id:string;
    type:FeatureType;
    modifier: Modifier;
    uses: number;
    permanent: boolean;

    constructor(featureType:FeatureType, uses:number, id?:string){
        if(id){
            this.id = id;
        }
        else{
            this.id = Utils.generateUUID();
        }

        this.type = featureType;

        if(uses <= 0){
            this.uses = 0;
            this.permanent = true;
        }
        else{
            this.uses = uses;
        }
    }

    getModifier(fight:Fight, attacker?:Fighter, defender?:Fighter):IModifier{
        if(!this.isExpired()){
            switch (this.type){
                case FeatureType.KickStart:
                    this.modifier = new ItemPickupModifier(attacker);
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.KickStart} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.KickStart);
                    break;
                case FeatureType.SexyKickStart:
                    this.modifier = new SextoyPickupModifier(attacker);
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.SexyKickStart} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.SexyKickStart);
                    break;
                case FeatureType.Sadist:
                    this.modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.Sadist} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.Sadist);
                    break;
                case FeatureType.CumSlut:
                    this.modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.CumSlut} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.CumSlut);
                    break;
                case FeatureType.RyonaEnthusiast:
                    this.modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.RyonaEnthusiast} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.RyonaEnthusiast);
                    break;
            }
            this.uses--;
            if(!this.permanent){
                fight.message.addHint(`Uses left: ${this.uses}`);
            }
        }
        return this.modifier;
    }

    isExpired():boolean{
        if(!this.permanent){
            if(this.uses <= 0){
                return true;
            }
        }
        return false;
    }


}

export class Features extends Array<Feature>{
    findIndex(predicate: (value: Feature) => boolean, thisArg?: any): number{
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

    add(feature:Feature):string{
        let index = this.findIndex(x => x.type == feature.type);
        if(index == -1){
            this.push(feature);
            return "";
        }
        else{
            return "You can only have one feature of the same type at the same time.";
        }
    }

    remove(feature:Feature):string{
        let index = this.findIndex(x => x.type == feature.type);
        if(index != -1){
            this.splice(index,1);
            return "";
        }
        else{
            return "You can only have one feature of the same type at the same time.";
        }
    }

    clear():string{
        if(this.length > 0){
            this.splice(0, this.length);
            return "";
        }
        else{
            return "You didn't have any feature to remove.";
        }
    }
}