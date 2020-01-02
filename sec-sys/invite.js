const SETTINGS = require('../settings.json');
const Database = require('../database');

const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    var inviteChannel = message.guild.channels.get(SETTINGS.inviteChannelId);

    inviteChannel.createInvite({ temporary: true, maxUses: 1 }, "Bot created invite.").then(invite => {
        var invites = Database.GetData("invites", invite.code);
        invites.inviter = message.author.id;
        invites.code = invite.code;
        Database.SetData("invites", invites);
        message.author.send(invite.url);
    }).catch(console.error);
}

module.exports.help = {
    cmd: "invite",
    alias: ["inv", "meghívó", "meghivo"],
    name: "Server Invite",
    desc: "Generates a one use invite. For",
    usage: ">invite",
    category: "user"
}