export interface IFChatLib{
    sendMessage(s: string, chan: string);
    throwError(s: string);
}