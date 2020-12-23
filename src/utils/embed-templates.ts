import { Message, Guild, GuildMember, MessageEmbed, Client } from "discord.js";
import BaseCommand from "../structures/base-command";
import Settings from "../settings.json";

export default {
    Warning: (targetMember: GuildMember, issuer: GuildMember, reason: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setTitle("Figyelmeztetés")
            .addField("Név:", `${targetMember.displayName} (${targetMember.user.tag})`)
            .addField("Id:", `${targetMember.id}`)
            .addField("Oka:", `${reason}`)
            .addField("Adó:", `${issuer.displayName} (${issuer.user.tag} | ${issuer.id})`)
            .setTimestamp(Date.now());
        return embed;
    },

    SpamDelete: (message: Message, reason: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(Date.now());
        return embed;
    },

    MsgDelete: (message: Message, reason: string, foundTexts?: string[]): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("ORANGE")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`**${message.member} üzenete törölve a ${message.channel} szobából.**`)
            .addField("Üzenet:", message.content)
            .addField("Törlés Oka:", reason)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(Date.now());

        if(foundTexts && foundTexts[0]) {
            embed.addField("Talált szavak/linkek", foundTexts.join(", "));
        }
        
        return embed;
    },

    Join: (guild: Guild, member: GuildMember): MessageEmbed => {
        const embed = new MessageEmbed()
            .setAuthor(guild.owner.displayName, guild.owner.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setTitle("Üdv a szerveren!")
            .setThumbnail(guild.iconURL({ size: 4096, format: "jpg" }))
            .setDescription(`${member} érezd jól magad!`)
            .setTimestamp(member.joinedAt);
        return embed;
    },

    JoinRequest: (message: Message): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("AQUA")
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
            .setDescription(`${message.member} szeretne csatlakozni a közösségünkbe!`)
            .addField("Üzenet:", message.content)
            .addField("URL:", message.url)
            .setFooter(`USER_ID: ${message.author.id}`)
            .setTimestamp(message.createdAt);
        return embed;
    },

    Error: (code: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("RED")
            .setTitle("ERROR")
            .setDescription(code)
            .setTimestamp(Date.now());
        return embed;
    },

    Cmd: {
        ArgErr: (client: Client, cmd: BaseCommand): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription("```Hiányos parancs```")
                .addFields([
                    { name: "Segítsgég", value: `\`\`\`md\n${cmd.usage}\`\`\``, inline: false },
                    { name: "További segítségért írd", value: `\`\`\`md\n${Settings.Prefix}help ${cmd.name}\`\`\``, inline: true },
                ]).setFooter(`Hiba esetén kérlek értesísd készítőmet! ${client.users.resolve(client.devId).tag}`);
            return embed;
        },

        ArgErrCustom: (client: Client, desc: string, cmd: BaseCommand): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("RED")
                .setTitle("Hiba")
                .setDescription(`\`\`\`${desc}\`\`\``)
                .addFields([
                    { name: "Segítsgég", value: `\`\`\`md\n${cmd.usage}\`\`\``, inline: false },
                    { name: "További segítségért írd", value: `\`\`\`md\n${Settings.Prefix}help ${cmd.name}\`\`\``, inline: true },
                ]).setFooter(`Hiba esetén kérlek értesísd készítőmet! ${client.users.resolve(client.devId).tag}`);
            return embed;
        },

        Help: (client: Client): MessageEmbed => {
            const embed = new MessageEmbed()
                .setTimestamp(Date.now())
                .setColor("GREEN")
                .setTitle("Segítségért írd be")
                .setDescription(`\`\`\`md\n${Settings.Prefix}help\`\`\``)
                .setFooter(`Hiba esetén kérlek értesísd készítőmet! ${client.users.resolve(client.devId).tag}`);
            return embed;
        }
    },

    Online: (mode: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle("Online")
            .setDescription(mode)
            .setTimestamp(Date.now());
        return embed;
    },

    Shutdown: (mode: string): MessageEmbed => {
        const embed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle("Shutting Down")
            .setDescription(mode)
            .setTimestamp(Date.now());
        return embed;
    }
};