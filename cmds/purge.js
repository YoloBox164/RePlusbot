const colors = require('colors/safe');

module.exports.run = async (bot, message, args) => {
    if(message.member == message.guild.members.get("333324517730680842") || message.member.hasPermission("MANAGE_MESSAGES", {checkAdmin: true, checkOwner: true})) {
        var deleteCount = parseInt(args[0], 10);
        if(!deleteCount || (deleteCount < 0 || deleteCount > 101)) {
            message.reply("Please provide a number between 1 and 100 for the number of messages to delete");
            return;
        }
        message.channel.bulkDelete(deleteCount + 1).catch(error => {
            message.reply(`Couldn't delete messages because of: ${error}`);
            return;
        });
    } else {
        message.channel.send("You don't have permission to use this command!");
        return; 
    }
    console.log(colors.yellow(`LOG: Deleted messages: ${deleteCount}`));
}
module.exports.help = {
    cmd: "purge",
    name: "Purge messages",
    desc: "Delete messages between 1 and 100. You must have the Manage Messages Permission to use this command!",
    usage: "%prefix%purge [1 - 100]",
    category: "moderator"
}