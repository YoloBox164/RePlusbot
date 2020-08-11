const Database = require("../../../database");
const daily = require("../../../storage/daily.json");

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @param {import("discord.js").MessageEmbed} embed
     * @param {import("../../../database").currency} currencyData
    */
    func: (message, embed, currencyData) => {
        embed.addField("Shop Menü", `🇦\tWumpus+ rang \t${Database.config.WumpusRoleCost} bits/hó`);
        message.channel.send({ embed: embed }).then(msg => {
            msg.react("🇦").then(() => {
                const emojies = ["🇦"];
                const filter = (reaction, user) => emojies.includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = msg.createReactionCollector(filter, { time: 30000 });
                collector.on("collect", r => {
                    if(r.emoji.name === "🇦") {
                        let wumpusData = Database.GetData("wumpus", message.author.id);
                        if(wumpusData && wumpusData.hasRole) {
                            message.channel.send("Már van ilyen rangod.", { embed: embed });
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
                            Database.SetData("currency", currencyData);
                            Database.SetData("wumpus", wumpusData);
                            embed.fields.pop();
                            message.channel.send("Sikeresen megvetted a Wumpus+ rangot.", { embed: embed });
                            collector.stop();
                        } else {
                            embed.fields.pop();
                            message.channel.send("Nincs elég bited.", { embed: embed });
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
        }).catch(console.error);
    },
    help: "`>bits buy` => Vásárlói menüt megnyitja"
};
