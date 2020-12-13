import { GuildMember, MessageEmbed } from "discord.js";
import colors from "colors";

export default async (member: GuildMember) => {
    if(member.partial) await member.fetch();

    const identifyer = member.user.bot ? "Bot" : "User";
    const embed = new MessageEmbed()
        .setColor("GREEN")
        .setTimestamp(Date.now())
        .setTitle(`${identifyer} Joined The Server`)
        .addFields([
            { name: identifyer, value: `${member}`, inline: false },
            { name: `${identifyer} Tag`, value: `\`\`\`${member.user.tag}\`\`\``, inline: true },
            { name: `${identifyer} Id`, value: `\`\`\`xl\n${member.id}\`\`\``, inline: true }
        ]);

    if(member.guild.id === member.client.mainGuild.id) member.client.logChannel.send(embed);
    else member.client.devLogChannel.send(embed);

    console.log(colors.green(`${identifyer}: ${member.displayName} (ID: ${member.id}) joined the server at \`${member.client.logDate(member.joinedTimestamp)}\``));
}