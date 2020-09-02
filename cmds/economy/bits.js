const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const Database = require("../../database");
const daily = require("../../storage/daily.json");

const Add = require("./add");
const Daily = require("./daily");
const Remove = require("./remove");
const Send = require("./send");
const Shop = require("./shop");

module.exports = {
    /** @param {import("discord.js").Message} message Discord message. */
    execute: (message) => {
        const timeNow = Date.now();

        while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += Database.config.DayInMilliSeconds;
        fs.writeFile("./storage/daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });

        Database.GetData("currency", message.author.id).then(currencyData => {
            if(!currencyData) {
                currencyData = {
                    id: message.author.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
                Database.SetData("Currency", currencyData);
            }
            if(currencyData.claimTime <= daily.NextDayInMilliSeconds - (Database.config.DayInMilliSeconds * 2)) {
                currencyData.streak = 0;
            }
            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                .setTimestamp(timeNow)
                .setColor("#78b159")
                .setTitle("Bits")
                .addFields([
                    { name: "Egyenleg", value: `\`\`\`${currencyData.bits} bits\`\`\``, inline: true },
                    { name: "Streak", value: `\`\`\`${currencyData.streak}. nap\`\`\``, inline: true },
                    {
                        name: "Parancsok",
                        value: `${Daily.usage}\`\`\`md\n# ${Daily.desc}\`\`\`
                            ${Shop.usage}\`\`\`md\n# ${Shop.desc}\`\`\`
                            ${Send.usage}\`\`\`md\n# ${Send.desc}\`\`\`
                            ──═══════════════════════──\n
                            ${Add.usage}\`\`\`md\n# ${Add.desc}\`\`\`
                            ${Remove.usage}\`\`\`md\n# ${Remove.desc}\`\`\``,
                        inline: false
                    },
                    {
                        name: "Bits Streak",
                        value: `Szerezd meg a napi biteidet 5 napon keresztűl és kapni fogsz bónusz ${Database.config.DayBitsStreakBonus} Bitet!`,
                        inline: false
                    }
                ]);
            message.channel.send(embed);
        }).catch(console.error);
    },
    args: false,
    name: "bits",
    aliases: ["bit", "bitek"],
    desc: "Ez a szerver pénz típusa. Szerezhetsz napi biteket, küldhetsz másoknak vagy vásárolhatsz különbféle dolgokat.",
    usage: ">bits"
};