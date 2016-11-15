import {Fighter} from "./Fighter";
import {Dice} from "./Dice";
import * as Parser from "./Parser";
import {Fight} from "./Fight";
import {IParserResponse} from "./interfaces/IParserResponse";
import {ICommandHandler} from "./interfaces/ICommandHandler";
import {IFChatLib} from "./interfaces/IFChatLib";
import * as Constants from "./Constants";
import {Utils} from "./Utils";
import Tier = Constants.Tier;
import {Stats} from "./Constants";
import {FightType} from "./Constants";
import {FeatureType} from "./Constants";
import {Feature} from "./Feature";
import {EnumEx} from "./Utils";
import {ActionType} from "./Action";
import {Team} from "./Constants";

export class CommandHandler implements ICommandHandler {
    fChatLibInstance:IFChatLib;
    channel:string;
    fight:Fight;

    constructor(fChatLib:IFChatLib, chan:string) {
        this.fChatLibInstance = fChatLib;
        this.channel = chan;
        this.fight = new Fight(this.fChatLibInstance, this.channel);
        this.fChatLibInstance.addPrivateMessageListener(privMsgEventHandler);
    }

    async addfeature(args:string, data:FChatResponse) {
        var parsedFeatureArgs = {message: null, featureType: null, turns: null};
        parsedFeatureArgs = Parser.Commands.getFeatureType(args);
        if (parsedFeatureArgs.message != null) {
            this.fChatLibInstance.sendPrivMessage("[color=red]The parameters for this command are wrong. " + parsedFeatureArgs.message + "\nExample: !addFeature KickStart  OR !addFeature KickStart 2  (with 2 being the number of fights you want)." +
                "\n[/color]Available features: " + EnumEx.getNames(FeatureType).join(", "), data.character);
            return;
        }

        let fighter:Fighter = await Fighter.loadFromDb(data.character);
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

    async addstat(args:string, data:FChatResponse) {
        let parsedStat:Stats = Parser.Commands.addStat(args);
        if (parsedStat == -1) {
            this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", data.character);
            return;
        }
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            try {
                fighter.addStat(parsedStat);
                this.fChatLibInstance.sendPrivMessage(`[color=green]${Stats[parsedStat]} successfully upgraded by 1![/color]`, fighter.name);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: " + ex.message + "[/color]", fighter.name);
            }
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async clearfeatures(args:string, data:FChatResponse) {
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
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

    debug(args:string, data:FChatResponse) {
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

        let fighter:Fighter = await Fighter.loadFromDb(args);

        if (fighter != undefined && (fighter.name == data.character || (fighter.name == data.character && !fighter.areStatsPrivate))) {
            this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), data.character);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler's stats are private, or does not exist.[/color]", data.character);
        }
    };

    async hidemystats(args:string, data:FChatResponse) {
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            fighter.areStatsPrivate = false;
            try {
                fighter.update();
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
            this.fight = new Fight(this.fChatLibInstance, this.channel);
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
        let fighter = await Fighter.loadFromDb(data.character);
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

    async loadfight(args:string, data:FChatResponse) {
        if (this.fight == undefined || this.fight.hasEnded || !this.fight.hasStarted) {
            try {
                if (!isNaN(parseInt(args))) {
                    this.fight = await Fight.loadState(parseInt(args), this.fChatLibInstance, this.channel);
                }
                else {
                    this.fChatLibInstance.sendMessage("[color=red]Wrong fight id. It must be a number.[/color]", this.channel);
                }
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
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
            this.fight = new Fight(this.fChatLibInstance, this.channel);
        }
        let result:boolean = await this.fight.setFighterReady(data.character);
        if (!result) { //else, the match starts!
            this.fChatLibInstance.sendMessage("[color=red]You are already ready.[/color]", this.channel);
        }
    };

    async register(args:string, data:FChatResponse) {
        let doesFighterExist = await Fighter.loadFromDb(data.character);
        if (!doesFighterExist) {
            try {
                await Fighter.create(data.character);
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
        let fighter = await Fighter.loadFromDb(data.character);
        try {
            if (fighter != undefined) {
                fighter.removeFeature(parsedFeatureArgs.featureType);
                this.fChatLibInstance.sendPrivMessage(`[color=green]You successfully removed your ${FeatureType[parsedFeatureArgs.featureType]} feature.[/color]`, fighter.name);
            }
        }
        catch (ex) {
            this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
        }
    };

    async removestat(args:string, data:FChatResponse) {
        let parsedStat:Stats = Parser.Commands.addStat(args);
        if (parsedStat == -1) {
            this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", this.channel);
            return;
        }
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            try {
                let res = fighter.removeStat(parsedStat);
            }
            catch (ex) {
                this.fChatLibInstance.sendPrivMessage(Utils.strFormat(Constants.Messages.commandError, ex.message), data.character);
            }
        }
    };

    async stats(args:string, data:FChatResponse) {
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), fighter.name);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async setfighttype(args:string, data:FChatResponse) {
        let parsedFT:FightType = Parser.Commands.setFightType(args);
        if (parsedFT == -1) {
            this.fChatLibInstance.sendMessage("[color=red]Fight Type not found. Types: Rumble, Tag. Example: !setFightType Tag[/color]", this.channel);
            return;
        }
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            this.fight.setFightType(args);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async setteamscount(args:string, data:FChatResponse) {
        let parsedTeams:number = Parser.Commands.setTeamsCount(args);
        if (parsedTeams <= 1) {
            this.fChatLibInstance.sendMessage("[color=red]The number of teams involved must be a numeral higher than 1.[/color]", this.channel);
            return;
        }
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            this.fight.setTeamsCount(parsedTeams);
        }
        else {
            this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
        }
    };

    async unhidemystats(args:string, data:FChatResponse) {
        let fighter:Fighter = await Fighter.loadFromDb(data.character);
        if (fighter != undefined) {
            fighter.areStatsPrivate = false;
            try {
                fighter.update();
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

    finish(args:string, data:FChatResponse) {
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

    resetfight(args:string, data:FChatResponse) {
        if (this.fChatLibInstance.isUserChatOP(data.character, data.channel)) {
            this.fight = new Fight(this.fChatLibInstance, this.channel);
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

    addstat = CommandHandler.prototype.addstat;
    clearfeatures = CommandHandler.prototype.clearfeatures;
    debug = CommandHandler.prototype.debug;
    getstats = CommandHandler.prototype.getstats;
    hidemystats = CommandHandler.prototype.hidemystats;
    howtostart = CommandHandler.prototype.howtostart;
    stats = CommandHandler.prototype.stats;
    removestat = CommandHandler.prototype.removestat;
    removefeature = CommandHandler.prototype.removefeature;
    unhidemystats = CommandHandler.prototype.unhidemystats;
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

