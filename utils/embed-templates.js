const Discord = require("discord.js");


module.exports = {
    /**
     * Use this for logging warns.
     * @param {Discord.Message} message
     * @param {Discord.GuildMember} targetMember
     * @param {Discord.GuildMember} issuer
     * @param {string} reason
     * @returns {Discord.MessageEmbed}
     */
    Warning: (message, targetMember, issuer, reason) => {
        const embed = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .setTitle("Figyelmeztetés")
            .addField("Név:", `${targetMember.displayName} (${targetMember.user.tag})`)
            .addField("Id:", `${targetMember.id}`)
            .addField("Oka:", `${reason}`)
            .addField("Adó:", `${issuer.displayName} (${issuer.user.tag} | ${issuer.id})`)
            .setFooter(`${message.createdAt.toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for logging spamming that got deleted by the auto mod.
     * @param {Discord.Message} message
     * @param {string} reason
     * @returns {Discord.MessageEmbed}
     */
    SpamDelete: (message, reason) => {
        const embed = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.avatarURL({ size: 4096, format: "png" }))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id} • ${message.createdAt.toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for logging messages that got deleted by the auto mod.
     * @param {Discord.Message} message
     * @param {string} reason
     * @returns {Discord.MessageEmbed}
     */
    MsgDelete: (message, reason) => {
        console.log(global.mainGuild);
        const embed = new Discord.MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.avatarURL({ size: 4096, format: "png" }))
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
        const embed = new Discord.MessageEmbed()
            .setAuthor(guild.owner.displayName, guild.owner.user.avatarURL)
            .setTitle("Üdv a szerveren!")
            .setThumbnail(guild.iconURL({ size: 4096, format: "jpg" }))
            .setDescription(`${member} érezd jól magad!`);
        return embed;
    },
    /**
     * Use this for the member join requests.
     * @param {Discord.Message} message
     * @returns {Discord.MessageEmbed}
     */
    JoinRequest: (message) => {
        const embed = new Discord.MessageEmbed()
            .setColor("AQUA")
            .setAuthor(message.author.tag, message.author.avatarURL({ size: 4096, format: "png" }))
            .setDescription(`${message.member} szeretne csatlakozni a közösségünkbe!`)
            .addField("Üzenet:", message.content)
            .addField("URL:", message.url)
            .setFooter(`USER_ID: ${message.author.id} • ${message.createdAt.toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for logging errors.
     * @param {string} code
     * @returns {Discord.MessageEmbed}
     */
    Error: (code) => {
        const embed = new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("ERROR")
            .setDescription(code)
            .setFooter(`${new Date().toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for logging getting online.
     * @param {string} mode
     * @returns {Discord.MessageEmbed}
     */
    Online: (mode) => {
        const embed = new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle("Online")
            .setDescription(mode)
            .setFooter(`${new Date().toLocaleString()}`);
        return embed;
    },
    /**
     * Use this for logging getting online.
     * @param {string} mode
     * @returns {Discord.MessageEmbed}
     */
    Shutdown: (mode) => {
        const embed = new Discord.MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Shutting Down")
            .setDescription(mode)
            .setFooter(`${new Date().toLocaleString()}`);
        return embed;
    }
};