const Discord = require('discord.js');
const fs = require('fs');
const database = require('../../database');
const daily = require('../../storage/daily.json');
const Tools = require('../../utils/tools.js');
const Settings = require('../../settings.json');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    if(process.env.mode === "development" && message.author.id !== bot.devId) return message.channel.send("Ez a parancs nem elérhető fejlesztői módban neked.");
    var timeNow = Date.now();

    while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += database.config.DayInMilliSeconds;
    fs.writeFile("./daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });

    var currencyData = database.GetData('currency', message.author.id);
    var wumpusData = database.GetData('wumpus', message.author.id);

    var embed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL())
        .setColor(message.member.displayHexColor)
        .setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. nap)`);
    
    var errorEmbed = new Discord.MessageEmbed()
        .setColor(message.member.displayHexColor);

    if(!args[0]) {
        embed.addField("Parancsok",
            `${this.helpForInterCmds.buy}
            ${this.helpForInterCmds.send}
            ${this.helpForInterCmds.daily}
            ${this.helpForInterCmds.add}
            ${this.helpForInterCmds.remove}`
        );
        embed.addField("Bits Streak", `Szerezd meg a napi biteidet 5 napon keresztűl és kapni fogsz bónusz ${database.config.DayBitsStreakBonus} Bitet!`);
        message.channel.send({embed: embed});
    } else if(args[0] === "buy") {
        embed.addField("Shop Menü", `🇦\tWumpus+ rang \t${database.config.WumpusRoleCost} bits/hó`);
        message.channel.send({embed: embed}).then(msg => {
            msg.react('🇦').then(r => {
                const emojies = ['🇦']
                const filter = (reaction, user) => emojies.includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = msg.createReactionCollector(filter, { time: 30000 });
                
                collector.on('collect', r => {
                    if(r.emoji.name === '🇦') {
                        if(wumpusData.hasRole) {
                            message.channel.send("Már van ilyen rangod.", {embed: embed}).then(msg1 => {
                                msg1.delete(5000).catch(console.error);
                            }).catch(console.error);
                            collector.stop();
                            return;
                        }
                        if(currencyData.bits >= database.config.WumpusRoleCost) {
                            message.member.roles.add(database.config.WumpusRoleId).catch(console.error)
                            currencyData.bits -= database.config.WumpusRoleCost;
                            wumpusData.hasRole = 1;
                            wumpusData.roleTime = daily.EndOfTheMonthInMilliSeconds + database.config.DayInMilliSeconds;
                            database.SetData('currency', currencyData);
                            database.SetData('wumpus', wumpusData);
                            embed.fields.pop();
                            message.channel.send("Sikeresen megvetted a Wumpus+ rangot.", {embed: embed}).then(msg1 => {
                                msg1.delete(5000).catch(console.error);
                            }).catch(console.error);
                            collector.stop();
                        } else {
                            embed.fields.pop();
                            message.channel.send("Nincs elég bited.", {embed: embed}).then(msg1 => {
                                msg1.delete(5000).catch(console.error);
                            }).catch(console.error);
                            collector.stop();
                        }
                    }
                    
    
                    console.log(`Collected ${r.emoji.name}`);
                });
        
                collector.on('end', collected => {
                    msg.delete(5000).catch(console.error);
                    console.log(`Collected ${collected.size} items`);
                });
            }).catch(console.error);
        }).catch(console.error);
    } else if(args[0] === "add") {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != bot.devId) {
            return message.channel.send("Nincs jogod ehhez a parancshoz.");
        }

        var target = Tools.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Nem találtam ilyen felhasználót.\n\n\`Segítsgég\` => ${this.helpForInterCmds.add}`);
            return message.channel.send({embed: errorEmbed});
        }

        var bits = 0;
        if(!isNaN(args[1])) bits = parseInt(args[1]);
        else if(!isNaN(args[2])) bits = parseInt(args[2]);
        else {
            errorEmbed.setDescription(`Mennyiség nem volt megadva.\n\n\`Segítség\` => ${this.helpForInterCmds.add}`);
            return message.channel.send({embed: errorEmbed});   
        }
        var targetCurrencyData = database.GetData('currency', target.id);

        if(bits > 1000000000) targetCurrencyData.bits = 1000000000;
        else targetCurrencyData.bits =  parseInt(bits) + parseInt(targetCurrencyData.bits);
        database.SetData('currency', targetCurrencyData);

        embed.setDescription(`Hozzáadtál ${bits} bitet ${target} sikeresen.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "remove") {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != bot.devId) {
            return message.channel.send("Nincs jogod ehhez a parancshoz.");
        }
        
        var target = Tools.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => ${this.helpForInterCmds.remove}`);
            return message.channel.send({embed: errorEmbed});
        }

        var bits = 0;
        if(!isNaN(args[1])) bits = parseInt(args[1]);
        else if(!isNaN(args[2])) bits = parseInt(args[2]);
        else {
            errorEmbed.setDescription(`Mennyiség nem volt megadva.\n\n\`Segítség\` => ${this.helpForInterCmds.remove}`);
            return message.channel.send({embed: errorEmbed});   
        }
        var targetCurrencyData = database.GetData('currency', target.id);

        if(Math.abs(bits) > targetCurrencyData.bits) bits = parseInt(targetCurrencyData.bits)
        targetCurrencyData.bits = parseInt(targetCurrencyData.bits) - parseInt(bits);
        database.SetData('currency', targetCurrencyData);

        embed.setDescription(`Eltávolítottál ${bits} bitet ${target} sikeresen.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "send") {
        var target = Tools.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => ${this.helpForInterCmds.send}`);
            return message.channel.send({embed: errorEmbed});
        }

        if(!args[2] || isNaN(args[2])) {
            errorEmbed.setDescription(`Mennyiség nem volt megadva.\n\n\`Segítség\` => ${this.helpForInterCmds.send}`);
            return message.channel.send({embed: errorEmbed});
        }
        if(currencyData.bits == 0) {
            errorEmbed.setDescription(`Jelenleg 0 bited van ezért jelenleg nem tudsz küldeni másnak.`);
            return message.channel.send({embed: errorEmbed});
        }

        var targetCurrencyData = database.GetData('currency', target.id);

        var bits = parseInt(args[2]);
        
        if(Math.abs(bits) > parseInt(currencyData.bits)) bits = parseInt(currencyData.bits);
        targetCurrencyData.bits = parseInt(targetCurrencyData.bits) + bits;
        currencyData.bits = parseInt(currencyData.bits) - bits;
        database.SetData('currency', targetCurrencyData);
        database.SetData('currency', currencyData);

        embed.setDescription(`Bits: ${currencyData.bits}`);
        message.channel.send(`Utalás sikeres.\n${bits} bit átkerült ${target.displayName} számlájára`, {embed: embed})

    } else if(args[0] === "daily") {
        if(message.author.id === bot.devId || currencyData.claimTime == 0 || currencyData.claimTime <= daily.NextDayInMilliSeconds) {
            if(currencyData.streak >= 5) currencyData.streak = 0;
            if(currencyData.streak >= 4) {
                currencyData.bits += database.config.DayBitsStreakBonus;
                embed.addField("Bits Streak", `Jééj! ${database.config.DayBitsStreakBonus} bónusz bitet kaptál!`);
            } 
            if(currencyData.claimTime <= daily.NextDayInMilliSeconds - (database.config.DayInMilliSeconds * 2)) {
                currencyData.streak = 0
            }
            currencyData.streak++;

            currencyData.claimTime = timeNow + database.config.DayInMilliSeconds;
            currencyData.bits += database.config.DayBits;

            database.SetData('currency', currencyData);
            embed.setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. nap)`);
            message.channel.send("Sikeresen megszerezted a napi biteidet.", {embed: embed})
        } else {
            message.channel.send("Ma már megkaptad a napi biteidet, próbáld holnap.")
        }
    }
}

module.exports.help = {
    cmd: "bits",
    alias: ["bit", "bitek"],
    name: "Bits",
    desc: "Ez a szerver pénz típusa. Itt találhatod meg a napi biteidet, küldhetsz másoknak vagy vásárolhatsz ezekkel különbféle dolgokat.",
    usage: ">bits",
    category: "felhasználói / staff"
}

module.exports.helpForInterCmds = {
    buy: "\`>bits buy\` => Vásárlói menüt megnyitja",
    send: "\`>bits send [felhasználó] [mennyiség]\` => Küldj más felhasználónak bitet.",
    daily: "\`>bits daily\` => Szerezd meg a napi biteidet.",
    add: "(Staff) \`>bits add <felhasználó> [mennyiség]\` (Ha nincsen felhasználó megadva akkor te leszel.)",
    remove: "(Staff) \`>bits remove <felhasználó> [mennyiség]\` (Ha nincsen felhasználó megadva akkor te leszel.)",
}