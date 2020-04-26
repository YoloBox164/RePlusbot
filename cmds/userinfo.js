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
    var roleArr = targetMember.roles.cache.array();
    roleArr.pop();
    var roles = roleArr.join(" | ");
    if(!roles) roles = "Nincsen rangja."

    var warnings = Database.prepare("SELECT * FROM warnings WHERE userid = ?;").all(targetMember.id);
    var warningStringArr = [];
    for(const {warning, time} of warnings) {
        warningStringArr.push(`'${warning}' (${bot.logDate(time)})`)
    }

    if(!warningStringArr[0]) warningStringArr[0] = "Nincs";

    var embed = new Discord.MessageEmbed()
        .setAuthor(targetMember.user.tag, targetMember.user.displayAvatarURL({format: "png", size: 4096}))
        .setThumbnail(targetMember.user.displayAvatarURL({format: "png", size: 4096}))
        .setTitle("Felhasználói információ:")
        .setColor(targetMember.displayHexColor)
        .setDescription(
            `**Név:** *${targetMember}*
            **Státusz:** \`${targetMember.presence.status.toUpperCase()}\`
            **Teljsen Felhasználói név:** *${targetMember.user.username}#${targetMember.user.discriminator}*
            **ID:** *${targetMember.id}*\n
            **Szerverre Csatlakozott:** *${bot.logDate(targetMember.joinedTimestamp)}*
            **Felhasználó létrehozva:** *${bot.logDate(targetMember.user.createdTimestamp)}*
            **Rangok:** *${roles}*\n
            **Figyelmeztetések:**
            ${warningStringArr.join('\n')}`
        );
    message.channel.send({embed: embed})
}

module.exports.help = {
    cmd: "userinfo",
    alias: ["user"],
    name: "Felhasználói információ",
    desc: "Iformáció a te profilodról vagy máséról.",
    usage: ">userinfo <felhasználó>",
    category: "felhasználói"
}