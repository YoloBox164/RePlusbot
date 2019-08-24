const Discord = require("discord.js");
const api = "11720920-63b2-4eee-b141-f3304d747772";

const got = require('got');

module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("Fetching...");
    var link = `https://api.thedogapi.com/v1/images/search?mime_types=gif`;

    const response = await got(link);
    var data = JSON.parse(response.body);

    let embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setDescription(`${data[0].url}\n`)
        .setFooter("thedogapi.com")
        .setColor(message.guild.member(bot.user).displayHexColor)
        .setImage(data[0].url);
    
    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "dog",
    name: "Dog Pictures",
    desc: "A random dog jpeg",
    usage: "%prefix%dog",
    category: "user"
}