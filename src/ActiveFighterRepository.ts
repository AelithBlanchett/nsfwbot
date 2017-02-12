import {Model} from "./Model";
import {ActiveFighter} from "./ActiveFighter";
import {FighterRepository} from "./FighterRepository";
import {Utils} from "./Utils";
import {ModifierRepository} from "./ModifierRepository";
import {Dice} from "./Dice";

export class ActiveFighterRepository{

    public static async persist(fighter:ActiveFighter):Promise<void>{
        try
        {
            let currentSeason = await Model.db('nsfw_constants').where({key: "currentSeason"}).first();

            if(fighter.fight == null || fighter.fight.id == null){
                return;
            }

            if(!await ActiveFighterRepository.exists(fighter.name, fighter.fight.id)){
                await Model.db('nsfw_activefighters').insert({
                    idFighter: fighter.name,
                    idFight: fighter.fight.id,
                    season: currentSeason.value,
                    assignedTeam: fighter.assignedTeam,
                    isReady: fighter.isReady,
                    hp: fighter.hp,
                    heartsRemaining: fighter.heartsRemaining,
                    lust: fighter.lust,
                    orgasmsRemaining: fighter.orgasmsRemaining,
                    focus: fighter.focus,
                    lastDiceRoll: fighter.lastDiceRoll,
                    isInTheRing: fighter.isInTheRing,
                    canMoveFromOrOffRing: fighter.canMoveFromOrOffRing,
                    lastTagTurn: fighter.lastTagTurn,
                    wantsDraw: fighter.wantsDraw,
                    consecutiveTurnsWithoutFocus: fighter.consecutiveTurnsWithoutFocus,
                    fightStatus: fighter.fightStatus,
                    startingPower: fighter.startingPower,
                    startingSensuality: fighter.startingSensuality,
                    startingDexterity: fighter.startingDexterity,
                    startingToughness: fighter.startingToughness,
                    startingEndurance: fighter.startingEndurance,
                    startingWillpower: fighter.startingWillpower,
                    powerDelta: fighter.powerDelta,
                    sensualityDelta: fighter.sensualityDelta,
                    dexterityDelta: fighter.dexterityDelta,
                    toughnessDelta: fighter.toughnessDelta,
                    enduranceDelta: fighter.enduranceDelta,
                    willpowerDelta: fighter.willpowerDelta,
                    createdAt: new Date()
                });
            }
            else{
                await Model.db('nsfw_activefighters').where({name: fighter.name, idFight: fighter.fight.id}).update({
                    assignedTeam: fighter.assignedTeam,
                    isReady: fighter.isReady,
                    hp: fighter.hp,
                    heartsRemaining: fighter.heartsRemaining,
                    lust: fighter.lust,
                    orgasmsRemaining: fighter.orgasmsRemaining,
                    focus: fighter.focus,
                    lastDiceRoll: fighter.lastDiceRoll,
                    isInTheRing: fighter.isInTheRing,
                    canMoveFromOrOffRing: fighter.canMoveFromOrOffRing,
                    lastTagTurn: fighter.lastTagTurn,
                    wantsDraw: fighter.wantsDraw,
                    consecutiveTurnsWithoutFocus: fighter.consecutiveTurnsWithoutFocus,
                    fightStatus: fighter.fightStatus,
                    startingPower: fighter.startingPower,
                    startingSensuality: fighter.startingSensuality,
                    startingDexterity: fighter.startingDexterity,
                    startingToughness: fighter.startingToughness,
                    startingEndurance: fighter.startingEndurance,
                    startingWillpower: fighter.startingWillpower,
                    powerDelta: fighter.powerDelta,
                    sensualityDelta: fighter.sensualityDelta,
                    dexterityDelta: fighter.dexterityDelta,
                    toughnessDelta: fighter.toughnessDelta,
                    enduranceDelta: fighter.enduranceDelta,
                    willpowerDelta: fighter.willpowerDelta,
                    updatedAt: new Date()
                });
            }
        }
        catch(ex){
            throw ex;
        }
    }

    public static async exists(idFighter:string, idFight:string):Promise<boolean>{
        let loadedData = await Model.db('nsfw_activefighters').where({idFighter: idFighter, idFight: idFight}).select();
        return (loadedData.length > 0);
    }

    public static async initialize(idFighter:string):Promise<ActiveFighter>{
        let loadedActiveFighter:ActiveFighter = new ActiveFighter();

        if(!await FighterRepository.exists(idFighter)){
            return null;
        }

        let loadedFighter = await FighterRepository.load(name);
        for(let prop of Object.getOwnPropertyNames(loadedFighter)){
            if(Object.getOwnPropertyNames(loadedActiveFighter).indexOf(prop) != -1){
                if(typeof loadedFighter[prop] != "function"){
                    loadedActiveFighter[prop] = loadedFighter[prop];
                }
            }
        }

        loadedActiveFighter.dice = new Dice(10);

        return loadedActiveFighter;
    }

    public static async load(idFighter:string, idFight:string):Promise<ActiveFighter>{
        let loadedActiveFighter:ActiveFighter = new ActiveFighter();

        if(!await ActiveFighterRepository.exists(idFighter, idFight)){
            return null;
        }

        try
        {
            loadedActiveFighter = await ActiveFighterRepository.initialize(idFighter);

            let loadedData = await Model.db('nsfw_activefighters').where({idFighter: idFighter, idFight: idFight}).select();
            let data = loadedData[0];

            for(let prop of Object.getOwnPropertyNames(data)) {
                if (Object.getOwnPropertyNames(loadedActiveFighter).indexOf(prop) != -1) {
                    if (typeof data[prop] != "function") {
                        loadedActiveFighter[prop] = data[prop];
                    }
                }
            }

            loadedActiveFighter.modifiers = await ModifierRepository.loadFromFight(idFight);
        }
        catch(ex){
            throw ex;
        }

        return loadedActiveFighter;
    }

    public static async loadFromFight(idFight:string):Promise<ActiveFighter[]>{
        let loadedActiveFighters:ActiveFighter[] = [];

        try
        {
            let loadedData = await Model.db('nsfw_activefighters').where({idFight: idFight}).select();

            for(let data of loadedData){
                let action = new ActiveFighter();
                Utils.mapChildren(data, action);
                loadedActiveFighters.push(action);
            }

        }
        catch(ex){
            throw ex;
        }

        return loadedActiveFighters;
    }

    public static async delete(idFighter:string, idFight:string):Promise<void>{
        await Model.db('nsfw_activefighters').where({idFighter: idFighter, idFight: idFight}).del();
    }

}