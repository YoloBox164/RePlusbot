import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Economy from "../../systems/economy";
import { Prefix } from "../../settings.json";
import Add from "./add";
import Daily from "./daily";
import Remove from "./remove";
import Send from "./send";
import Shop from "./shop";

class Bits implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "bits";
    aliases = ["bit", "bitek"];
    desc = "Ez a szerver pénz típusa. Szerezhetsz napi biteket, küldhetsz másoknak vagy vásárolhatsz különbféle dolgokat.";
    usage = `${Prefix}bits`;

    /** @param message Discord message. */
    public async execute(message: Message) {
        return Economy.GetInfo(message.member).then(userData => {
            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor("#78b159")
                .setTitle("Bits")
                .addFields([
                    { name: "Egyenleg", value: `\`\`\`${userData.bits} bits\`\`\``, inline: true },
                    { name: "Streak", value: `\`\`\`${userData.streak}. nap\`\`\``, inline: true },
                    {
                        name: "Parancsok",
                        value: `${Daily.usage}\`\`\`md\n# ${Daily.desc}\`\`\`
                            ${Shop.usage}\`\`\`md\n# ${Shop.desc}\`\`\`
                            ${Send.usage}\`\`\`md\n# ${Send.desc}\`\`\`
                            ──═══════════════════════──\n
                            ${Add.usage}\`\`\`md\n# ${Add.desc}\`\`\`
                            ${Remove.usage}\`\`\`md\n# ${Remove.desc}\`\`\``,
                        inline: false
                    },
                    {
                        name: "Bits Streak",
                        value: `Szerezd meg a napi biteidet 5 napon keresztűl és kapni fogsz bónusz ${Economy.DAILY_STREAK_BONUS} Bitet!`,
                        inline: false
                    }
                ]);
            return message.channel.send(embed);
        });
    }
}

export default new Bits();