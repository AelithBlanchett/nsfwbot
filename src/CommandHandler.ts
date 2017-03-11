import {Fighter} from "./Fighter";
import * as Parser from "./Parser";
import {Fight} from "./Fight";
import {ICommandHandler} from "./interfaces/ICommandHandler";
import {IFChatLib} from "./interfaces/IFChatLib";
import * as Constants from "./Constants";
import {Utils} from "./Utils";
import Tier = Constants.Tier;
import {Stats} from "./Constants";
import {FightType} from "./Constants";
import {FeatureType} from "./Constants";
import {EnumEx} from "./Utils";
import {ActionType} from "./Action";
import {Team} from "./Constants";
import {FighterRepository} from "./FighterRepository";
import {FightRepository} from "./FightRepository";
import {Commands} from "./Constants";

export class CommandHandler implements ICommandHandler {
    fChatLibInstance:IFChatLib;
    channel:string;
    fight:Fight;

    blnAutofight:boolean = false;

    constructor(fChatLib:IFChatLib, chan:string) {
        this.fChatLibInstance = fChatLib;
        this.channel = chan;
        this.fight = new Fight();
        this.fight.build(fChatLib, chan);
        this.fChatLibInstance.addPrivateMessageListener(privMsgEventHandler);
    }

    private wait(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async autoplay(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "")) {
            this.blnAutofight = !this.blnAutofight;
            if(this.blnAutofight == false){
                return;
            }
            let availableCommands = Utils.getEnumList(Constants.Commands);
            let availableTiers = Utils.getEnumList(Constants.Tier);
            availableTiers.shift();

            let firstCharData:FChatResponse = {character: "Aelith Blanchette", channel: data.channel};
            let secondCharData:FChatResponse = {character: "Tina Armstrong", channel: data.channel};



            while(this.blnAutofight == true){
                if (this.fight == undefined || this.fight.hasEnded) {
                    this.fight = new Fight();
                    this.fight.build(this.fChatLibInstance, this.channel);
                }
                if(!this.fight.hasStarted){
                    await this.ready("", firstCharData);
                    await this.wait(1000);
                    await this.ready("", secondCharData);
                    await this.wait(1000);
                }

                await this.wait(1000);

                if(this.fight.currentPlayer.name == firstCharData.character){
                    let randomCommand = availableCommands[Utils.getRandomInt(0, availableCommands.length)].toLowerCase();
                    let randomTier = availableTiers[Utils.getRandomInt(0, availableTiers.length)].toLowerCase();
                    await this[randomCommand].apply(this, [randomTier, firstCharData]);
                }
                else if(this.fight.currentPlayer.name == secondCharData.character)
                {
                    let randomCommandTina = availableCommands[Utils.getRandomInt(0, availableCommands.length)].toLowerCase();
                    let randomTierTina = availableTiers[Utils.getRandomInt(0, availableTiers.length)].toLowerCase();
                    await this[randomCommandTina].apply(this, [randomTierTina, secondCharData]);
                }

                if(!this.blnAutofight){
                    break;
                }
            }
        }
    }

    async runas(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "")) {
            let splits = args.split(" ");
            let command = splits[0];
            splits.shift();
            let commandArgs = splits.join(" ");
            let impersonatedData = data;
            impersonatedData.character = "Tina Armstrong";
            this[command].apply(this, [commandArgs, impersonatedData]);
        }
    }

    async addfeature(args:string, data:FChatResponse) {
        var parsedFeatureArgs = {message: null, featureType: null, turns: null};
        parsedFeatureArgs = Parser.Commands.getFeatureType(args);
        if (parsedFeatureArgs.message != null) {
            this.fChatLibInstance.sendPrivMessage("[color=red]The parameters for this command are wrong. " + parsedFeatureArgs.message + "\nExample: !addFeature KickStart  OR !addFeature KickStart 2  (with 2 being the number of fights you want)." +
                "\n[/color]Available features: " + EnumEx.getNames(FeatureType).join(", "), data.character);
            return;
        }

        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            try {
                fighter.addFeature(parsedFeatureArgs.featureType, parsedFeatureArgs.turns);
                this.fChatLibInstance.sendPrivMessage(`[color=green]You successfully added the ${FeatureType[parsedFeatureArgs.featureType]} feature.[/color]`, fighter.name);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: " + ex.message + "[/color]", fighter.name);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async restat(args:string, data:FChatResponse) {
        let parserPassed = Parser.Commands.checkIfValidStats(args, Constants.Globals.numberOfRequiredStatPoints);
        if(parserPassed != ""){
            this.fChatLibInstance.sendPrivMessage(`[color=red]${parserPassed}[/color]`, data.character);
            return;
        }
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            try {
                let arrParam:Array<number> = [];

                for(let nbr of args.split(",")){
                    arrParam.push(parseInt(nbr));
                }

                fighter.restat(arrParam[0], arrParam[1], arrParam[2], arrParam[3], arrParam[4], arrParam[5]);
                this.fChatLibInstance.sendPrivMessage(`[color=green]You've successfully changed your stats![/color]`, fighter.name);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: " + ex.message + "[/color]", fighter.name);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    // async addstat(args:string, data:FChatResponse) {
    //     let parsedStat:Stats = Parser.Commands.addStat(args);
    //     if (parsedStat == -1) {
    //         this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", data.character);
    //         return;
    //     }
    //     let fighter:Fighter = await FighterRepository.load(data.character);
    //     if (fighter != undefined) {
    //         try {
    //             fighter.addStat(parsedStat);
    //             this.fChatLibInstance.sendPrivMessage(`[color=green]${Stats[parsedStat]} successfully upgraded by 1![/color]`, fighter.name);
    //         }
    //         catch (ex) {
    //             this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: " + ex.message + "[/color]", fighter.name);
    //         }
    //     }
    //     else {
    //         this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
    //     }
    // };

    async clearfeatures(args:string, data:FChatResponse) {
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            fighter.areStatsPrivate = false;
            try {
                fighter.clearFeatures();
                this.fChatLibInstance.sendPrivMessage(`[color=green]You successfully removed all your features.[/color]`, fighter.name);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    //admin commands

    debugmode(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "") && this.fight.hasStarted) {
            this.fight.debug = !this.fight.debug;
            this.fChatLibInstance.sendPrivMessage(`Debug mode is now set to ${this.fight.debug}`, data.character);
        }
    }

    setdicescore(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "") && this.fight.hasStarted) {
            this.fight.forcedDiceRoll = parseInt(args);
            this.fChatLibInstance.sendPrivMessage(`Dice score is now automatically set to ${this.fight.debug}`, data.character);
        }
    }

    resetdmg(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "") && this.fight.hasStarted && this.fight.debug) {
            for(let fighter of this.fight.fighters){
                fighter.orgasmsRemaining = fighter.maxOrgasms(); //to prevent ending the fight this way
                fighter.heartsRemaining = fighter.maxHearts();
                fighter.consecutiveTurnsWithoutFocus = 0; //to prevent ending the fight this way
                fighter.focus = fighter.initialFocus();
            }

            this.fChatLibInstance.sendPrivMessage(`Successfully resplenished ${args}'s HP, LP and FP.`, data.character);
        }
    }

    exec(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserMaster(data.character, "")) {
            eval(args);
        }
    }

    status(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded || !this.fight.hasStarted) {
            this.fChatLibInstance.sendPrivMessage("There is no match going on right now.", data.character);
        }
        else {
            this.fight.message.resend();
        }
    };

    async getstats(args:string, data:FChatResponse) {
        if (args == "") {
            args = data.character;
        }

        let fighter:Fighter = await FighterRepository.load(args);

        if (fighter != undefined && (fighter.name == data.character || (fighter.name == data.character && !fighter.areStatsPrivate))) {
            this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), data.character);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler's stats are private, or does not exist.[/color]", data.character);
        }
    };

    async hidemystats(args:string, data:FChatResponse) {
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            fighter.areStatsPrivate = false;
            try {
                FighterRepository.persist(fighter);
                this.fChatLibInstance.sendPrivMessage("[color=green]You stats are now private.[/color]", data.character);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    howtostart(args:string, data:FChatResponse) {
        this.fChatLibInstance.sendPrivMessage(Constants.Messages.startupGuide, data.character);
    }

    async join(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded) {
            this.fight = new Fight();
            this.fight.build(this.fChatLibInstance, this.channel);
        }
        let chosenTeam = Parser.Commands.join(args);
        try {
            let assignedTeam:number = await this.fight.join(data.character, chosenTeam);
            this.fChatLibInstance.sendMessage(`[color=green]${data.character} stepped into the ring for the [color=${Team[assignedTeam]}]${Team[assignedTeam]}[/color] team! Waiting for everyone to be !ready.[/color]`, this.channel);
        }
        catch (err) {
            this.fChatLibInstance.sendMessage("[color=red]" + err.message + "[/color]", this.channel);
        }
    };

    async leave(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded) {
            this.fChatLibInstance.sendMessage("[color=red]There is no fight in progress. You must either do !forfeit or !draw to leave the fight.[/color]", this.channel);
            return false;
        }
        if (this.fight.hasStarted) {
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress. You must either do !forfeit or !draw to leave the fight.[/color]", this.channel);
            return false;
        }
        let fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            if (this.fight.leave(data.character)) { //else, the match starts!
                this.fChatLibInstance.sendMessage("[color=green]You are now out of the fight.[/color]", this.channel);
            }
            else {
                this.fChatLibInstance.sendMessage("[color=red]You have already left the fight.[/color]", this.channel);
            }
        }
        else {
            this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
        }
    };

    async loadmyfight(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded || !this.fight.hasStarted) {
            try {
                if (args) {
                    let theFight = await FightRepository.loadLatestInvolvingFighter(args);
                    if(theFight != null){
                        this.fight = theFight;
                        this.fight.build(this.fChatLibInstance, this.channel);
                        this.fight.outputStatus();
                    }
                    else{
                        this.fChatLibInstance.sendMessage("[color=red]Your latest fight doesn't exist or is already finished.[/color]", this.channel);
                    }
                }
                else {
                    this.fChatLibInstance.sendMessage("[color=red]Wrong idFight. It must be specified.[/color]", this.channel);
                }
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.stack), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress.[/color]", this.channel);
        }
    };

    async loadfight(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded || !this.fight.hasStarted) {
            try {
                if (args) {
                    let theFight = await FightRepository.load(args);
                    if(theFight != null){
                        this.fight = theFight;
                        this.fight.build(this.fChatLibInstance, this.channel);
                        this.fight.outputStatus();
                    }
                    else{
                        this.fChatLibInstance.sendMessage("[color=red]No fight is associated with this id.[/color]", this.channel);
                    }
                }
                else {
                    this.fChatLibInstance.sendMessage("[color=red]Wrong idFight. It must be specified.[/color]", this.channel);
                }
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.stack), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress.[/color]", this.channel);
        }
    };

    async ready(args:string, data:FChatResponse) {
        if (this.fight.hasStarted) {
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress.[/color]", this.channel);
            return false;
        }
        if (this.fight == undefined || this.fight.hasEnded) {
            this.fight = new Fight();
            this.fight.build(this.fChatLibInstance, this.channel);
        }
        let result:boolean = await this.fight.setFighterReady(data.character);
        if (!result) { //else, the match starts!
            this.fChatLibInstance.sendMessage("[color=red]You are already ready.[/color]", this.channel);
        }
    };

    async register(args:string, data:FChatResponse) {
        let doesFighterExist = await FighterRepository.exists(data.character);
        if (!doesFighterExist) {
            try {
                let newFighter = new Fighter();
                newFighter.name = data.character;
                await FighterRepository.persist(newFighter);
                this.fChatLibInstance.sendPrivMessage("[color=green]You are now registered! Welcome! Don't forget to type !howtostart here if you haven't read the quickstart guide yet.[/color]", data.character);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are already registered.[/color]", data.character);
        }
    };

    async removefeature(args:string, data:FChatResponse) {
        let parsedFeatureArgs = Parser.Commands.getFeatureType(args);
        if (parsedFeatureArgs.message != null) {
            this.fChatLibInstance.sendPrivMessage("[color=red]The parameters for this command are wrong. " + parsedFeatureArgs.message + "\nExample: !removeFeature KickStart" +
                "\nAvailable features: " + EnumEx.getNames(FeatureType).join(", ") + "[/color]", data.character);
            return;
        }
        let fighter = await FighterRepository.load(data.character);
        try {
            if (fighter != null) {
                fighter.removeFeature(parsedFeatureArgs.featureType);
                this.fChatLibInstance.sendPrivMessage(`[color=green]You successfully removed your ${FeatureType[parsedFeatureArgs.featureType]} feature.[/color]`, fighter.name);
            }
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    // async removestat(args:string, data:FChatResponse) {
    //     let parsedStat:Stats = Parser.Commands.addStat(args);
    //     if (parsedStat == -1) {
    //         this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", this.channel);
    //         return;
    //     }
    //     let fighter:Fighter = await FighterRepository.load(data.character);
    //     if (fighter != null) {
    //         try {
    //             let res = fighter.removeStat(parsedStat);
    //         }
    //         catch (ex) {
    //             this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
    //         }
    //     }
    // };

    async stats(args:string, data:FChatResponse) {
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != null) {
            this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), fighter.name);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async fighttype(args:string, data:FChatResponse) {
        let parsedFT:FightType = Parser.Commands.setFightType(args);
        if (parsedFT == -1) {
            this.fChatLibInstance.sendMessage("[color=red]Fight Type not found. Types: Rumble, Tag. Example: !setFightType Tag[/color]", this.channel);
            return;
        }
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != null) {
            this.fight.setFightType(args);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async teamscount(args:string, data:FChatResponse) {
        let parsedTeams:number = Parser.Commands.setTeamsCount(args);
        if (parsedTeams <= 1) {
            this.fChatLibInstance.sendMessage("[color=red]The number of teams involved must be a numeral higher than 1.[/color]", this.channel);
            return;
        }
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != null) {
            this.fight.setTeamsCount(parsedTeams);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async unhidemystats(args:string, data:FChatResponse) {
        let fighter:Fighter = await FighterRepository.load(data.character);
        if (fighter != undefined) {
            fighter.areStatsPrivate = false;
            try {
                FighterRepository.persist(fighter);
                this.fChatLibInstance.sendPrivMessage("[color=green]You stats are now public.[/color]", data.character);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    bondage(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Bondage, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    brawl(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Brawl, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    degradation(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Degradation, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    escape(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Escape, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    forcedworship(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.ForcedWorship, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    highrisk(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.HighRisk, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    penetration(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Penetration, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    humhold(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.HumHold, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    itempickup(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.ItemPickup, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    rest(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Rest, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    sex(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.SexStrike, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    sexhold(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.SexHold, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    subhold(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.SubHold, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    straptoy(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.StrapToy, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    sextoypickup(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.SextoyPickup, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    stun(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Stun, true, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    tag(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Tag, false, true, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    submit(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Submit, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    finisher(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Finish, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    masturbate(args:string, data:FChatResponse) {
        try {
            this.fight.prepareAction(data.character, ActionType.Masturbate, false, false, args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    async resetfight(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserChatOP(data.character, data.channel)) {
            if(this.fight && this.fight.idFight){
                await FightRepository.delete(this.fight.idFight);
            }
            this.fight = new Fight();
            this.fight.build(this.fChatLibInstance, this.channel);
            this.fChatLibInstance.sendMessage("The fight has been ended.", data.character);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You're not an operator for this channel.[/color]", data.character);
        }
    };

    async forfeit(args:string, data:FChatResponse) {
        if (this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded) {
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        if (args != "" && !this.fChatLibInstance.isUserChatOP(data.character, data.channel)) {
            this.fChatLibInstance.sendPrivMessage("[color=red]You're not an operator for this channel. You can't force someone to forfeit.[/color]", data.character);
            return false;
        }
        if (args == "") {
            args = data.character;
        }

        try {
            this.fight.forfeit(args);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    async draw(args:string, data:FChatResponse) {
        if (this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded) {
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        try {
            this.fight.requestDraw(data.character);
            this.fight.checkForDraw();
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    async undraw(args:string, data:FChatResponse) {
        if (this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded) {
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        try {
            this.fight.unrequestDraw(data.character);
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    target(args:string, data:FChatResponse) {
        if (this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded) {
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        try {
            if (this.fight.getFighterByName(data.character)) {
                this.fight.assignTarget(data.character, args);
            }
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };


}

class PrivateCommandHandler {
    fChatLibInstance:IFChatLib;

    constructor(fChatLib) {
        this.fChatLibInstance = fChatLib;
    }

    //addstat = CommandHandler.prototype.addstat;
    clearfeatures = CommandHandler.prototype.clearfeatures;
    debugmode = CommandHandler.prototype.debugmode;
    setdicescore = CommandHandler.prototype.setdicescore;
    resetdmg = CommandHandler.prototype.resetdmg;
    exec = CommandHandler.prototype.exec;
    runas = CommandHandler.prototype.runas;
    getstats = CommandHandler.prototype.getstats;
    hidemystats = CommandHandler.prototype.hidemystats;
    howtostart = CommandHandler.prototype.howtostart;
    stats = CommandHandler.prototype.stats;
    //removestat = CommandHandler.prototype.removestat;
    removefeature = CommandHandler.prototype.removefeature;
    unhidemystats = CommandHandler.prototype.unhidemystats;
    restat = CommandHandler.prototype.restat;
}

var privMsgEventHandler = function (parent, data) {

    var privHandler = new PrivateCommandHandler(parent);

    var opts = {
        command: String(data.message.split(' ')[0]).replace('!', '').trim().toLowerCase(),
        argument: data.message.substring(String(data.message.split(' ')[0]).length).trim()
    };

    if (typeof privHandler[opts.command] === 'function') {
        privHandler[opts.command](opts.argument, data);
    }
};

