import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";

import { Prefix } from "../../settings";

class Ping implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = false;

    name = "ping";
    aliases = [];
    desc = "Ping - Pong!";
    usage = `${Prefix}ping`;

    public execute(message: Message) {
        return message.channel.send("Pong!");
    }
}

export default new Ping();