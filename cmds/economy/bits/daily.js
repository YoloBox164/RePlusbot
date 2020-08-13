const Database = require("../../../database");
const daily = require("../../../storage/daily.json");

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @param {import("discord.js").MessageEmbed} embed
     * @param {import("../../../database").Currency} currencyData
     * @param {number} timeNow
    */
    func: (message, embed, currencyData, timeNow) => {
        if(message.author.id === message.client.devId || currencyData.claimTime == 0 || currencyData.claimTime <= daily.NextDayInMilliSeconds) {
            if(currencyData.streak >= 5) currencyData.streak = 0;
            if(currencyData.streak >= 4) {
                currencyData.bits += Database.config.DayBitsStreakBonus;
                embed.addField("Bits Streak", `Jééj! ${Database.config.DayBitsStreakBonus} bónusz bitet kaptál!`);
            }
            if(currencyData.claimTime <= daily.NextDayInMilliSeconds - (Database.config.DayInMilliSeconds * 2)) {
                currencyData.streak = 0;
            }
            currencyData.streak++;

            currencyData.claimTime = timeNow + Database.config.DayInMilliSeconds;
            currencyData.bits += Database.config.DayBits;

            Database.SetData("currency", currencyData);
            embed.setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. nap)`);
            message.channel.send("Sikeresen megszerezted a napi biteidet.", { embed: embed });
        } else {
            message.channel.send("Ma már megkaptad a napi biteidet, próbáld holnap.");
        }
    },
    help: "`>bits daily` => Szerezd meg a napi biteidet."
};