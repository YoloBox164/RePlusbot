const Database = require("../../../database");
const Tools = require("../../../utils/tools");

const help = "`>bits send [felhasználó] [mennyiség]` => Küldj más felhasználónak bitet.";

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     * @param {import("discord.js").MessageEmbed} embed
     * @param {import("discord.js").MessageEmbed} errorEmbed
     * @param {import("../../../database").Currency} currencyData
    */
    func: (message, args, embed, errorEmbed, currencyData) => {
        const target = Tools.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => ${help}`);
            return message.channel.send({ embed: errorEmbed });
        }

        if(!args[2] || isNaN(args[2])) {
            errorEmbed.setDescription(`Mennyiség nem volt megadva.\n\n\`Segítség\` => ${help}`);
            return message.channel.send({ embed: errorEmbed });
        }
        if(currencyData.bits == 0) {
            errorEmbed.setDescription("Jelenleg 0 bited van ezért jelenleg nem tudsz küldeni másnak.");
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

        let bits = parseInt(args[2]);

        if(Math.abs(bits) > parseInt(currencyData.bits)) bits = parseInt(currencyData.bits);
        targetCurrencyData.bits = parseInt(targetCurrencyData.bits) + bits;
        currencyData.bits = parseInt(currencyData.bits) - bits;
        Database.SetData("currency", targetCurrencyData);
        Database.SetData("currency", currencyData);

        embed.setDescription(`Bits: ${currencyData.bits}`);
        message.channel.send(`Utalás sikeres.\n${bits} bit átkerült ${target.displayName} számlájára`, { embed: embed });
    },
    help: help
};