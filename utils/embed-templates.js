const Discord = require('discord.js');


module.exports = {
    /**
     * Use this for logging messages that got deleted by the auto mod.
     * @param {Discord.Message} message
     * @param {string} reason
     * @returns {Discord.MessageEmbed}
     */
    LogMsgDelete: (message, reason) => {
        let embed = new Discord.MessageEmbed()
            .setColor(Discord.Constants.Colors.RED)
            .setAuthor(message.author.tag, message.author.avatarURL({size: 4096, format: "png"}))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Üzenet:", message.content)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id} • ${message.createdAt.toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for the member joins.
     * @param {Discord.Guild} guild
     * @param {Discord.GuildMember} member
     * @returns {Discord.MessageEmbed}
     */
    Join: (guild, member) => {
        let embed = new Discord.MessageEmbed()
            .setAuthor(guild.owner.displayName, guild.owner.user.avatarURL)
            .setTitle("Üdv a szerveren!")
            .setThumbnail(guild.iconURL({size: 4096, format: "jpg"}))
            .setDescription(`${member} érezd jól magad!`);
        return embed;
    },
    /**
     * Use this for the member join requests.
     * @param {Discord.Message} message
     * @returns {Discord.MessageEmbed}
     */
    JoinRequest: (message) => {
        let embed = new Discord.MessageEmbed()
            .setColor(Discord.Constants.Colors.AQUA)
            .setAuthor(message.author.tag, message.author.avatarURL({size: 4096, format: "png"}))
            .setDescription(`${message.member} szeretne csatlakozni a közösségünkbe!`)
            .addField("Üzenet:", message.content)
            .addField("URL:", message.url)
            .setFooter(`USER_ID: ${message.author.id} • ${message.createdAt.toLocaleString()}`);
        return embed;
    },
}