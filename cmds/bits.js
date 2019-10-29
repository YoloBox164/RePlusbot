const Discord = require('discord.js');
const fs = require('fs');
const database = require('../database.js');
const daily = require('../daily.json');
const Functions = require('../functions.js');
const SETTINGS = require('../settings.json');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    if(process.env.mode === "development" && message.author.id !== bot.devId) return message.channel.send("This command is not avaiable in development mode.");
    var timeNow = Date.now();

    while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += database.config.DayInMilliSeconds;
    fs.writeFile("./daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });

    var currencyData = database.GetData('currency', message.author.id);
    var wumpusData = database.GetData('wumpus', message.author.id);

    var embed = new Discord.RichEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL)
        .setColor(message.member.displayHexColor)
        .setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. day)`);
    
    var errorEmbed = new Discord.RichEmbed()
        .setColor(message.member.displayHexColor);

    if(!args[0]) {
        embed.addField("Commands",
            `\`>bits buy\` => Opens the shop menu.
            \`>bits send [user] [amount]\` => Send bits to another user.
            \`>bits daily\` => Claim your daily bits.
            (Staff) \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)
            (Staff) \`>bits remove <user> [amount]\` (If user is not specified, it will be you then.)`
        );
        embed.addField("Bits Streak", `Claim your daily bits 5 days in a row and you'll get a bonus ${database.config.DayBitsStreakBonus} Bits!`);
        message.channel.send({embed: embed});
    } else if(args[0] === "buy") {
        embed.addField("Shop Menu", `🇦\tWumpus+ role \t${database.config.WumpusRoleCost} bits/month`);
        message.channel.send({embed: embed}).then(msg => {
            msg.react('🇦').then(r => {
                const emojies = ['🇦']
                const filter = (reaction, user) => emojies.includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = msg.createReactionCollector(filter, { time: 30000 });
                
                collector.on('collect', r => {
                    if(r.emoji.name === '🇦') {
                        if(wumpusData.hasRole) {
                            message.channel.send("You already have that role.", {embed: embed}).then(msg1 => {
                                msg1.delete(5000).catch(console.error);
                            }).catch(console.error);
                            collector.stop();
                            return;
                        }
                        if(currencyData.bits >= database.config.WumpusRoleCost) {
                            message.member.addRole(database.config.WumpusRoleId).catch(console.error)
                            currencyData.bits -= database.config.WumpusRoleCost;
                            wumpusData.hasRole = 1;
                            wumpusData.roleTime = daily.EndOfTheMonthInMilliSeconds + database.config.DayInMilliSeconds;
                            database.SetData('currency', currencyData);
                            database.SetData('wumpus', wumpusData);
                            embed.fields.pop();
                            message.channel.send("You've successfully bought the Wumpus+ role.", {embed: embed}).then(msg1 => {
                                msg1.delete(5000).catch(console.error);
                            }).catch(console.error);
                            collector.stop();
                        } else {
                            embed.fields.pop();
                            message.channel.send("You don't have enough bits for that item.", {embed: embed}).then(msg1 => {
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
        if(Functions.MemberHasRoles(message.member, SETTINGS.StaffIds) || !message.author.id === bot.devId) return message.channel.send("You don't have permission for this command.");
        var target = Functions.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Target not found.\n\n\`HELP\` => \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }

        var bits = 0;
        if(!isNaN(args[1])) bits = parseInt(args[1]);
        else if(!isNaN(args[2])) bits = parseInt(args[2]);
        else {
            errorEmbed.setDescription(`Amount not specified.\n\n\`HELP\` => \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});   
        }
        var targetCurrencyData = database.GetData('currency', target.id);

        if(bits > 1000000000) targetCurrencyData.bits = 1000000000;
        else targetCurrencyData.bits =  parseInt(bits) + parseInt(targetCurrencyData.bits);
        database.SetData('currency', targetCurrencyData);

        embed.setDescription(`You added ${bits} bits to ${target} successfully.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "remove") {
        if(Functions.MemberHasRoles(message.member, SETTINGS.StaffIds) || !message.author.id === bot.devId) return message.channel.send("You don't have permission for this command.");
        
        var target = Functions.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Target not found.\n\n\`HELP\` => \`>bits remove <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }

        var bits = 0;
        if(!isNaN(args[1])) bits = parseInt(args[1]);
        else if(!isNaN(args[2])) bits = parseInt(args[2]);
        else {
            errorEmbed.setDescription(`Amount not specified.\n\n\`HELP\` => \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});   
        }
        var targetCurrencyData = database.GetData('currency', target.id);

        if(Math.abs(bits) > targetCurrencyData.bits) bits = parseInt(targetCurrencyData.bits)
        targetCurrencyData.bits = parseInt(targetCurrencyData.bits) - parseInt(bits);
        database.SetData('currency', targetCurrencyData);

        embed.setDescription(`You removed ${bits} bits from ${target} successfully.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "send") {
        var target = Functions.GetMember(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Target not found.\n\n\`HELP\` => \`>bits send [user] [amount]\``);
            return message.channel.send({embed: errorEmbed});
        }

        if(!args[2] || isNaN(args[2])) {
            errorEmbed.setDescription(`Amount not specified.\n\n\`HELP\` => \`>bits send [user] [amount]\``);
            return message.channel.send({embed: errorEmbed});
        }
        if(currencyData.bits == 0) {
            errorEmbed.setDescription(`Your balance is zero. You cannot send any bits to other users.`);
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
        message.channel.send(`Transfer was successful.\nSended ${bits} bits to ${target.displayName}`, {embed: embed})

    } else if(args[0] === "daily") {
        if(message.author.id === bot.devId || currencyData.claimTime == 0 || currencyData.claimTime <= daily.NextDayInMilliSeconds) {
            currencyData.claimTime = timeNow + database.config.DayInMilliSeconds;
            currencyData.bits += database.config.DayBits;
            if(currencyData.streak >= 5) currencyData.streak = 0;
            if(currencyData.streak >= 4) {
                currencyData.bits += database.config.DayBitsStreakBonus;
                embed.addField("Bits Streak", `Yaay! You got a bonus ${database.config.DayBitsStreakBonus} Bits!`);
            } 
            currencyData.streak++
            database.SetData('currency', currencyData);
            embed.setDescription(`Bits: ${currencyData.bits} (Streak: ${currencyData.streak}. day)`);
            message.channel.send("You've successfully claimed your daily bits.", {embed: embed})
        } else {
            message.channel.send("You've already claimed your daily bits. Try tomorrow.")
        }
    }
}

module.exports.help = {
    cmd: "bits",
    alias: ["bit", "bitek"],
    name: "Bits",
    desc: "This is a currnecy in the server.",
    usage: ">bits",
    category: "user / staff"
}