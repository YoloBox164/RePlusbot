import Discord, { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { evaluate } from "mathjs";

class Calc implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs: true;
    isDev: false;
    
    name = "calc";
    aliases = ["calculate"];
    desc = "Egy számológép.";
    usage = `${Prefix}calc [számítás] pl.: >calc 1+1`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
    public async execute(message: Message, args?: Array<string>) {
        if(!args[0]) return message.channel.send("Kérem adjon meg egy helyes matematikai számítást.");
        try {
            const res = evaluate(args.join(" "));
            const embed = new Discord.MessageEmbed()
                .setColor(0xffffff)
                .setTitle("Matematika számítás")
                .addField("Bemenet", `\`\`\`js\n${args.join("")}\`\`\``)
                .addField("Kimenet", `\`\`\`js\n${res}\`\`\``);

            return message.channel.send({ embed: embed });
        } catch (error) {
            message.channel.send("Valami nem úgy ment mint kellett volna.");
            return Promise.reject(error);
        }
    }
}

export default new Calc();