const Discord = require("discord.js");

const CategoryTranslation = {
    analytic: "Analitikus",
    dev: "Fejlesztő",
    economy: "Economy",
    fun: "Szorakoztató",
    info: "Infó",
    misc: "Melékleges",
    mod: "Moderátor",
    staff: "Staff",
    test: "Teszt",
    utility: "Hasznos"
};

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        const bot = message.client;
        const commands = bot.CommandHandler.commands;
        const categories = bot.CommandHandler.categories;

        const embed = new Discord.MessageEmbed()
            .setTitle("Parancs Lista")
            .setColor(message.guild.member(bot.user).displayHexColor)
            .setDescription("**`>help <parancs>` » Leírja az adott parancsot.**")
            .addField("Szímbólumok jelentése:", "<opcionális> | [kötelező]", true);

        if(args[0]) {
            const cmd = commands.get(args[0].toLowerCase()) || commands.get(bot.aliasCmds.get(args[0].toLowerCase()));
            if(cmd) {
                embed.addField(cmd.help.name,
                    `**Parancs:** *${cmd.help.cmd}*
                    **Leírás:** *${cmd.help.desc}*
                    **Használat:** \`${cmd.help.usage}\`${cmd.help.alias[0] ? "\n**Álnevek:** `>" + cmd.help.alias.join(" | >") + "`" : ""}`
                );
                message.channel.send({ embed: embed });
            } else {message.channel.send("Nem találtam ilyen parancsot.");}
        } else {
            categories.forEach((cmdNames, category) => {
                if(category !== "dev" && category !== "test") {
                    embed.addField(`${CategoryTranslation[category]} ─ ${cmdNames.length}`, `\`${cmdNames.join("` | `")}\``);
                }
            });
            message.channel.send({ embed: embed });
        }
    },
    args: true,
    name: "help",
    aliases: ["segitseg", "segítség"],
    desc: "Leírások a parancsokról",
    usage: ">help <oldal / parancs>"
};