import { Message } from "discord.js";
import BaseCommand from "../../../structures/base-command";
import { Prefix } from "../../../settings";

class Vote implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = true;
    isDev = false;

    name = "vote";
    aliases = [];
    desc = "Vote";
    usage = `${Prefix}vote`;

    public async execute(message: Message, args: Array<string>) {
    }
}

export default new Vote();