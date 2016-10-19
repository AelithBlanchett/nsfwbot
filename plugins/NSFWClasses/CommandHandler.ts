import {Dice} from "./Dice";
import * as Parser from "./Parser";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {IParserResponse} from "./interfaces/IParserResponse";
import {ICommandHandler} from "./interfaces/ICommandHandler";
import {IFChatLib} from "./interfaces/IFChatLib";
import * as Constants from "./Constants";
import Team = Constants.Team;
import {Utils} from "./Utils";
import Tier = Constants.Tier;
import Action = Constants.Action;
import {Stats} from "./Constants";
import {FightType} from "./Constants";
import {FeatureType} from "./Constants";
import {Feature} from "./Feature";
import {EnumEx} from "./Utils";

export class CommandHandler implements ICommandHandler{
    fChatLibInstance:IFChatLib;
    channel:string;
    fight:Fight;

    constructor(fChatLib:IFChatLib, chan:string){
        this.fChatLibInstance = fChatLib;
        this.channel = chan;
        this.fight = new Fight(this.fChatLibInstance, this.channel);
        this.fChatLibInstance.addPrivateMessageListener(privMsgEventHandler);
    }

    debug(args:string, data:FChatResponse){
        if(this.fChatLibInstance.isUserChatOP(data.character, data.channel)){
            eval(args);
        }
    }

    howtostart(args:string, data:FChatResponse){
        this.fChatLibInstance.sendPrivMessage(Constants.Messages.startupGuide, data.character);
    }

    register(args:string, data:FChatResponse){
        Fighter.exists(data.character).then(doesExist =>{
            if(!doesExist){
                Fighter.create(data.character).then(()=>{
                    this.fChatLibInstance.sendPrivMessage("You are now registered! Welcome!", data.character);
                }).catch(err => {
                    this.fChatLibInstance.throwError(err);
                });
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are already registered.[/color]", data.character);
            }
        }).catch(err =>{
            console.log(err);
        });
    };

