const Functions = require('../functions.js');
const database = require('../database.js');
const SETTINGS = require('../settings.json');
const Discord = require('discord.js');
const analytic = require('../analytic-sys/analytic');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    if(Functions.MemberHasOneOfTheRoles(message.member, SETTINGS.StaffIds) && message.author.id != bot.devId) {
        return message.channel.send("Nincs jogod ehez a parancshoz.");
    }
    
    var member = Functions.GetMember(message, args, false);

    if(member) {
        var reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs";
        var issuer = message.member;

        if(member.id == issuer.id && !bot.devId) {
            return message.channel.send("Magadnak nem adhatsz figyelmeztetést.");
        }

        var memberWarning = database.GetData('warnedUsers', member.id);
        if(!memberWarning.count) memberWarning.count = 1;
        else memberWarning.count += 1;
        database.SetData('warnedUsers', memberWarning);

        var warning = database.GetObjectTemplate('warnings', member.id);
        warning.warning = reason;
        warning.time = Date.now();
        database.SetData('warnings', warning);

        var userData = analytic.GetUserData(member.id);
        userData.warnings.push({text: reason, time: warning.time});
        analytic.WriteUserData(member.id, userData);

        message.channel.send(`${member} figyelmeztetve lett.\n**Figyelmeztetés Oka**: '${reason}'.`);
        /**@type {Discord.TextChannel} */
        var logChannel = bot.logChannel;

        var logMsg = `\`Figyelmeztetés\`:
            **Név:** ${member.displayName} (${member.user.tag} | ${member.id})
            **Id:** ${member.id}
            **Oka:** ${reason}
            **Adó:** ${issuer.displayName} (${issuer.user.tag} | ${issuer.id})`;

        var conLogMsg = `Warn: ${member.displayName} (Id: ${member.id}) | by ${issuer.displayName} (Id: ${issuer.id})`;

        logChannel.send(logMsg.replace('\t', ''));
        console.log(conLogMsg);
    } else return message.channel.send(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => \`${this.help.usage}\``);
}

module.exports.help = {
    cmd: "warn",
    alias: ["figyelmeztet"],
    name: "Figyelmeztetés",
    desc: "Egy egyszerű figyelmeztető rendszer",
    usage: ">warn [felhasználó] <Figyelmeztetés oka>",
    category: "staff"
}