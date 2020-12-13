const Database = require("../../database");
const daily = require("../../storage/daily.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    /** @param {import("discord.js").Message} message Discord message. */
    execute: function(message) {
        const embed = new MessageEmbed()
            .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true })
            .setTimestamp(Date.now())
            .setColor("#78b159")
            .setTitle("Shop")
            .setDescription(
                `🇦\tWumpus+ rang\t${Database.config.WumpusRoleCost} bits/hó
                🇧\tSaját Emoji\t${Database.config.CustomEmojiCost} bits/hó (Wumpus+ rang szükséges)`
            );
        message.channel.send(embed).then(async msg => {
            await msg.react("🇦");
            await msg.react("🇧");

            const currencyData = await Database.GetData("Currency", message.author.id);

            const emojies = ["🇦", "🇧"];
            const filter = (reaction, user) => emojies.includes(reaction.emoji.name) && user.id === message.author.id;
            const collector = msg.createReactionCollector(filter, { time: 30000 });
            collector.on("collect", async r => {
                if(r.emoji.name === "🇦") {
                    let wumpusData = await Database.GetData("Wumpus", message.author.id);
                    if(wumpusData && wumpusData.hasRole) {
                        message.channel.send("Már van ilyen rangod.");
                        collector.stop();
                        return;
                    }
                    if(currencyData.bits >= Database.config.WumpusRoleCost) {
                        message.member.roles.add(Database.config.WumpusRoleId).catch(console.error);
                        currencyData.bits -= Database.config.WumpusRoleCost;
                        wumpusData = {
                            id: message.author.id,
                            hasRole: 1,
                            perma: 0,
                            roleTime: daily.EndOfTheMonthInMilliSeconds + Database.config.DayInMilliSeconds
                        };
                        Database.SetData("Currency", currencyData);
                        Database.SetData("Wumpus", wumpusData);
                        message.channel.send("Sikeresen megvetted a Wumpus+ rangot.");
                        collector.stop();
                    } else {
                        message.channel.send("Nincs elég bited.");
                        collector.stop();
                    }
                } else if(r.emoji.name === "🇧") {
                    const wumpusData = await Database.GetData("Wumpus", message.author.id);
                    if(!wumpusData || !wumpusData.hasRole) {
                        message.channel.send("Ehhez az engedélyhez szükséges a Wumpus+ rang.");
                        collector.stop();
                        return;
                    }
                    if(wumpusData && wumpusData.hasCustomEmoji) {
                        message.channel.send("Már van ilyen engedélyed.");
                        collector.stop();
                        return;
                    }
                    if(currencyData.bits >= Database.config.CustomEmojiCost) {
                        currencyData.bits -= Database.config.CustomEmojiCost;
                        wumpusData.hasCustomEmoji = true;
                        Database.SetData("Currency", currencyData);
                        Database.SetData("Wumpus", wumpusData);
                        message.channel.send("Sikeresen megvetted a Wumpus+ rangot.");
                        collector.stop();
                    } else {
                        message.channel.send("Nincs elég bited.");
                        collector.stop();
                    }
                }
                console.log(`Collected ${r.emoji.name}`);
            });
            collector.on("end", collected => {
                msg.edit("Lejárt a reagálási idő.");
                console.log(`Collected ${collected.size} items`);
            });
        }).catch(console.error);
    },
    args: false,
    name: "shop",
    aliases: [],
    desc: "Vásárlói menü. Itt tudsz különbféle rangokat és kiegészítőket vásárolni a biteidből.",
    usage: ">shop"
};