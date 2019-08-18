const Discord = require('discord.js');
const fs = require('fs');
const database = require('../database.js');
const daily = require('../daily.json');
const functions = require('../functions.js');

module.exports.run = (bot, message, args) => {
    var timeNow = Date.now();

    while(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += database.config.DayInMilliSeconds;
    fs.writeFile("../daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });

    var staffIds = ["611682412161794081", "611682395078393936"]
    var currencyData = database.GetCurrencyData().get(message.author.id);
    if(!currencyData) {
        currencyData = database.GetCurrencyObjectTemplate(message.author.id);
        database.SetCurrencyData().run(currencyData)
    }

    var embed = new Discord.RichEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL)
        .setColor(message.member.displayHexColor)
        .setDescription(`Bits: ${currencyData.bits}`);
    
    var errorEmbed = new Discord.RichEmbed()
        .setColor(message.member.displayHexColor);

    if(!args[0]) {
        embed.addField("Commands",
            `(Staff) \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)
            (Staff) \`>bits remove <user> [amount]\` (If user is not specified, it will be you then.)
            \`>bits send [user] [amount]\` => Send bits to another user.
            \`>bits daily\` => Claim your daily bits.`
        );
        message.channel.send({embed: embed});
    }
    else if(args[0] === "add") {
        if(functions.MemberHasRoles(message.member, staffIds)) return message.channel.send("You don't have permission for this command.");
        
        var target = functions.GetTarget(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Target not found.\n\n\`HELP\` => \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }

        if(!args[2] || isNaN(args[2])) {
            errorEmbed.setDescription(`Amount not specified.\n\n\`HELP\` => \`>bits add <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }
        var targetCurrencyData = database.GetCurrencyData().get(target.id);
        if(!targetCurrencyData) {
            targetCurrencyData = database.GetCurrencyObjectTemplate(target.id);
            database.SetCurrencyData().run(targetCurrencyData)
        }

        if(args[2] > 1000000000) targetCurrencyData.bits = 1000000000;
        else targetCurrencyData.bits += args[2];
        database.SetCurrencyData().run(targetCurrencyData);

        embed.setDescription(`You added ${args[2]} bits to ${target} successfully.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "remove") {
        if(functions.MemberHasRoles(message.member, staffIds)) return message.channel.send("You don't have permission for this command.");
        
        var target = functions.GetTarget(message, args.slice(1));
        if(!target) {
            errorEmbed.setDescription(`Target not found.\n\n\`HELP\` => \`>bits remove <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }

        if(!args[2] || isNaN(args[2])) {
            errorEmbed.setDescription(`Amount not specified.\n\n\`HELP\` => \`>bits remove <user> [amount]\` (If user is not specified, it will be you then.)`);
            return message.channel.send({embed: errorEmbed});
        }
        var targetCurrencyData = database.GetCurrencyData().get(target.id);
        if(!targetCurrencyData) {
            targetCurrencyData = database.GetCurrencyObjectTemplate(target.id);
            database.SetCurrencyData().run(targetCurrencyData)

            errorEmbed.setDescription(`The User's balance is zero. You can't remove anymore bits.`);
            return message.channel.send({embed: errorEmbed});
        }

        if(Math.abs(args[2]) > targetCurrencyData.bits) args[2] = targetCurrencyData.bits
        targetCurrencyData.bits -= args[2];
        database.SetCurrencyData().run(targetCurrencyData);

        embed.setDescription(`You removed ${args[2]} bits from ${target} successfully.`);
        message.channel.send({embed: embed});
    } else if(args[0] === "send") {
        var target = functions.GetTarget(message, args.slice(1));
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

        var targetCurrencyData = database.GetCurrencyData().get(target.id);
        var targetCurrencyData = database.GetCurrencyData().get(target.id);
        if(!targetCurrencyData) {
            targetCurrencyData = database.GetCurrencyObjectTemplate(target.id);
            database.SetCurrencyData().run(targetCurrencyData)
        }
        
        if(Math.abs(args[2]) > currencyData.bits) args[2] = currencyData.bits
        targetCurrencyData.bits += args[2];
        currencyData.bits -= args[2];
        database.SetCurrencyData().run(targetCurrencyData);
        database.SetCurrencyData().run(currencyData);

        embed.setDescription(`Bits: ${currencyData.bits}`);
        message.channel.send("Transfer was successful.", {embed: embed})

    } else if(args[0] === "daily") {
        if(currencyData.claimTime == 0 || currencyData.claimTime <= daily.NextDayInMilliSeconds) {
            currencyData.claimTime = timeNow + database.config.DayInMilliSeconds;
            currencyData.bits += database.config.DayBits;
            database.SetCurrencyData().run(currencyData);
            embed.setDescription(`Bits: ${currencyData.bits}`);
            message.channel.send("You've successfully claimed your daily bits.", {embed: embed})
        } else {
            message.channel.send("You've already claimed your daily bits. Try tomorrow.")
        }
    }
}

module.exports.help = {
    cmd: "bits",
    alias: ["bit", "bitek"],
    name: "Bits"
}

