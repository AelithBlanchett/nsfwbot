interface IMessage {
    action: Array<string>;
    HPDamage:number;
    LPDamage:number;
    FPDamage:number;
    HPHeal:number;
    LPHeal:number;
    FPHeal:number;
    hit: Array<string>;
    status: Array<string>;
    hint: Array<string>;
    special: Array<string>;
    info: Array<string>;
    error: Array<string>;
}

export class Message implements IMessage {
    action:Array<string>;
    HPDamage:number;
    LPDamage:number;
    FPDamage:number;
    HPHeal:number;
    LPHeal:number;
    FPHeal:number;
    hit:Array<string>;
    status:Array<string>;
    hint:Array<string>;
    special:Array<string>;
    info:Array<string>;
    error:Array<string>;

    constructor(){
        this.clear();
    }

    clear(){
        this.action = [];
        this.LPDamage = 0;
        this.FPDamage = 0;
        this.HPHeal = 0;
        this.LPHeal = 0;
        this.FPHeal = 0;
        this.hit = [];
        this.status = [];
        this.hint = [];
        this.special = [];
        this.info = [];
        this.error = [];
    }

    getAction() {
        return "Action: " + this.action.join(" ") + " ";
    }

    getDeltaHPLPFP() {
        let msg = "[color=yellow](";
        if(this.HPDamage > 0){
            msg += " HP Damage: " + this.HPDamage;
        }
        if(this.LPDamage > 0){
            msg += " Lust Damage: " + this.LPDamage;
        }
        if(this.FPDamage > 0){
            msg += " Focus Damage: " + this.FPDamage;
        }
        if(this.HPHeal > 0){
            msg += " HP Healed: " + this.HPHeal;
        }
        if(this.LPHeal > 0){
            msg += " Lust Healed: " + this.LPHeal;
        }
        if(this.FPHeal > 0){
            msg += " Focus Healed: " + this.FPHeal;
        }

        msg += "[/color]";

        return msg;
    }

    getHit() {
        return "[color=red][b]" + this.hit.join("\n") + "[/b][/color]";
    }

    getHint() {
        return "[color=cyan]" + this.hint.join("\n") + "[/color]";
    }

    getSpecial() {
        return "\n[color=red]" + this.special.join("\n") + "[/color]";
    }

    getStatus(){
        return this.status.join("\n");
    }

    getInfo(){
        return "\n" + this.info.join("\n");
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

        var lines = [""];

        lines[0] += this.getAction();
        lines[0] += this.getDeltaHPLPFP();
        if (lines[0] == "") lines = [];

        if (this.hit.length) lines.push(this.getHit());
        if (this.status.length) lines.push(this.getStatus());
        if (this.hint.length) lines.push(this.getHint());
        if (this.special.length) lines.push(this.getSpecial());
        if (this.info.length) lines.push(this.getInfo());
        if (this.error.length) lines.push(this.getError());

        message = lines.join("\n");

        this.clear();

        return message;
    }
}
