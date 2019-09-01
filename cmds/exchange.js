const Discord = require("discord.js");
const got = require("got");
const api = "06b26c42ff1b069252795e80";

module.exports.run = async (bot, message, args) => {
    const isoCurrMap = await got("http://www.localeplanet.com/api/auto/currencymap.json", {json: true});

    var val = isNaN(args[0]) ? 1 : args[0];
    var fr, to;

    if(isNaN(args[0])) {
        if(args[0]) fr = args[0].toUpperCase();
        if(args[1]) to = args[1].toUpperCase();
    } else {
        if(args[1]) fr = args[1].toUpperCase();
        if(args[2]) to = args[2].toUpperCase();
    }
    
    if(!fr) fr = "EUR";
    if(!to) to = "HUF";

    var symbol = isoCurrMap.body[to].symbol_native;

    const res = await got(`https://v3.exchangerate-api.com/pair/${api}/${fr}/${to}`, {json: true});
    if(res.body.result == "failed") return message.channel.send(res.body.error);
    var msg = await message.channel.send("Exchanging...");
    const embed = new Discord.RichEmbed()
        .setThumbnail("https://www.exchangerate-api.com/img/logo-square.png")
        .setTitle(`${fr} to ${to}`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setColor(message.guild.member(bot.user).displayHexColor)
        .addField("Result:", `${res.body.rate * val} ${symbol}`);
    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "exchange",
    alias: ["change", "currency"],
    name: "Currency exchange",
    desc: "Currency exchange | using ISO 4217 currency codes (Like: HUF, EUR, USD, etc.)",
    usage: ">exchange <value> <from> <to>",
    category: "user"
}