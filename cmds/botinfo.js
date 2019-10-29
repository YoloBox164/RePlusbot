const Discord = require("discord.js");

const Functions = require('../functions.js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generating...");

    var embed = new Discord.RichEmbed()
        .setAuthor(bot.user.username)
        .setTitle("Bot information:")
        .setDescription(
            `**Full Username:** *${bot.user.username}#${bot.user.discriminator}*
            **ID:** *${bot.user.id}*\n
            **Status:** *${bot.user.presence.status}*
            **Created At:** *${bot.user.createdAt}*\n
            **Creator:** *${message.guild.member("333324517730680842") || "CsiPA0723#0423"}*
            **Guild Count:** *${bot.guilds.size}*
            **Channel Count:** *${bot.channels.size}*
            **User Count:** *${bot.users.size}*\n
            **Uptime:** *${Functions.ParseMillisecondsIntoReadableTime(bot.uptime)}*`
        )
        .setThumbnail(bot.user.displayAvatarURL)
        .setColor(message.guild.member(bot.user).displayHexColor);

    message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "botinfo",
    alias: ["bot"],
    name: "Bot Information",
    desc: "List of information of the bot.",
    usage: ">botinfo",
    category: "user"
}