    stats(args:string, data:FChatResponse){
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), fighter.name);
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    addStat(args:string, data:FChatResponse){
        let parsedStat:Stats = Parser.Commands.addStat(args);
        if(parsedStat == -1){
            this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", data.character);
            return;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                let res = fighter.addStat(parsedStat);
                if(res == ""){
                    this.fChatLibInstance.sendPrivMessage(`${Stats[parsedStat]} successfully upgraded by 1!`,fighter.name);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: "+res+"[/color]", fighter.name);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    removeStat(args:string, data:FChatResponse){
        let parsedStat:Stats = Parser.Commands.addStat(args);
        if(parsedStat == -1){
            this.fChatLibInstance.sendPrivMessage("[color=red]Stat not found.[/color]", this.channel);
            return;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                let res = fighter.removeStat(parsedStat);
                if(res == ""){
                    this.fChatLibInstance.sendPrivMessage(`${Stats[parsedStat]} successfully decreased by 1!`, fighter.name);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: "+res+"[/color]", fighter.name);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    addFeature(args:string, data:FChatResponse){
        let parsedFeatureArgs = Parser.Commands.getFeatureType(args);
        if(parsedFeatureArgs.message != null){
            this.fChatLibInstance.sendPrivMessage("[color=red]The parameters for this command are wrong. "+parsedFeatureArgs.message+"\nExample: !addFeature KickStart  OR !addFeature KickStart 2  (with 2 being the number of turns you want)." +
                "\nAvailable features: "+EnumEx.getNames(FeatureType).join(", ")+"[/color]", data.character);
            return;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                let res = fighter.addFeature(new Feature(parsedFeatureArgs.featureType, parsedFeatureArgs.turns));
                if(res == ""){
                    this.fChatLibInstance.sendPrivMessage(`You successfully added the ${FeatureType[parsedFeatureArgs.featureType]} feature.`,fighter.name);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: "+res+"[/color]", fighter.name);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    removeFeature(args:string, data:FChatResponse){
        let parsedFeatureArgs = Parser.Commands.getFeatureType(args);
        if(parsedFeatureArgs.message != null){
            this.fChatLibInstance.sendPrivMessage("[color=red]The parameters for this command are wrong. "+parsedFeatureArgs.message+"\nExample: !addFeature KickStart  OR !addFeature KickStart 2  (with 2 being the number of turns you want)." +
                "\nAvailable features: "+EnumEx.getNames(FeatureType).join(", ")+"[/color]", data.character);
            return;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                let res = fighter.removeFeature(parsedFeatureArgs.featureType);
                if(res == ""){
                    this.fChatLibInstance.sendPrivMessage(`You successfully removed your ${FeatureType[parsedFeatureArgs.featureType]} feature.`,fighter.name);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]An error happened: "+res+"[/color]", fighter.name);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    getStats(args:string, data:FChatResponse){
        if(args == ""){
            args = data.character;
        }
        Fighter.exists(args).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                if(fighter.name == data.character || (fighter.name == data.character && !fighter.areStatsPrivate)){
                    this.fChatLibInstance.sendPrivMessage(fighter.outputStats(), data.character);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler's stats are private.[/color]", data.character);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler is not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    setFightType(args:string, data:FChatResponse){
        let parsedFT:FightType = Parser.Commands.setFightType(args);
        if(parsedFT == -1){
            this.fChatLibInstance.sendMessage("[color=red]Fight Type not found. Types: Classic, Tag. Example: !setFightType Tag[/color]", this.channel);
            return;
        }
        Fighter.exists(data.character).then(data =>{
            if(data){
                this.fight.setFightType(args);
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    hideMyStats(args:string, data:FChatResponse){
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                receivedData.areStatsPrivate = true;
                receivedData.update();
                this.fChatLibInstance.sendPrivMessage("[color=green]You stats are now private.[/color]", data.character);
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    unhideMyStats(args:string, data:FChatResponse){
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                receivedData.areStatsPrivate = false;
                receivedData.update();
                this.fChatLibInstance.sendPrivMessage("[color=green]You stats are now private.[/color]", data.character);
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]You are not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };


    setTeamsCount(args:string, data:FChatResponse){
        let parsedTeams:number = Parser.Commands.setTeamsCount(args);
        if(parsedTeams <= 1){
            this.fChatLibInstance.sendMessage("[color=red]The number of teams involved must be a numeral higher than 1.[/color]", this.channel);
            return;
        }
        Fighter.exists(data.character).then(data =>{
            if(data){
                this.fight.setTeamsCount(parsedTeams);
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    join(args:string, data:FChatResponse){
        if(this.fight == undefined || this.fight.hasEnded){
            this.fight = new Fight(this.fChatLibInstance, this.channel);
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                let chosenTeam = Parser.Commands.join(args);
                if(this.fight.join(fighter, chosenTeam)){
                    this.fChatLibInstance.sendMessage(`[color=red]${fighter.name} stepped into the ring for the [color=${Team[fighter.assignedTeam]}]${Team[fighter.assignedTeam]}[/color] team! Waiting for everyone to be !ready.[/color]`, this.channel);
                }
                else{
                    this.fChatLibInstance.sendMessage("[color=red]You have already joined the fight.[/color]", this.channel);
                }
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    ready(args:string, data:FChatResponse){
        if(this.fight.hasStarted){
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress.[/color]", this.channel);
            return false;
        }
        if(this.fight == undefined || this.fight.hasEnded){
            this.fight = new Fight(this.fChatLibInstance, this.channel);
        }
        Fighter.exists(data.character).then(data =>{
            if(data){
                let fighter:Fighter = data as Fighter;
                if(!this.fight.setFighterReady(fighter)){ //else, the match starts!
                    this.fChatLibInstance.sendMessage("[color=red]You are already ready.[/color]", this.channel);
                }
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    bondage(args:string, data:FChatResponse){
        actionHandler(this, Action.Bondage, false, false, args, data);
    };

    brawl(args:string, data:FChatResponse){
        actionHandler(this, Action.Brawl, true, false, args, data);
    };

    degradation(args:string, data:FChatResponse){
        actionHandler(this, Action.Degradation, true, false, args, data);
    };

    escape(args:string, data:FChatResponse){
        actionHandler(this, Action.Escape, false, false, args, data);
    };

    forcedworship(args:string, data:FChatResponse){
        actionHandler(this, Action.ForcedWorship, true, false, args, data);
    };

    highrisk(args:string, data:FChatResponse){
        actionHandler(this, Action.HighRisk, true, false, args, data);
    };

    highrisksex(args:string, data:FChatResponse){
        actionHandler(this, Action.HighRiskSex, true, false, args, data);
    };

    humhold(args:string, data:FChatResponse){
        actionHandler(this, Action.HumHold, true, false, args, data);
    };

    itempickup(args:string, data:FChatResponse){
        actionHandler(this, Action.ItemPickup, false, false, args, data);
    };

    rest(args:string, data:FChatResponse){
        actionHandler(this, Action.Rest, false, false, args, data);
    };

    sex(args:string, data:FChatResponse){
        actionHandler(this, Action.SexStrike, true, false, args, data);
    };

    sexhold(args:string, data:FChatResponse){
        actionHandler(this, Action.SexHold, true, false, args, data);
    };

    subhold(args:string, data:FChatResponse){
        actionHandler(this, Action.SubHold, true, false, args, data);
    };

    sextoypickup(args:string, data:FChatResponse){
        actionHandler(this, Action.SextoyPickup, false, false, args, data);
    };

    stun(args:string, data:FChatResponse){
        actionHandler(this, Action.Stun, true, false, args, data);
    };

    tag(args:string, data:FChatResponse){
        actionHandler(this, Action.Tag, false, true, args, data);
    };

    resetFight(args:string, data:FChatResponse){
        if(this.fChatLibInstance.isUserChatOP(data.character, data.channel)){
            this.fight = new Fight(this.fChatLibInstance, this.channel);
        }
        else{
            this.fChatLibInstance.sendPrivMessage("[color=red]You're not an operator for this channel.[/color]", data.character);
        }
    };

    forfeit(args:string, data:FChatResponse){
        if(this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded){
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        if(args != "" && !this.fChatLibInstance.isUserChatOP(data.character, data.channel)){
            this.fChatLibInstance.sendPrivMessage("[color=red]You're not an operator for this channel. You can't force someone to forfeit.[/color]", data.character);
            return false;
        }
        if(args == ""){
            args = data.character;
        }
        Fighter.exists(args).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                if(this.fight.fighterList.getFighterByID(fighter.id)){
                    this.fight.forfeit(fighter);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]You are not participating in this fight.[/color]", data.character);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler is not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    draw(args:string, data:FChatResponse){
        if(this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded){
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                if(this.fight.fighterList.getFighterByID(fighter.id)){
                    if(fighter.wantsDraw){
                        this.fChatLibInstance.sendPrivMessage("[color=red]You are already waiting for the draw.[/color]", data.character);
                    }
                    else{
                        fighter.wantsDraw = true;
                        this.fight.checkForDraw();
                    }
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]You are not participating in this fight.[/color]", data.character);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler is not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    target(args:string, data:FChatResponse){
        if(this.fight == undefined || !this.fight.hasStarted || this.fight.hasEnded){
            this.fChatLibInstance.sendPrivMessage("[color=red]There isn't any fight going on.[/color]", data.character);
            return false;
        }
        Fighter.exists(data.character).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                if(this.fight.fighterList.getFighterByID(fighter.id)){
                    this.fight.assignTarget(fighter.id, args);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage("[color=red]You are not participating in this fight.[/color]", data.character);
                }
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler is not registered.[/color]", data.character);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };


}

class PrivateCommandHandler {
    fChatLibInstance:IFChatLib;

    constructor(fChatLib) {
        this.fChatLibInstance = fChatLib;
    }

    stats = CommandHandler.prototype.stats;
    hideMyStats = CommandHandler.prototype.hideMyStats;
    unhideMyStats = CommandHandler.prototype.unhideMyStats;
    //getStats = CommandHandler.prototype.getStats;
    //addStat = CommandHandler.prototype.addStat;
    //removeStat = CommandHandler.prototype.removeStat;
    howtostart = CommandHandler.prototype.howtostart;
}

var privMsgEventHandler = function(parent, data){

    var privHandler = new PrivateCommandHandler(parent);

    var opts = {
        command: String(data.message.split(' ')[0]).replace('!', '').trim().toLowerCase(),
        argument: data.message.substring(String(data.message.split(' ')[0]).length).trim()
    };

    if (typeof privHandler[opts.command] === 'function') {
        privHandler[opts.command](opts.argument, data);
    }
};

var actionHandler = function(cmd:CommandHandler, actionType:Action, tierRequired:boolean, isCustomTargetInsteadOfTier:boolean, args:string, data:FChatResponse){
    let tier = Tier.None;
    let customTarget:Fighter = null;
    if(cmd.fight == undefined || !cmd.fight.hasStarted){
        cmd.fChatLibInstance.sendMessage("[color=red]There isn't any fight going on.[/color]", cmd.channel);
        return false;
    }
    if(tierRequired){
        tier = Utils.stringToEnum(Tier, args);
        if(tier == -1){
            cmd.fChatLibInstance.sendMessage(`[color=red]The tier is required, and neither Light, Medium or Heavy was specified. Example: !${Action[actionType]} Medium[/color]`, cmd.channel);
            return false;
        }
    }
    if(isCustomTargetInsteadOfTier){
        customTarget = cmd.fight.fighterList.getFighterByName(args);
        if(customTarget == null){
            cmd.fChatLibInstance.sendMessage("[color=red]The character to tag with is required.[/color]", cmd.channel);
            return false;
        }
    }
    Fighter.exists(data.character).then(data =>{
        if(data){
            let fighter:Fighter = data as Fighter;
            cmd.fight.doAction(fighter.id, actionType, tier as Tier, customTarget);
        }
        else{
            cmd.fChatLibInstance.sendMessage("[color=red]This wrestler is not registered.[/color]", cmd.channel);
        }
    }).catch(err =>{
        cmd.fChatLibInstance.throwError(err);
    });
};

