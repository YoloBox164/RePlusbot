import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import { Prefix } from "../../settings.json";

class BotInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "botinfo";
    aliases = ["bot"];
    desc = "A botról elérhető információk.";
    usage = `${Prefix}botinfo`;
    public async execute(message: Message) {
        const msg = await message.channel.send("Generálás...");
        const bot = message.client;
        const embed = new MessageEmbed()
            .setAuthor(bot.user.username)
            .setTitle("Bot information:")
            .setDescription(
                `**Tejles név:** *${bot.user.username}#${bot.user.discriminator}*
                **ID:** *${bot.user.id}*\n
                **Státusz:** *${bot.user.presence.status}*
                **Létrehozva:** *${bot.user.createdAt}*\n
                **Készítő:** *${message.guild.member("333324517730680842") || "CsiPA0723#0423"}*
                **Guildek száma:** *${bot.guilds.cache.size}*
                **Szobák száma:** *${bot.channels.cache.size}*
                **Felhasználók száma:** *${bot.users.cache.size}*\n
                **Futási idő:** *${Tools.ParseMillisecondsIntoReadableTime(bot.uptime)}*`
            )
            .setThumbnail(bot.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setColor(message.guild.member(bot.user).displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    }
}

export default new BotInfo();