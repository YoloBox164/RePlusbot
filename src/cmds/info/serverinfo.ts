import BaseCommand from "../../structures/base-command";
import { Message, MessageEmbed } from "discord.js";
import { Prefix } from "../../settings.json";

class ServerInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "serverinfo";
    aliases = ["server", "guild", "guildinfo"];
    desc = "Kiírja a szerverről való információkat.";
    usage = `${Prefix}serverinfo`;
    
    public async execute(message: Message) {
        const msg = await message.channel.send("Generálás...");
        const guild = message.guild;
        const explicitLeves = {
            DISABLED: "Kikapcsolva",
            MEMBERS_WITHOUT_ROLES: "Rang nélkülieknek",
            ALL_MEMBERS: "Mindenkinek"
        };
        const verificationLevel = {
            NONE: "Nincs",
            LOW: "Ellenőrzött e-mail",
            MEDIUM: "Ellenőrzött e-mail, 5 percnél tovább van beregisztrálva a Discordra",
            HIGH: "Ellenőrzött e-mail, 5 percnél tovább van beregisztrálva a Discordra, 10 perce tagja a szervernek",
            VERY_HIGH: "Ellenőrzött e-mail, 5 percnél tovább van be regisztálva a Discordra, 10 perce tagja a szervernek, Telefonos duplalépcsős belépés"
        };
        const embed = new MessageEmbed()
            .setTitle("Szerver információk")
            .setThumbnail(guild.iconURL({ format: "png", size: 4096 }))
            .addFields([
                { name: "Szerver Név", value: `\`\`\`${guild.name}\`\`\``, inline: true },
                { name: "Szerver ID", value: `\`\`\`xl\n${guild.id}\`\`\``, inline: true },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Képek ellenőrzése", value: `\`\`\`${explicitLeves[guild.explicitContentFilter]}\`\`\``, inline: true },
                { name: "Régió", value: `\`\`\`${guild.region}\`\`\``, inline: true },
                { name: "Ellenőrzési Szint", value: `\`\`\`${verificationLevel[guild.verificationLevel]}\`\`\``, inline: false },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Tulajdonos", value: `${guild.owner}`, inline: false },
                { name: "Tulajdonos Tag-je", value: `\`\`\`${guild.owner.user.tag}\`\`\``, inline: true },
                { name: "Tulajdonos ID-ja", value: `\`\`\`xl\n${guild.ownerID}\`\`\``, inline: true },
                { name: "\u200b", value: "\u200b", inline: false },
                { name: "Létrehozva", value: message.client.logDate(guild.createdTimestamp), inline: false },
                { name: "Tagok Száma", value: guild.members.cache.filter(m => !m.user.bot).size, inline: true },
                { name: "Botok Száma", value: guild.members.cache.filter(m => m.user.bot).size, inline: true },
                { name: "Szobák száma", value: guild.channels.cache.size, inline: true }
            ])
            .setTimestamp(Date.now())
            .setColor(guild.member(message.client.user.id).displayHexColor);

        return message.channel.send({ embed: embed }).then(() => msg.delete());
    };

}

export default new ServerInfo();