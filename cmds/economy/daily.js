const { MessageEmbed } = require("discord.js");
const Database = require("../../database");
const daily = require("../../storage/daily.json");
const fs = require("fs");

module.exports = {
    /** @param {import("discord.js").Message} message Discord message. */
    execute: function(message) {
        Database.GetData("Currency", message.author.id).then(currencyData => {
            const timeNow = Date.now();
            while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += Database.config.DayInMilliSeconds;
            fs.writeFile("./storage/daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });
            if(!currencyData) {
                currencyData = {
                    id: message.author.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
            }
            if(message.author.id === message.client.devId || currencyData.claimTime <= daily.NextDayInMilliSeconds) {
                currencyData.claimTime = timeNow + Database.config.DayInMilliSeconds;
                currencyData.bits += Database.config.DayBits;
                if(currencyData.streak >= 5) currencyData.streak = 0;
                if(currencyData.claimTime <= daily.NextDayInMilliSeconds - (Database.config.DayInMilliSeconds * 2)) {
                    currencyData.streak = 0;
                }
                currencyData.streak++;

                const embed = new MessageEmbed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp(timeNow)
                    .setColor("#78b159")
                    .setTitle("Bits")
                    .addFields([
                        { name: "Egyenleg", value: `\`\`\`${currencyData.bits} bits\`\`\``, inline: true },
                        { name: "Streak", value: `\`\`\`${currencyData.streak}. nap\`\`\``, inline: true }
                    ]);

                if(currencyData.streak === 5) {
                    currencyData.bits += Database.config.DayBitsStreakBonus;
                    embed.fields[0].value = `\`\`\`${currencyData.bits} bits\`\`\``;
                    embed.addField("Bits Streak", `Jééj! ${Database.config.DayBitsStreakBonus} bónusz bitet kaptál!`);
                }

                Database.SetData("Currency", currencyData).then(() => {
                    message.channel.send("Sikeresen megszerezted a napi biteidet.", { embed: embed });
                }).catch(console.error);
            } else {
                message.channel.send("Ma már megkaptad a napi biteidet, próbáld holnap.");
            }
        }).catch(console.error);

    },
    args: false,
    name: "daily",
    aliases: ["napi"],
    desc: "Napi bitek beszerzése.",
    usage: ">daily"
};