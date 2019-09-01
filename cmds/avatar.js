const Discord = require("discord.js");

const functions = require('../functions.js');

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generating avatar...");
    var target = functions.GetTarget(message, args);

    if(!target.username) target = target.user;

    var embed = new Discord.RichEmbed()
        .setTitle(`${message.guild.member(target).displayName}'s avatar`)
        .setDescription(`[Avatar LINK](${target.displayAvatarURL})`)
        .setImage(target.displayAvatarURL)
        .setColor(message.guild.member(target).displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "avatar",
    alias: [],
    name: "Avatar Icon",
    desc: "",
    usage: "",
    category: ""
}