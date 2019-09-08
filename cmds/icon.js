const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Getting server icon");

    var embed = new Discord.RichEmbed()
        .setTitle("Server Icon")
        .setDescription(`[Icon LINK](${message.guild.iconUrl})`)
        .setImage(message.guild.iconUrl)
        .setColor(message.member.displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "icon",
    alias: ["servericon", "ico"],
    name: "Server Icon",
    desc: "Shows the server's icon",
    usage: ">icon",
    category: "user"
}