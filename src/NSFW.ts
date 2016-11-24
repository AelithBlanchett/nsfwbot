import {CommandHandler} from "./CommandHandler";

module.exports = function (parent, channel) {
    let cmdHandler:CommandHandler = new CommandHandler(parent, channel);
    return cmdHandler;
};
