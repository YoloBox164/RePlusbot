const Discord = require("discord.js");
const Database = require("../../database");
const Tools = require("../../utils/tools");
const XpSys = require("../../xp-sys");

module.exports = {
    /**
     * @async
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        const targetMember = Tools.GetMember(message, args);
        const roleArr = targetMember.roles.cache.array();
        roleArr.pop();
        let roles = roleArr.join(" | ");
        if(!roles) roles = "Nincsen rangja.";

        Database.Connection.query("SELECT * FROM Warnings WHERE userid = ?;", [targetMember.id]).then(async warnings => {
            const warningStringArr = [];
            for(const { warning, time } of warnings) {
                warningStringArr.push(`'${warning}' (${message.client.logDate(time)})`);
            }

            const userData = await Database.GetData("Users", targetMember.id);

            if(!warningStringArr[0]) warningStringArr[0] = "Nincs";

            const attach = new Discord.MessageAttachment(await XpSys.GetCanvas(userData, targetMember), "exp.png");

            const avatarURL = targetMember.user.displayAvatarURL({ format: "png", size: 4096 });
            const embed = new Discord.MessageEmbed()
                .setAuthor(targetMember.user.tag, avatarURL)
                .setThumbnail(avatarURL)
                .setTitle("Felhasználói információ:")
                .setColor(targetMember.displayHexColor)
                .setImage("attachment://exp.png")
                .attachFiles(attach)
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
                    `Összes elküldött üzenet: ${userData.messages}
                    Parancs használatok száma: ${userData.commandUses}
                    
                    Hangszobákban töltött idő: ${Tools.RedableTime(userData.allTime)}`
                );
            message.channel.send({ embed: embed });
        });
    },
    args: true,
    name: "userinfo",
    aliases: ["user"],
    desc: "Iformáció a te profilodról vagy máséról.",
    usage: ">userinfo <felhasználó>"
};