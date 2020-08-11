const Discord = require("discord.js");
const { SQLiteDB } = require("../../database");
const Tools = require("../../utils/tools");
const analytic = require("../../analytic-sys");

module.exports = {
    /**
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        const targetMember = Tools.GetMember(message, args);
        const roleArr = targetMember.roles.cache.array();
        roleArr.pop();
        let roles = roleArr.join(" | ");
        if(!roles) roles = "Nincsen rangja.";

        const warnings = SQLiteDB.prepare("SELECT * FROM warnings WHERE userid = ?;").all(targetMember.id);
        const warningStringArr = [];
        for(const { warning, time } of warnings) {
            warningStringArr.push(`'${warning}' (${message.client.logDate(time)})`);
        }

        const userData = analytic.GetUserData(targetMember.id);

        if(!warningStringArr[0]) warningStringArr[0] = "Nincs";

        const embed = new Discord.MessageEmbed()
            .setAuthor(targetMember.user.tag, targetMember.user.displayAvatarURL({ format: "png", size: 4096 }))
            .setThumbnail(targetMember.user.displayAvatarURL({ format: "png", size: 4096 }))
            .setTitle("Felhasználói információ:")
            .setColor(targetMember.displayHexColor)
            .setDescription(
                `**Név:** *${targetMember}*
                **Státusz:** \`${targetMember.presence.status.toUpperCase()}\`
                **Teljsen Felhasználói név:** *${targetMember.user.username}#${targetMember.user.discriminator}*
                **ID:** *${targetMember.id}*\n
                **Szerverre Csatlakozott:** *${message.client.logDate(targetMember.joinedTimestamp)}*
                **Felhasználó létrehozva:** *${message.client.logDate(targetMember.user.createdTimestamp)}*
                **Rangok:** *${roles}*\n
                **Figyelmeztetések:**
                ${warningStringArr.join("\n")}`
            ).addField("Statok",
                `Összes elküldött üzenet: ${userData.stats.messages}
                Parancs használatok száma: ${userData.stats.commandUses}
                
                Hangszobákban töltött idő: ${Tools.RedableTime(userData.stats.allTime)}`
            );
        message.channel.send({ embed: embed });
    },
    args: true,
    name: "userinfo",
    aliases: ["user"],
    desc: "Iformáció a te profilodról vagy máséról.",
    usage: ">userinfo <felhasználó>"
};