const colors = require('colors/safe');

module.exports.run = async (bot, message, args) => {
    if(message.member == message.guild.members.get(bot.devId) || message.member.hasPermission("MANAGE_MESSAGES", {checkAdmin: true, checkOwner: true})) {
        var deleteCount = parseInt(args[0], 10);
        if(!deleteCount || (deleteCount < 1 || deleteCount > 101)) {
            message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
            return;
        }
        message.channel.bulkDelete(deleteCount + 1).catch(error => {
            message.channel.send(`Couldn't delete messages because of: ${error}`);
            return;
        });
    } else {
        message.channel.send("You don't have permission to use this command!");
        return; 
    }

    bot.loggingChannel.send(`${message.member.displayName} deleted ${deleteCount} messages in ${message.channel}`);
    console.log(colors.yellow(`LOG: Deleted messages: ${deleteCount}`));
}
module.exports.help = {
    cmd: "purge",
    alias: ["clear"],
    name: "Purge messages",
    desc: "Delete messages between 2 and 100. You must have the Manage Messages Permission to use this command!",
    usage: ">purge [2 - 100]",
    category: "moderator"
}