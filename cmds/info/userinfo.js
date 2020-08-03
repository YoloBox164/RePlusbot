const Discord = require('discord.js');
const { SQLiteDB }  = require('../../database');
const Tools = require('../../utils/tools.js');
const analytic = require('../../analytic-sys');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    const targetMember = Tools.GetMember(message, args);
    let roleArr = targetMember.roles.cache.array();
    roleArr.pop();
    let roles = roleArr.join(" | ");
    if(!roles) roles = "Nincsen rangja."

    const warnings = SQLiteDB.prepare("SELECT * FROM warnings WHERE userid = ?;").all(targetMember.id);
    let warningStringArr = [];
    for(const {warning, time} of warnings) {
        warningStringArr.push(`'${warning}' (${bot.logDate(time)})`)
    }

    const userData = analytic.GetUserData(targetMember.id);

    let voiceChanelsStats = [];

    for (const channelId in userData.voiceChannels) {
        if (userData.voiceChannels.hasOwnProperty(channelId)) {
            const channelData = userData.voiceChannels[channelId];
            /** @type {Discord.VoiceChannel} */
            const channel = bot.channels.resolve(channelData.id);
            voiceChanelsStats.push(`${channel.name}: ${Tools.RedableTime(channelData.time)}`);
        }
    }

    //let textChanelsStats = [];

    if(!warningStringArr[0]) warningStringArr[0] = "Nincs";

    const embed = new Discord.MessageEmbed()
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
        ).addField("Statok", 
            `Összes elküldött üzenet: ${userData.stats.messages}
            Parancs használatok száma: ${userData.stats.commandUses}
            
            Hangszobákban töltött idő: ${Tools.RedableTime(userData.stats.allTime)}
            
            Hangszobák:\n\t${voiceChanelsStats.join("\n\t")}`
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