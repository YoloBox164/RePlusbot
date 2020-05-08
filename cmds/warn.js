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
    if(!Functions.MemberHasOneOfTheRoles(message.member, SETTINGS.StaffIds) && message.author.id != bot.devId) {
        return message.channel.send("Nincs jogod ehez a parancshoz.");
    }
    
    var targetMember = Functions.GetMember(message, args, false);

    if(targetMember) {
        var reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs";
        var issuer = message.member;

        if(targetMember.id == issuer.id && !bot.devId) {
            return message.channel.send("Magadnak nem adhatsz figyelmeztetést.");
        }

        var memberWarning = database.GetData('warnedUsers', targetMember.id);
        if(!memberWarning.count) memberWarning.count = 1;
        else memberWarning.count += 1;
        database.SetData('warnedUsers', memberWarning);

        var warning = database.GetObjectTemplate('warnings', targetMember.id);
        warning.warning = reason;
        warning.time = Date.now();
        database.SetData('warnings', warning);

        var userData = analytic.GetUserData(targetMember.id);
        userData.warnings.push({text: reason, time: warning.time});
        analytic.WriteUserData(targetMember.id, userData);

        message.channel.send(`${targetMember} figyelmeztetve lett.\n**Figyelmeztetés Oka**: '${reason}'.`);
        /**@type {Discord.TextChannel} */
        var logChannel = bot.logChannel;

        var logMsg = `\`Figyelmeztetés\`:
            **Név:** ${targetMember.displayName} (${targetMember.user.tag})
            **Id:** ${targetMember.id}
            **Oka:** ${reason}
            **Adó:** ${issuer.displayName} (${issuer.user.tag} | ${issuer.id})`;

        var conLogMsg = `Warn: ${targetMember.displayName} (Id: ${targetMember.id}) | by ${issuer.displayName} (Id: ${issuer.id})`;

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