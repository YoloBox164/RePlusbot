const Discord = require("discord.js");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     */
    execute: async (message) => {
        const msg = await message.channel.send("Generálás...");

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png", size: 4096 }))
            .setTitle("Szerver információ:")
            .setDescription(
                `**Szerver Név:** ${message.guild.name}
                **Szerver ID:** ${message.guild.id}\n
                **Tulajdonos:** ${message.guild.owner}
                **Tulajdonos Teljes Neve:** ${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}
                **Tulajdonos ID-ja:** ${message.guild.ownerID}\n
                **Létrehozva:** ${message.client.logDate(message.guild.createdTimestamp)}\n
                **Tagok Száma:** ${message.guild.members.cache.filter(m => !m.user.bot).size}
                **Botok Száma:** ${message.guild.members.cache.filter(m => m.user.bot).size}
                **Szobák száma:** ${message.guild.channels.cache.size}`
            )
            .setThumbnail(message.guild.iconURL({ format: "png", size: 4096 }))
            .setColor(message.guild.member(message.client.user.id).displayHexColor);

        message.channel.send({ embed: embed });
        msg.delete();
    },
    args: false,
    name: "serverinfo",
    aliases: ["server", "guild", "guildinfo"],
    desc: "Kiírja a szerverről való információkat.",
    usage: ">serverinfo"
};