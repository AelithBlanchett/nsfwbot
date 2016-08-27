import {IFChatLib} from "./NSFWClasses/interfaces/IFChatLib";
import {CommandHandler} from "./NSFWClasses/CommandHandler";

module.exports = function (parent, channel) {
    let cmdHandler:CommandHandler = new CommandHandler(parent, channel);
    return cmdHandler;
};
