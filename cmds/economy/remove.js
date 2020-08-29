const Settings = require("../../settings.json");
const Database = require("../../database");
const Tools = require("../../utils/tools");
const { MessageEmbed } = require("discord.js");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: function(message, args) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != message.client.devId) {
            message.channel.send("Nincs jogod ehhez a parancshoz.");
            return;
        }

        const target = Tools.GetMember(message, args);
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

        let bits = 0;
        if(!isNaN(args[0])) {
            bits = parseInt(args[0]);
        } else if(!isNaN(args[1])) {
            bits = parseInt(args[1]);
        } else {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Mennyiség nem volt megadva.```")
                .addField("Segítsgég", `\`\`\`md\n${this.usage}\`\`\``);
            message.channel.send(embed);
            return;
        }
        Database.GetData("currency", target.id).then(targetCurrencyData => {
            if(!targetCurrencyData) {
                targetCurrencyData = {
                    id: target.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
            }

            if(Math.abs(bits) > targetCurrencyData.bits) bits = targetCurrencyData.bits;
            targetCurrencyData.bits -= bits;

            Database.SetData("Currency", targetCurrencyData).then(() => {
                const embed = new MessageEmbed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp(Date.now())
                    .setColor("#78b159")
                    .setTitle("Bits")
                    .setDescription(`${target} egyenlege csökkent ${bits} bittel.`)
                    .addField(`${target.displayName} egyenlege`, `\`\`\`${targetCurrencyData.bits} bits\`\`\``);

                message.channel.send(embed);
            });
        });
    },
    args: true,
    name: "remove",
    aliases: [],
    desc: "(STAFF) Ezzel a parancsal tudsz megvonni biteket a felhasználókntól.",
    usage: ">remove <felhasználó> [mennyiség] (Ha nincsen felhasználó megadva akkor te leszel.)"
};