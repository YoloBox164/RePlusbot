const Discord = require("discord.js");

const colors = require('colors/safe');
const SETTINGS = require('../settings.json');
const Database = require('../database');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
*/

module.exports.run = (bot, message, args) => {
    var code = args[0];

    if(code) {
        var inviteData = Database.GetData("invites", code);

        if(!inviteData && inviteData.code == code) {
            var inviterDb = Database.GetData("inviters", inviteData.inviter);
            inviterDb.invitedNumber += 1;
            Database.SetData(inviterDb);

            var invitedMember = Database.GetData("invitedMembers", message.author.id);
            invitedMember.inviter = inviteData.inviter;
            Database.SetData("invitedMembers", invitedMember);

            /** @type {Discord.TextChannel} */
            var logChannel = message.guild.channels.get(SETTINGS.modLogChannelId);
            var logMsg = `${message.member.displayName} (${message.member.id}) was invited by ${message.guild.members.get(inviteData.inviter).displayName} (${inviteData.inviter}) | \`${bot.logDate(member.joinedTimestamp)}\`.`;

            logChannel.send(logMsg);
            console.log(colors.yellow(logMsg.replace(/\`/g, "")));

            Database.DeleteData("invites", inviteData.id);

            message.member.addRole(SETTINGS.AutoMemberRoleId);

            var welcomeChannel = message.guild.channels.get(SETTINGS.welcomeMsgChannelId);
            welcomeChannel.send(`Üdv a szerveren ${message.member}, érezd jól magad!`);
        }
    }

    if(message.deletable) message.delete().catch(console.error);
}

module.exports.help = {
    cmd: "code",
    alias: [],
    name: "Code",
    desc: "Security system",
    usage: ">code [the code in the invite link after the /]",
    category: "user"
}