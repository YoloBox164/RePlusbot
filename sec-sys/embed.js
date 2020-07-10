const Discord = require('discord.js');

/**
 * @param {Discord.Message} message
 * @returns {Discord.MessageEmbed}
 */
module.exports.Get = (message, reason) => {
    let embed = new Discord.MessageEmbed()
        .setColor(Discord.Constants.Colors.RED)
        .setAuthor(message.author.tag, message.author.avatarURL({size: 4096, format: "png"}))
        .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
        .addField("Üzenet:", message.content)
        .addField("Törlés Oka:", reason)
        .setFooter(`USER_ID: ${message.author.id} • ${message.createdAt.toLocaleString()}`);
    return embed;
}