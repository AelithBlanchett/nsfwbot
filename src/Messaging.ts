import {IFChatLib} from "./interfaces/IFChatLib";
import {IMessage} from "./interfaces/IMessage";

export class Message implements IMessage {
    fChatLib:IFChatLib;
    channel:string;
    action:Array<string>;
    HPDamageAtk:number;
    LPDamageAtk:number;
    FPDamageAtk:number;
    HPHealAtk:number;
    LPHealAtk:number;
    FPHealAtk:number;
    HPDamageDef:number;
    LPDamageDef:number;
    FPDamageDef:number;
    HPHealDef:number;
    LPHealDef:number;
    FPHealDef:number;
    hit:Array<string>;
    status:Array<string>;
    hint:Array<string>;
    special:Array<string>;
    info:Array<string>;
    error:Array<string>;
    lastMessage:string;

    constructor(fChatLib:IFChatLib, channel:string) {
        this.clear();
        this.fChatLib = fChatLib;
        this.channel = channel;
        this.lastMessage = null;
    }

    clear(){
        this.action = [];
        this.HPDamageAtk = 0;
        this.LPDamageAtk = 0;
        this.FPDamageAtk = 0;
        this.HPHealAtk = 0;
        this.LPHealAtk = 0;
        this.FPHealAtk = 0;
        this.HPDamageDef = 0;
        this.LPDamageDef = 0;
        this.FPDamageDef = 0;
        this.HPHealDef = 0;
        this.LPHealDef = 0;
        this.FPHealDef = 0;
        this.hit = [];
        this.status = [];
        this.hint = [];
        this.special = [];
        this.info = [];
        this.error = [];
    }

    getAction() {
        return "Action: [color=yellow]" + this.action.join(" ") + "[/color]";
    }

    getDeltaHPLPFP() {
        let isDifferentDef = false;
        let msgAtk = "";
        let msg = "Defender: [color=red](";
        if(this.HPDamageDef > 0){
            msg += " HP Damage: " + this.HPDamageDef;
            isDifferentDef = true;
        }
        if(this.LPDamageDef > 0){
            msg += " Lust Damage: " + this.LPDamageDef;
            isDifferentDef = true;
        }
        if(this.FPDamageDef > 0){
            msg += " Focus Damage: " + this.FPDamageDef;
            isDifferentDef = true;
        }
        if(this.HPHealDef > 0){
            msg += " HP Healed: " + this.HPHealDef;
            isDifferentDef = true;
        }
        if(this.LPHealDef > 0){
            msg += " Lust Healed: " + this.LPHealDef;
            isDifferentDef = true;
        }
        if(this.FPHealDef > 0){
            msg += " Focus Healed: " + this.FPHealDef;
            isDifferentDef = true;
        }
        msg += ")[/color]";

        if(!isDifferentDef){ //If there are no changes, then don't send the message
            msg = "";
        }
        else{
            msgAtk = "\n";
        }

        let isDifferentAtk = false;

        msgAtk += "Attacker: [color=yellow](";
        if(this.HPDamageAtk > 0){
            msgAtk += " HP Damage: " + this.HPDamageAtk;
            isDifferentAtk = true;
        }
        if(this.LPDamageAtk > 0){
            msgAtk += " Lust Damage: " + this.LPDamageAtk;
            isDifferentAtk = true;
        }
        if(this.FPDamageAtk > 0){
            msgAtk += " Focus Damage: " + this.FPDamageAtk;
            isDifferentAtk = true;
        }
        if(this.HPHealAtk > 0){
            msgAtk += " HP Healed: " + this.HPHealAtk;
            isDifferentAtk = true;
        }
        if(this.LPHealAtk > 0){
            msgAtk += " Lust Healed: " + this.LPHealAtk;
            isDifferentAtk = true;
        }
        if(this.FPHealAtk > 0){
            msgAtk += " Focus Healed: " + this.FPHealAtk;
            isDifferentAtk = true;
        }
        msgAtk += ")[/color]";

        if(!isDifferentAtk){ //If there are no changes, then don't send the message
            msgAtk = "";
        }

        return msg+""+msgAtk;
    }

    getHit() {
        return "[color=red][b]" + this.hit.join("\n") + "[/b][/color]\n";
    }

    getHint() {
        return "[color=cyan]" + this.hint.join("\n") + "[/color]\n";
    }

    getSpecial() {
        return "[color=red]" + this.special.join("\n") + "[/color]\n";
    }

    getStatus(){
        return this.status.join("\n");
    }

    getInfo(){
        return this.info.join("\n");
    }

    getError() {
        return "[color=red][b]" + this.error.join("\n") + "[/b][/color]";
    }

    addAction(line) {
        if (typeof line === "string") this.action.push(line);
    }

    addHit(line) {
        if (typeof line === "string") this.hit.push(line);
    }

    addHint(line) {
        if (typeof line === "string") this.hint.push(line);
    }

    addStatus(line) {
        if (typeof line === "string") this.status.push(line);
    }

    addInfo(line){
        if (typeof line === "string") this.info.push(line);
    }

    addError(line){
        if (typeof line === "string") this.error.push(line);
    }


    getMessage() {
        let message = "";

        var lines = [];

        if (this.info.length) lines.push(this.getInfo());
        if (this.action.length) lines.push(this.getAction());
        if (this.hit.length) lines.push(this.getHit());
        if (this.status.length) lines.push(this.getStatus());
        let damages = this.getDeltaHPLPFP();
        if(damages != "") lines.push(damages);
        if (this.hint.length) lines.push(this.getHint());
        if (this.special.length) lines.push(this.getSpecial());
        if (this.error.length) lines.push(this.getError());

        message = lines.join("\n");

        return message;
    }

    send() {
        let message = this.getMessage();
        this.lastMessage = message;
        this.fChatLib.sendMessage(message, this.channel);
        this.clear();
    }

    resend() {
        this.fChatLib.sendMessage(this.lastMessage, this.channel);
    }
}
