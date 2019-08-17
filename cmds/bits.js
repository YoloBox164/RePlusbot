const Discord = require('discord.js');
const fs = require('fs');
const database = require('../database.js');
const daily = require('../daily.json');
const functions = require('../functions.js');

module.exports.run = (bot, message, args) => {
    var timeNow = Date.now();
    if(daily.NextDayInMilliSeconds < timeNow) daily.NextDayInMilliSeconds += database.config.DayInMilliSeconds;
    fs.writeFile("../daily.json", JSON.stringify(daily, null, 4), err => {
        if(err) throw err;
    });
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

    if(!args[0]) message.channel.send({embed: embed});
    else if(args[0] === "add") {
        if(functions.MemberHasRoles(message.member, staffIds)) return message.channel.send("You don't have permission for this command.");

    } else if(args[0] === "remove") {
        if(functions.MemberHasRoles(message.member, staffIds)) return message.channel.send("You don't have permission for this command.");

    } else if(args[0] === "send") {

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
    alias: ["bitek"]
}

