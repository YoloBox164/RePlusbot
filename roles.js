const Discord = require('discord.js');

/**
 * @param {Discord.Message} message
 * @param {string} command
 * @returns True or false
 */

module.exports.CheckModes = (message, command) => {
    if(command === "clearmodes") {
        message.member.removeRole(this.roles.nsfw);
        message.member.removeRole(this.roles.safe);
        message.member.addRole(this.roles.default);
        message.channel.send("Cleared all modes.");
    } else if(command === `nsfwmode`) {
        message.member.addRole(this.roles.nsfw);
        message.member.addRole(this.roles.default)
        message.member.removeRole(this.roles.safe);
        message.channel.send("Switched to nsfw mode.");
    } else if(command === `safemode`) {
        message.member.addRole(this.roles.safe);
        message.member.removeRole(this.roles.nsfw);
        message.member.removeRole(this.roles.default)
        message.channel.send("Switched to safe mode.");
    } else return false;
    return true;
}

module.exports.roles = {
    default: "611682388631617544",
    nsfw: "611691601990909953",
    safe: "611682216648507544"
}