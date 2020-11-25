import Discord from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

enum CategoryTranslation {
    analytic = "Analitikus",
    dev = "Fejlesztő",
    economy = "Economy",
    fun = "Szorakoztató",
    info = "Infó",
    misc = "Melékleges",
    mod = "Moderátor",
    staff = "Staff",
    test = "Teszt",
    utility = "Hasznos"
}

class Help implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "help";
    aliases: ["segitseg", "segítség"];
    desc = "Leírások a parancsokról";
    usage = `${Prefix}help <oldal / parancs>`;

    public async execute(message: Discord.Message, args?: string[]) {
        const bot = message.client;
        const commands = await bot.CommandHandler.commands;
        const categories = await bot.CommandHandler.categories;


        let embed = new Discord.MessageEmbed()
            .setTitle("Parancs Lista")
            .setColor(message.guild.member(bot.user).displayHexColor)
            .setDescription("**`>help <parancs>` » Leírja az adott parancsot.**")
            .addField("Szímbólumok jelentése:", "<opcionális> | [kötelező]", true);

        if(args[0]) {
            const cmd = commands.get(args[0].toLowerCase()) || commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));
            if(cmd) {
                embed = new Discord.MessageEmbed()
                    .setTitle(Tools.FirstCharUpperCase(cmd.name))
                    .setColor(message.guild.member(bot.user).displayHexColor)
                    .setTimestamp(Date.now())
                    .setDescription(`\`\`\`md\n# ${cmd.desc}\`\`\``)
                    .addField("Használat:", `\`\`\`md\n${cmd.usage}\`\`\``);
                if(cmd.aliases && cmd.aliases.length > 0) {
                    embed.addField("Más néven:", `\`>${cmd.aliases.join("` `>")}\``);
                }
                embed.addField("Szímbólumok jelentése:", "<opcionális> | [kötelező]", true);
                return message.channel.send({ embed: embed });
            } else { return message.channel.send("Nem találtam ilyen parancsot."); }
        } else {
            categories.forEach((cmdNames, category) => {
                if(category !== "dev" && category !== "test") {
                    embed.addField(`${CategoryTranslation[category]} ─ ${cmdNames.length}`, `\`${cmdNames.join("` `")}\``);
                }
            });
            return message.channel.send({ embed: embed });
        }
    }
}

export default new Help();