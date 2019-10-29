const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    message.channel.send("Pong!");
}

module.exports.help = {
    cmd: "ping",
    alias: [],
    name: "Ping",
    desc: "Ping - Pong!",
    usage: ">ping",
    category: "user"
}