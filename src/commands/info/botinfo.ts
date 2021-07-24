import { Message, MessageEmbed } from "discord.js";
import { Duration } from "luxon";
import { Command } from "../../command-handler";
import { stripIndents } from "common-tags";

class BotInfo extends Command {
  public category = "Info";
  public args = [];
  public isDev = false;

  public name = "Botinfo";
  public aliases = ["bot"];
  public desc = "A botról elérhető információk.";

  constructor() {
    super();
    this.init();
  }

  public async run(message: Message) {
    const msg = await message.channel.send("Generálás...");
    const bot = message.client;
    const embed = new MessageEmbed()
      .setAuthor(bot.user.username)
      .setTitle("Bot information:")
      .setDescription(
        stripIndents`
          **Tejles név:** *${bot.user.username}#${bot.user.discriminator}*
          **ID:** *${bot.user.id}*\n
          **Státusz:** *${bot.user.presence.status}*
          **Létrehozva:** *${bot.user.createdAt}*\n
          **Készítő:** *${message.guild.member("333324517730680842") || "CsiPA0723#0423"}*
          **Guildek száma:** *${bot.guilds.cache.size}*
          **Szobák száma:** *${bot.channels.cache.size}*
          **Felhasználók száma:** *${bot.users.cache.size}*\n
          **Futási idő:** *${Duration.fromMillis(bot.uptime).toFormat("d nap | hh:mm:ss")}*
        `
      )
      .setThumbnail(bot.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
      .setColor(message.guild.member(bot.user).displayHexColor);

    message.channel.send({ embed: embed }).then(() => msg.delete());
  }
}

export default new BotInfo();
