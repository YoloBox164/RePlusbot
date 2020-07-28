const Discord = require('discord.js');
const { Database }  = require('../../database');
const Tools = require('../../utils/tools.js');
const analytic = require('../../analytic-sys');
const analyticDatabase = require('../../analytic-sys/database');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    var targetMember = Tools.GetMember(message, args);
    var roleArr = targetMember.roles.cache.array();
    roleArr.pop();
    var roles = roleArr.join(" | ");
    if(!roles) roles = "Nincsen rangja."

    var warnings = Database.prepare("SELECT * FROM warnings WHERE userid = ?;").all(targetMember.id);
    var warningStringArr = [];
    for(const {warning, time} of warnings) {
        warningStringArr.push(`'${warning}' (${bot.logDate(time)})`)
    }

    // var userData = analytic.GetUserData(targetMember.id);
    // var userLogs = analyticDatabase.GetData(targetMember.id);

    /* PerDay Logic */
    // var pastDays = (userLogs[userLogs.length - 1].timestampt - userLogs[0].timestampt) / 1000 / 60 / 60 / 24;
    // userData.stats.perDay = userData.stats.allTime / pastDays;
    /*--------------*/
    
    /* Activity Hours Logic */

    // var days = [];
    // var currDate = new Date(userLogs[0].timestampt);
    // var oneDay = [];
    // userLogs.forEach(log => {
    //     if(currDate.getDay == new Date(log.timestampt).getDay) {
    //         oneDay.push(log);
    //     } else {
    //         currDate = new Date(log.timestampt);
    //         days.push(oneDay);
    //         oneDay = [];
    //     }
    // });
    // console.log(days);

    /*----------------------*/

    /* Stream Time Logic */
    
    /*--------------*/

    // analytic.WriteUserData(targetMember.id, userData);

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
        )/*.addField("Statok", 
            `Utolsó Szóba: `
        )*/;
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