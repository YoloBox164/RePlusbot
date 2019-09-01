const Discord = require("discord.js");
const got = require('got');

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Fetching...");
    var link = `https://api.thecatapi.com/v1/images/search?mime_types=gif`;

    const response = await got(link);
    var data = JSON.parse(response.body);

    var embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setDescription(`${data[0].url}`)
        .setFooter("thecatapi.com")
        .setColor(message.guild.member(bot.user).displayHexColor)
        .setImage(data[0].url);

    await message.channel.send({embed: embed})
    msg.delete();
}

module.exports.help = {
    cmd: "cat",
    alias: ["cica", "kitty"],
    name: "Cat Gifs",
    desc: "A random kitty gif.",
    usage: "%prefix%cat",
    category: "user"
}