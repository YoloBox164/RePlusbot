import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

class Vip implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = false;

    name = "vip";
    aliases = ["lounge"];
    desc = "Saját privát hangszobák!";
    usage = `${Prefix}vip`;

    public async execute(message: Message, args: Array<string>) {
        
    }
}

export default new Vip();