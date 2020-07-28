const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generálás...");

    var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL({format: "png", size: 4096}))
        .setTitle("Szerver információ:")
        .setDescription(
            `**Szerver Név:** ${message.guild.name}
            **Szerver ID:** ${message.guild.id}\n
            **Tulajdonos:** ${message.guild.owner}
            **Tulajdonos Teljes Neve:** ${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}
            **Tulajdonos ID-ja:** ${message.guild.ownerID}\n
            **Létrehozva:** ${bot.logDate(message.guild.createdTimestamp)}\n
            **Tagok Száma:** ${message.guild.members.cache.filter(m => !m.user.bot).size}
            **Botok Száma:** ${message.guild.members.cache.filter(m => m.user.bot).size}
            **Szobák száma:** ${message.guild.channels.cache.size}`
        )
        .setThumbnail(message.guild.iconURL({format: "png", size: 4096}))
        .setColor(message.guild.member(bot.user.id).displayHexColor);

    message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "serverinfo",
    alias: ["server", "guild", "guildinfo"],
    name: "Szerver Információ",
    desc: "Kiírja a szerverről való információkat.",
    usage: ">serverinfo",
    category: "felhasználói"
}