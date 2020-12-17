import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import Economy from "../../systems/economy";
import { Prefix } from "../../settings.json";

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
        const cmds = await message.client.CommandHandler.commands;
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
                        value: `${cmds.get("daily").usage}\`\`\`md\n# ${cmds.get("daily").desc}\`\`\`
                            ${cmds.get("shop").usage}\`\`\`md\n# ${cmds.get("shop").desc}\`\`\`
                            ${cmds.get("send").usage}\`\`\`md\n# ${cmds.get("send").desc}\`\`\`
                            ──═══════════════════════──\n
                            ${cmds.get("add").usage}\`\`\`md\n# ${cmds.get("add").desc}\`\`\`
                            ${cmds.get("remove").usage}\`\`\`md\n# ${cmds.get("remove").desc}\`\`\``,
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