import Discord, { Message } from "discord.js";
import math from "mathjs";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";

class Calc implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs: true;
    isDev: false;
    
    name = "calc";
    aliases = ["calculate"];
    desc = "Konkrétan egy számológép.";
    usage = `${Prefix}calc [számítás] pl.: >calc 1+1`;

    /**
     * @param  message Discord message.
     * @param  args The message.content in an array without the command.
     */
    public async execute(message: Message, args: Array<string>) {
        if(!args[0]) return message.channel.send("Hibás bevitel");

        let res;
        try {
            res = math.evaluate(args.join(" "));
        } catch (e) {
            return message.channel.send("Hibás bevitel");
        }

        const embed = new Discord.MessageEmbed()
            .setColor(0xffffff)
            .setTitle("Matematika számítás")
            .addField("Bemenet", `\`\`\`js\n${args.join("")}\`\`\``)
            .addField("Kimenet", `\`\`\`js\n${res}\`\`\``);

        return message.channel.send({ embed: embed });
    }
}

export default new Calc();