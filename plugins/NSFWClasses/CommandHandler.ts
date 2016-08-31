import {Dice} from "./Dice";
import * as Parser from "./Parser";
import {Fighter} from "./Fighter";
import {Fight} from "./Fight";
import {IParserResponse} from "./interfaces/IParserResponse";
import {ICommandHandler} from "./interfaces/ICommandHandler";
import {IFChatLib} from "./interfaces/IFChatLib";
import {Team} from "./Fight";


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
        let parsedResult:IParserResponse = Parser.Commands.register(args);
        if(parsedResult.success){
            Fighter.exists(data.character).then(doesExist =>{
                if(!doesExist){
                    Fighter.create(data.character, parsedResult.args.power, parsedResult.args.dexterity, parsedResult.args.toughness, parsedResult.args.endurance, parsedResult.args.willpower).then(()=>{
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
        }
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
                    this.fChatLibInstance.sendMessage("[color=red]"+fighter.name+" stepped into the ring! Waiting for everyone to be !ready.[/color]", this.channel);
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


}