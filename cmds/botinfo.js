const Discord = require("discord.js");

const Tools = require('../utils/tools.js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generálás...");

    var embed = new Discord.MessageEmbed()
        .setAuthor(bot.user.username)
        .setTitle("Bot information:")
        .setDescription(
            `**Tejles felhasználói név:** *${bot.user.username}#${bot.user.discriminator}*
            **ID:** *${bot.user.id}*\n
            **Státusz:** *${bot.user.presence.status}*
            **Létrehozva:** *${bot.user.createdAt}*\n
            **Készítő:** *${message.guild.member("333324517730680842") || "CsiPA0723#0423"}*
            **Guildek száma:** *${bot.guilds.cache.size}*
            **Szobák száma:** *${bot.channels.cache.size}*
            **Felhasználók száma:** *${bot.users.cache.size}*\n
            **Futási idő:** *${Tools.ParseMillisecondsIntoReadableTime(bot.uptime)}*`
        )
        .setThumbnail(bot.user.displayAvatarURL())
        .setColor(message.guild.member(bot.user).displayHexColor);

    message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "botinfo",
    alias: ["bot"],
    name: "Bot Információ",
    desc: "A botról elérhető információk.",
    usage: ">botinfo",
    category: "felhasználói"
}