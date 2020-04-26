const colors = require('colors/safe');

const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(message.member == message.guild.member(bot.devId) || message.member.hasPermission("MANAGE_MESSAGES", {checkAdmin: true, checkOwner: true})) {
        var deleteCount = parseInt(args[0], 10);
        if(!deleteCount || (deleteCount < 1 || deleteCount > 101)) {
            message.reply("Kérlek adj meg egy számot 1 és 100 között.");
            return;
        }
        message.channel.bulkDelete(deleteCount + 1).catch(error => {
            message.channel.send(`Nem tudtam törölni. Hiba: ${error}`);
            return;
        });
    } else {
        message.channel.send("Nincs jogod hasznélni ezt a parancsot.");
        return; 
    }

    var logMsg = `${message.member.displayName} deleted ${deleteCount} messages in ${message.channel}`;
    
    if(message.guild == bot.mainGuild) bot.logChannel.send(logMsg);
    else bot.devLogChannel.send(logMsg);
    console.log(colors.yellow(`LOG: Deleted messages: ${deleteCount}`));
}
module.exports.help = {
    cmd: "purge",
    alias: ["clear"],
    name: "Üzenetek purgálása",
    desc: "Törölj üzeneteket 1 és 100 között.",
    usage: ">purge [1 - 100]",
    category: "moderátori"
}