import {IFChatLib} from "./IFChatLib";

export interface IMessage {
    fChatLib:IFChatLib;
    channel:string;
    action: Array<string>;
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
    hit: Array<string>;
    status: Array<string>;
    hint: Array<string>;
    special: Array<string>;
    info: Array<string>;
    error: Array<string>;
    lastMessage: string;
}