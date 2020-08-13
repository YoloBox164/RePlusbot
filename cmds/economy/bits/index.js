const Discord = require("discord.js");
const fs = require("fs");
const database = require("../../../database");
const daily = require("../../../storage/daily.json");

const Buy = require("./buy");
const Send = require("./send");
const Daily = require("./daily");
const Add = require("./add");
const Remove = require("./remove");

module.exports = {
    /**
     * @param {import("../../../typings").CustomMessage} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        if(process.env.mode === "development" && message.author.id !== message.client.devId) return message.channel.send("Ez a parancs nem elérhető fejlesztői módban neked.");
        const timeNow = Date.now();

        while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += database.config.DayInMilliSeconds;
        fs.writeFile("./storage/daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });

        database.GetData("currency", message.author.id).then(currencyData => {
            if(!currencyData) {
                currencyData = {
                    id: message.author.id,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                };
            }

            const embed = new Discord.MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                .setColor(message.member.displayHexColor)
                .setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. nap)`);

            const errorEmbed = new Discord.MessageEmbed()
                .setColor(message.member.displayHexColor);

            if(!args[0]) {
                embed.addField("Parancsok",
                    `${Buy.help}
                    ${Send.help}
                    ${Daily.help}
                    ${Add.help}
                    ${Remove.help}`
                );
                embed.addField("Bits Streak", `Szerezd meg a napi biteidet 5 napon keresztűl és kapni fogsz bónusz ${database.config.DayBitsStreakBonus} Bitet!`);
                message.channel.send({ embed: embed });
            } else if(args[0] === "buy") {
                Buy.func(message, embed, currencyData, daily);
            } else if(args[0] === "add") {
                Add.func(message, args, embed, errorEmbed);
            } else if(args[0] === "remove") {
                Remove.func(message, args, embed, errorEmbed);
            } else if(args[0] === "send") {
                Send.func(message, args, embed, errorEmbed, currencyData);
            } else if(args[0] === "daily") {
                Daily.func(message, embed, currencyData, timeNow);
            }
        }).catch(err => {throw err;});
    },
    args:true,
    name: "bits",
    aliases: ["bit", "bitek"],
    desc: "Ez a szerver pénz típusa. Itt találhatod meg a napi biteidet, küldhetsz másoknak vagy vásárolhatsz ezekkel különbféle dolgokat.",
    usage: ">bits"
};