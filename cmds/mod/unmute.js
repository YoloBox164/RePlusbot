const Discord = require('discord.js');

const Tools = require('../../utils/tools.js');
const Settings = require('../../settings.json');
const { MuteHandler } = require('../../sec-sys');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("MUTE_MEMBERS", true)) {
        message.channel.send("Nincsen jogod használni ezt a paracsot.");
        return;
    }
    if(!args[0]) {
        message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.help.usage}\``);
        return;
    }
    let target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, '');
    let target_member = message.guild.member(target_memberId);
    if(!target_member) {
        message.channel.send(`Nincs ilyen felhasználó.\`Segítség => ${this.help.usage}\``);
        return;
    }
    if(target_member.id == message.member.id) {
        message.channel.send("Magadról nem  veheted le a némítást.");
        return;
    }

    MuteHandler.Remove(target_member);
    message.channel.send("Sikeresen le szetted a némítást.");
}

module.exports.help = {
    cmd: "unmute",
    alias: ["visszanemit", "visszanémit"],
    name: "Unmute",
    desc: "Vedd le a némítást manuálisan egy felhasználóról.",
    usage: ">unmute [felhasználó elmítés]",
    category: "moderator"
}