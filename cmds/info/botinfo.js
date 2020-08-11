const Discord = require("discord.js");
const Tools = require("../../utils/tools");

module.exports = {
    /**
     * @async
     * @param {import("discord.js").Message} message Discord message.
     */
    execute: async (message) => {
        const msg = await message.channel.send("Generálás...");
        const bot = message.client;
        const embed = new Discord.MessageEmbed()
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

        message.channel.send({ embed: embed });
        msg.delete();
    },
    args: false,
    name: "botinfo",
    aliases: ["bot"],
    desc: "A botról elérhető információk.",
    usage: ">botinfo"
};