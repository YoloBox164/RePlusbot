const Functions = require('../functions.js');
const database = require('../database.js');
const SETTINGS = require('../settings.json');
const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    if(Functions.MemberHasOneOfTheRoles(message.member, SETTINGS.StaffIds) && message.author.id !== bot.devId) {
        return message.channel.send("You do not have the permission for this command!");
    }

    if(args[0]) {
        var reason = args.slice(1).join(" ");
        var member = Functions.GetMember(message, args);
        var issuer = message.member;

        if(member.id == issuer.id && !bot.devId) {
            return message.channel.send("You can not issue a warning for yourself.");
        }

        var memberWarning = database.GetData('warnedUsers', member.id);
        if(!memberWarning.count) memberWarning.count = 1;
        else memberWarning.count += 1;
        database.SetData('warnedUsers', memberWarning);

        var warning = database.GetObjectTemplate('warnings', member.id);
        warning.warning = reason ? reason : "Not given.";
        warning.time = Date.now();
        database.SetData('warnings', warning);

        message.channel.send(`Warning successfuly issued for ${member}.\n**Reason**: '${reason}'.`);
        var logChannel = message.guild.channels.get(SETTINGS.modLogChannelId);
        logChannel.send(`\`Warn\`:\n**Name:** ${member.displayName} (${member.user.username})\n**Id:** ${member.id}\n**Reason:** ${reason}\n**Issued by:** ${issuer.displayName} (${issuer.user.username} | ${issuer.id})`);
        console.log(`Warn: ${member.displayName} (Id: ${member.id}) | by ${issuer.displayName} (Id: ${issuer.id})`);
    } else return message.channel.send(`User was not specified.\n\n\`HELP\` => \`${this.help.usage}\``);
}

module.exports.help = {
    cmd: "warn",
    alias: ["figyelmeztet"],
    name: "Warn",
    desc: "A simple warning system.",
    usage: ">warn [user] <Reason>",
    category: "staff"
}