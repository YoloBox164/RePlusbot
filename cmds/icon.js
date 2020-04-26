const Discord = require("discord.js");

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Szerver ikon lehívása...");

    var embed = new Discord.MessageEmbed()
        .setTitle("Szerver Ikon")
        .setDescription(`[Ikon LINK](${message.guild.iconURL({format: "png", size: 4096})})`)
        .setImage(message.guild.iconURL({format: "png", size: 4096}))
        .setColor(message.member.displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "icon",
    alias: ["servericon", "ico"],
    name: "Szerver Ikon",
    desc: "Megjeleníti a szerver ikont.",
    usage: ">icon",
    category: "felhasználói"
}