const Discord = require('discord.js');
const { Database } = require('../database.js');
const Functions = require('../functions.js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    var targetMember = Functions.GetMember(message, args);
    var roles = targetMember.roles.array().slice(1).join(" | ");
    if(!roles) roles = "This user don't have any roles."

    var warnings = Database.prepare("SELECT * FROM warnings WHERE userid = ?;").all(targetMember.id);
    var warningStringArr = [];
    for(const {warning, time} of warnings) {
        warningStringArr.push(`'${warning}' (${bot.logDate(time)})`)
    }

    if(!warningStringArr[0]) warningStringArr[0] = "None";

    var embed = new Discord.RichEmbed()
        .setAuthor(targetMember.user.tag, targetMember.user.displayAvatarURL)
        .setThumbnail(targetMember.user.displayAvatarURL)
        .setTitle("User information:")
        .setColor(targetMember.displayHexColor)
        .setDescription(
            `**Name:** *${targetMember}*
            **Status:** \`${targetMember.presence.status.toUpperCase()}\`
            **Full Username:** *${targetMember.user.username}#${targetMember.user.discriminator}*
            **ID:** *${targetMember.id}*\n
            **Joined to the Server At:** *${bot.logDate(targetMember.joinedTimestamp)}*
            **User Created At:** *${bot.logDate(targetMember.user.createdTimestamp)}*
            **Roles:** *${roles}*\n
            **Warnings:**
            ${warningStringArr.join('\n')}`
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