import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Economy from "../../systems/economy";
import { Prefix } from "../../settings.json";

class Daily implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = false;

    name = "daily";
    aliases = ["napi"];
    desc = "Napi bitek beszerzése.";
    usage = `${Prefix}daily`;

    /** @param message Discord message. */
    public async execute(message: Message) {
        return Economy.Daily(message.member).then((data) => {
            if(!data) return message.channel.send("Ma már megkaptad a napi biteidet, próbáld holnap.");

            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor("#78b159")
                .setTitle("Bits")
                .addFields([
                    { name: "Egyenleg", value: `\`\`\`${data.userData.bits} bits\`\`\``, inline: true },
                    { name: "Streak", value: `\`\`\`${data.userData.streak}. nap\`\`\``, inline: true }
                ]);

            if(data.streakDone) embed.addField("Bits Streak", `Jééj! ${Economy.DAILY_STREAK_BONUS} bónusz bitet kaptál!`);

            return message.channel.send("Sikeresen megszerezted a napi biteidet.", { embed: embed });
        });
    }
}

export default new Daily();