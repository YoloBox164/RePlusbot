import { Invite, MessageEmbed } from "discord.js";

export default function inviteLogHandler(invite: Invite, text: string) {
    const guild = invite.guild;
    const botMember = guild.member(invite.client.user);
    const inviterMember = guild.member(invite.inviter);

    const embed = new MessageEmbed()
        .setColor(botMember.displayHexColor)
        .setTitle(`Invite ${text}`);

    if(text === "Created") {
        embed.addFields([
            { name: "Inviter", value: `${inviterMember}`, inline: false },
            { name: "Inviter Tag", value: `\`\`\`${inviterMember?.user.tag}\`\`\``, inline: true },
            { name: "Inviter ID", value: `\`\`\`xl\n${inviterMember?.id}\`\`\``, inline: true },
            { name: "Code", value: `\`\`\`${invite.code}\`\`\``, inline: false },
            { name: "URL", value: `${invite.url}`, inline: false },
            { name: "Channel", value: `${invite.channel}`, inline: false },
            {
                name: "Created At",
                value: `\`\`\`${invite.createdTimestamp ? invite.client.logDate(invite.createdTimestamp) : null}\`\`\``,
                inline: true 
            },
            { 
                name: "Expires At",
                value: `\`\`\`${invite.createdTimestamp ? invite.client.logDate(invite.expiresTimestamp) : null}\`\`\``,
                inline: true
            },
            { name: "\u200b", value: "\u200b", inline: false },
            { name: "Max Age", value: `\`\`\`xl\n${invite.maxAge} ms\`\`\``, inline: true },
            { name: "Max Uses", value: `\`\`\`xl\n${invite.maxUses}\`\`\``, inline: true },
            { name: "\u200b", value: "\u200b", inline: false },
            { 
                name: "Target User",
                value: `\`\`\`xl\n${invite.targetUser} | Is From Stream: ${invite.targetUserType == 1 ? "True" : "False"}\`\`\``,
                inline: true
            },
            { name: "Temporary", value: `\`\`\`xl\n${invite.temporary}\`\`\``, inline: true }
        ]);
    } else {
        embed.addFields([
            { name: "Code", value: `\`\`\`${invite.code}\`\`\``, inline: false },
            { name: "URL", value: `${invite.url}`, inline: false },
            { name: "Channel", value: `${invite.channel}`, inline: false }
        ]);
    }

    invite.client.logChannel.send(embed);
}