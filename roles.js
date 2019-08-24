module.exports.CheckModes = (message, command) => {
    if(command === "clearmodes") {
        message.member.removeRole('611691601990909953');
        message.member.removeRole('611682216648507544');
        message.channel.send("Cleared all modes.");
    } else if(command === `nsfwmode`) {
        message.member.addRole('611691601990909953');
        message.member.removeRole('611682216648507544');
        message.channel.send("Switched to nsfw mode.");
    } else if(command === `safemode`) {
        message.member.addRole('611682216648507544');
        message.member.removeRole('611691601990909953');
        message.channel.send("Switched to safe mode.");
    } else return false;
    return true;
}