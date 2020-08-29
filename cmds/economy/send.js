const Database = require("../../database");
const Tools = require("../../utils/tools");
const { MessageEmbed } = require("discord.js");

module.exports = {
    /**
     * @async
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: async function(message, args) {
        const target = Tools.GetMember(message, args, false);
        if(!target) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Nem találtam ilyen felhasználót.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }
        if(target.id === message.author.id) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Magadnak nem utalhatsz bitet.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }
        if(target.user.bot) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Botnak nem küldhetsz bitet.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }
        if(!args[1] || isNaN(args[1])) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Mennyiség nem volt megadva.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }

        let bits = parseInt(args[1]);
        if(bits < 0) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Mennyiség nem negatív.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }

        const currencyData = await Database.GetData("Currency", message.author.id);

        if(!currencyData || currencyData.bits === 0) {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Jelenleg 0 bited van ezért nem tudsz küldeni másnak.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }

        let targetCurrencyData = await Database.GetData("Currency", target.id);
        if(!targetCurrencyData) {
            targetCurrencyData = {
                id: target.id,
                bits: 0,
                claimTime: 0,
                streak: 0
            };
        }

        if(Math.abs(bits) > currencyData.bits) bits = currencyData.bits;
        targetCurrencyData.bits = targetCurrencyData.bits + bits;
        currencyData.bits = currencyData.bits - bits;
        await Database.SetData("Currency", targetCurrencyData);
        await Database.SetData("Currency", currencyData);
        const embed = new MessageEmbed()
            .setAuthor(message.member.displayName, message.author.displayAvatarURL())
            .setTimestamp(Date.now())
            .setColor("#78b159")
            .setTitle("Bits")
            .setDescription(`${bits} bit átkerült ${target} egyenlegébe.`)
            .addField(`${target.displayName} egyenlege`, `\`\`\`${targetCurrencyData.bits} bits\`\`\``)
            .addField("Saját egyenleged", `\`\`\`${currencyData.bits} bits\`\`\``);

        message.channel.send(embed);
    },
    args: true,
    name: "send",
    aliases: ["küld"],
    desc: "Ezzel a parancsal tudsz küldeni biteket más felhasználóknak.",
    usage: ">send [felhasználó] [mennyiség]"
};