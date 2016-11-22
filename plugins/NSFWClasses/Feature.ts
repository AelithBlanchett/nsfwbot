import {Modifier, IModifier} from "./Modifier";
import {Utils} from "./Utils";
import * as Constants from "./Constants";
import {ItemPickupModifier, SextoyPickupModifier} from "./CustomModifiers";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {FeatureType} from "./Constants";
import {ActiveFighter} from "./ActiveFighter";

export class Feature{

    id:number;
    type:FeatureType;
    uses: number;
    permanent: boolean;
    obtainedBy:Fighter[];
    createdAt:Date;
    updatedAt:Date;

    constructor(featureType:FeatureType, uses:number, id?:number) {
        if(id){
            this.id = id;
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

    getModifier(fight:Fight, attacker?:ActiveFighter, defender?:ActiveFighter):IModifier {
        let modifier:IModifier = null;
        if (!this.isExpired()) {
            switch (this.type) {
                case FeatureType.KickStart:
                    modifier = new ItemPickupModifier(attacker);
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.KickStart} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.KickStart);
                    break;
                case FeatureType.SexyKickStart:
                    modifier = new SextoyPickupModifier(attacker);
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.SexyKickStart} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.SexyKickStart);
                    break;
                case FeatureType.Sadist:
                    modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.Sadist} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.Sadist);
                    break;
                case FeatureType.CumSlut:
                    modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.CumSlut} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.CumSlut);
                    break;
                case FeatureType.RyonaEnthusiast:
                    modifier = null;
                    fight.message.addHint(`${attacker.getStylizedName()} has the ${Constants.Feature.RyonaEnthusiast} feature!`);
                    fight.message.addHint(Constants.FeatureExplain.RyonaEnthusiast);
                    break;
            }
            this.uses--;
            if (!this.permanent) {
                fight.message.addHint(`Uses left: ${this.uses}`);
            }
        }
        return modifier;
    }

    getCost():number{
        let result = 0;
        switch (this.type){
            case FeatureType.KickStart:
            case FeatureType.SexyKickStart:
                result = 2 * this.uses;
                break;
            case FeatureType.Sadist:
            case FeatureType.RyonaEnthusiast:
            case FeatureType.CumSlut:
                //Free features
                break;
        }
        return result;
    }

    isExpired():boolean{
        if(!this.permanent){
            if(this.uses <= 0){
                return true;
            }
        }
        return false;
    }

    static dbToObject():Feature{
        return new Feature(null, null);
    }

    static async save(feature:Feature):Promise<boolean>{
        return true;
    }

    static async delete(fighterName:string):Promise<boolean>{
        return true;
    }

    static async load(featureId:number):Promise<Feature>{
        return new Feature(featureId, null);
    }

    static async loadFeaturesOfFighter(fighterName:string):Promise<Feature>{
        return new Feature(null, null);
    }


}