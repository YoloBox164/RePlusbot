const Discord = require("discord.js");

const Functions = require('../functions.js');
const Settings = require('../settings.json');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(!Functions.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("KICK_MEMBERS", true)) {
        message.channel.send("Nincsen jogod használni ezt a paracsot.");
        return;
    }
    var target_member = Functions.GetMember(message, args, false);
    if(target_member.id == message.member.id) {
        message.channel.send("Magadat nem rúghatod ki!");
        return;
    }
    var reason = args.slice(1).join(" ");
    if(!reason) reason = "Nincs.";
    if(target_member.kickable) target_member.kick(reason);
    else message.channel.send("Nem tudod kirúgni ezt a felhasználót.");
}

module.exports.help = {
    cmd: "kick",
    alias: ["kirug", "kirugas"],
    name: "Kirúgás",
    desc: "A Botnak a saját kick parancsa.",
    usage: ">kick [felhasználó] <kirúgás oka>",
    category: "moderálás"
}