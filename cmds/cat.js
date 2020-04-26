const Discord = require("discord.js");
const got = require('got');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Lekérés...");
    var link = `https://api.thecatapi.com/v1/images/search?mime_types=gif`;

    const response = await got(link);
    var data = JSON.parse(response.body);

    var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(`[LINK](${data[0].url})`)
        .setFooter("thecatapi.com")
        .setColor(message.guild.member(bot.user).displayHexColor)
        .setImage(data[0].url);

    await message.channel.send({embed: embed})
    msg.delete();
}

module.exports.help = {
    cmd: "cat",
    alias: ["cica", "kitty"],
    name: "Cica Gifek",
    desc: "Véletlenszerű cica gifek.",
    usage: ">cat",
    category: "felhasználói"
}