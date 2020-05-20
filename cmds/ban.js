const Discord = require("discord.js");

const Functions = require('../functions.js');
const Settings = require('../settings.json');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(!Functions.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("BAN_MEMBERS", true)) {
        message.channel.send("Nincsen jogod használni ezt a paracsot.");
        return;
    }
    var target_member = Functions.GetMember(message, args, false);
    if(target_member.id == message.member.id) {
        message.channel.send("Magadat nem tilthatod ki!");
        return;
    }
    var reason = args.slice(1).join(" ");
    if(!reason) reason = "Nincs.";
    if(target_member.bannable) target_member.ban({reason: reason});
    else message.channel.send("Nem tudod kitiltani ezt a felhasználót.");
}

module.exports.help = {
    cmd: "ban",
    alias: ["kitilt", "kitiltas"],
    name: "Kitiltás (Banhammer)",
    desc: "A Botnak a saját ban parancsa.",
    usage: ">ban [felhasználó] <kitiltás oka>",
    category: "moderálás"
}