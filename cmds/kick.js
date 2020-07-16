const Discord = require("discord.js");

const Tools = require('../utils/tools.js');
const Settings = require('../settings.json');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("KICK_MEMBERS", true)) {
        message.channel.send("Nincsen jogod használni ezt a paracsot.");
        return;
    }
    let target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, '');
    let target_member = message.guild.member(target_memberId);
    if(!target_member) {
        message.channel.send(`Nincs ilyen felhasználó vagy nem lett meg adva.\`Segítség => ${this.help.usage}\``);
        return;
    }
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
    usage: ">kick [felhasználó tag-je] <kirúgás oka>",
    category: "moderálás"
}