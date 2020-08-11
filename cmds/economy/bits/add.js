const Settings = require("../../../settings.json");
const Database = require("../../../database");
const Tools = require("../../../utils/tools");

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {import("discord.js").MessageEmbed} embed
     * @param {import("discord.js").MessageEmbed} errorEmbed
    */
    func: (message, args, embed, errorEmbed) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != message.client.devId) {
            return message.channel.send("Nincs jogod ehhez a parancshoz.");
        }

        const target = Tools.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Nem találtam ilyen felhasználót.\n\n\`Segítsgég\` => ${this.help}`);
            return message.channel.send({ embed: errorEmbed });
        }

        let bits = 0;
        if(!isNaN(args[1])) {
            bits = parseInt(args[1]);
        } else if(!isNaN(args[2])) {
            bits = parseInt(args[2]);
        } else {
            errorEmbed.setDescription(`Mennyiség nem volt megadva.\n\n\`Segítség\` => ${this.help}`);
            return message.channel.send({ embed: errorEmbed });
        }
        let targetCurrencyData = Database.GetData("currency", target.id);
        if(!targetCurrencyData) {
            targetCurrencyData = {
                id: target.id,
                bits: 0,
                claimTime: 0,
                streak: 0
            };
        }

        if(bits > 1000000000) targetCurrencyData.bits = 1000000000;
        else targetCurrencyData.bits = parseInt(bits) + parseInt(targetCurrencyData.bits);
        Database.SetData("currency", targetCurrencyData);

        embed.setDescription(`Hozzáadtál ${bits} bitet ${target} sikeresen.`);
        message.channel.send({ embed: embed });
    },
    help: "(Staff) `>bits add <felhasználó> [mennyiség]` (Ha nincsen felhasználó megadva akkor te leszel.)"
};