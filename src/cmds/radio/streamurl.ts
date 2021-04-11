import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Radio from "../../systems/radio";

class StreamUrl implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = true;

    name = "streamurl";
    aliases = [];
    desc = "";
    usage = `${Prefix}streamurl [fm channel]`;

    public async execute(message: Message, args: string[]) {
        Radio.streamUrl = args[0];
    }
    
}

export default new StreamUrl();