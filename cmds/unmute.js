const fs = require("fs");

const Functions = require('../functions.js');
const SETTINGS = require('../settings.json');
const MUTES = require('../mute.json');

module.exports.run = async (bot, message, args) => {
    if(Functions.MemberHasRoles(message.member, SETTINGS.StaffIds) && !message.member.hasPermission("MUTE_MEMBERS") && message.author.id !== bot.devId) {
        message.channel.send("You do not have the permission for this command!");
        return;
    }

    var target = Functions.GetMember(message, args);
    if(!target || target.id === message.author.id) {
        message.channel.send("User not found or it was not given. Help: \`" + this.help.usage + "\`")
    }

    if(target.highestRole.position >= message.member.highestRole.position) {
        message.channel.send("You cannot unmute a member who is higher or has the same role as you!");
        return;
    }


    var muteRole = message.guild.roles.find(r => r.id == `${SETTINGS.MuteRoleId}`);

    if(!muteRole || !target.roles.has(muteRole.id)) return message.channel.send(`${target.displayName} is not muted!`);
    muteRole.setPosition(message.guild.members.get(bot.user.id).highestRole.position - 1);

    await target.removeRole(muteRole).catch(console.error);

    delete MUTES[`${target.id}`];

    fs.writeFile("./mute.json", JSON.stringify(MUTES, null, 4), err => {
        if(err) throw err;
        message.channel.send(`I've unmuted ${target.displayName}!`);
    });
}

module.exports.help = {
    cmd: "unmute",
    alias: ["visszanemit", "visszanémit"],
    name: "Unmute",
    desc: "Text and Voice unmute a user.",
    usage: ">unmute [user]",
    category: "moderator"
}