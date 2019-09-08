const Discord = require('discord.js');

const Functions = require('../functions.js');

module.exports.run = (bot, message, args) => {
    var target = Functions.GetTarget(message, args);
    var roles;
    if(!target.username) {
        roles = target.roles.array().slice(1).join(" | ");
        target = target.user;
    } else roles = message.guild.member(target.id).roles.array().slice(1).join(" | ");
    if(!roles) roles = "This user don't have any roles."

    var embed = new Discord.RichEmbed()
        .setAuthor(target.tag, target.displayAvatarURL)
        .setTitle("User information:")
        .setThumbnail(target.displayAvatarURL)
        .setColor(message.guild.member(target).displayHexColor)
        .setDescription(
            `**Name:** *${message.guild.member(target)}*
            **Status:** *${target.presence.status}*
            **Full Username:** *${target.username}#${target.discriminator}*
            **ID:** *${target.id}*\n
            **Joined to the Server At:** *${message.guild.members.get(target.id).joinedAt}*
            **User Created At:** *${target.createdAt}*
            **Roles:** *${roles}*`
        );
    message.channel.send({embed: embed})
}

module.exports.help = {
    cmd: "userinfo",
    alias: ["user"],
    name: "User information",
    desc: "Some information about your profile or others.",
    usage: ">userinfo <user>",
    category: "user"
}