import {Dice} from "./Dice";
import * as Parser from "./Parser";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {IParserResponse} from "./interfaces/IParserResponse";
import {ICommandHandler} from "./interfaces/ICommandHandler";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Constants} from "./Constants";
import Team = Constants.Team;
import {Utils} from "./Utils";
import Tier = Constants.Tier;
import Affinity = Constants.Affinity;
import Action = Constants.Action;

export class CommandHandler implements ICommandHandler{
    fChatLibInstance:IFChatLib;
    channel:string;
    fight:Fight;

    constructor(fChatLib:IFChatLib, chan:string){
        this.fChatLibInstance = fChatLib;
        this.channel = chan;
        this.fight = new Fight(this.fChatLibInstance, this.channel);
    }

    register(args:string, data:FChatResponse){
        let parsedAffinity:Affinity = Parser.Commands.register(args);
        if(parsedAffinity == -1){
            this.fChatLibInstance.sendMessage("[color=red]This type of affinity hasn't been found. Please try again with either Power or Finesse. Example: !register Power[/color]", this.channel);
            return;
        }
        Fighter.exists(data.character).then(doesExist =>{
            if(!doesExist){
                Fighter.create(data.character, parsedAffinity).then(()=>{
                    this.fChatLibInstance.sendMessage("You are now registered! Welcome!", this.channel);
                }).catch(err => {
                    this.fChatLibInstance.throwError(err);
                });
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are already registered.[/color]", this.channel);
            }
        }).catch(err =>{
            console.log(err);
        });
    };

    stats(args:string, data:FChatResponse){
        Fighter.exists(data.character).then(data =>{
            if(data){
                let fighter:Fighter = data as Fighter;
                if(fighter.areStatsPrivate == false){
                    this.fChatLibInstance.sendMessage(fighter.outputStats(), this.channel);
                }
                else{
                    this.fChatLibInstance.sendPrivMessage(fighter.name, fighter.outputStats());
                }
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]You are not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    getStats(args:string, data:FChatResponse){
        Fighter.exists(args).then(receivedData =>{
            if(receivedData){
                let fighter:Fighter = receivedData as Fighter;
                this.fChatLibInstance.sendPrivMessage(data.character, fighter.outputStats());
            }
            else{
                this.fChatLibInstance.sendPrivMessage("[color=red]This wrestler is not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    join(args:string, data:FChatResponse){
        if(this.fight == undefined){
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
                this.fChatLibInstance.sendMessage("[color=red]This wrestler is not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    ready(args:string, data:FChatResponse){
        if(this.fight == undefined){
            this.fChatLibInstance.sendMessage("[color=red]There isn't any fight to join.[/color]", this.channel);
            return false;
        }
        if(this.fight.hasStarted){
            this.fChatLibInstance.sendMessage("[color=red]There is already a fight in progress.[/color]", this.channel);
            return false;
        }
        Fighter.exists(data.character).then(data =>{
            if(data){
                let fighter:Fighter = data as Fighter;
                if(!this.fight.setFighterReady(fighter)){ //else, the match starts!
                    this.fChatLibInstance.sendMessage("[color=red]You are already ready.[/color]", this.channel);
                }
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]This wrestler is not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    };

    private actionHandler(actionType:Action, tierRequired:boolean, isCustomTargetInsteadOfTier:boolean, args:string, data:FChatResponse){
        let tier = Tier.None;
        let customTarget:Fighter = null;
        if(this.fight == undefined || !this.fight.hasStarted){
            this.fChatLibInstance.sendMessage("[color=red]There isn't any fight going on.[/color]", this.channel);
            return false;
        }
        if(tierRequired){
            let tier = Utils.stringToEnum(Tier, args);
            if(tier == -1){
                this.fChatLibInstance.sendMessage(`[color=red]The tier is required, and neither Light, Medium or Heavy was specified. Example: !${Action[actionType]} Medium[/color]`, this.channel);
                return false;
            }
        }
        if(isCustomTargetInsteadOfTier){
            customTarget = this.fight.fighterList.getFighterByName(args);
            if(customTarget == null){
                this.fChatLibInstance.sendMessage("[color=red]The character to tag with is required.[/color]", this.channel);
                return false;
            }
        }
        Fighter.exists(data.character).then(data =>{
            if(data){
                let fighter:Fighter = data as Fighter;
                this.fight.doAction(fighter.id, actionType, tier as Tier, customTarget);
            }
            else{
                this.fChatLibInstance.sendMessage("[color=red]This wrestler is not registered.[/color]", this.channel);
            }
        }).catch(err =>{
            this.fChatLibInstance.throwError(err);
        });
    }

    brawl(args:string, data:FChatResponse){
        this.actionHandler(Action.Brawl, true, false, args, data);
    };

    sex(args:string, data:FChatResponse){
        this.actionHandler(Action.SexStrike, true, false, args, data);
    };

    subhold(args:string, data:FChatResponse){
        this.actionHandler(Action.SubHold, true, false, args, data);
    };

    tag(args:string, data:FChatResponse){
        this.actionHandler(Action.Tag, false, true, args, data);
    };

    pass(args:string, data:FChatResponse){
        this.actionHandler(Action.Pass, false, false, args, data);
    };


}