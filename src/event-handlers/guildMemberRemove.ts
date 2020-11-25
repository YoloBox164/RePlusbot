import { GuildAuditLogsEntry, GuildMember, MessageEmbed, User } from "discord.js";
import tools from "../utils/tools";

export default async (member: GuildMember) => {
    if(member.partial) await member.fetch();
    const identifyer = member.user.bot ? "Bot" : "User";

    const banEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" }).then(audit => audit.entries.first());
    const kickEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_KICK" }).then(audit => audit.entries.first());
    const pruneEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_PRUNE" }).then(audit => audit.entries.first());

    let type = Types.LEFT;
    let entry = null

    if(banEntry && banEntry.targetType === "USER" && (<User>banEntry.target).id === member.id) {
        type = Types.BANNED;
        entry = banEntry;
    } else if(kickEntry && kickEntry.targetType === "USER" && (<User>kickEntry.target).id === member.id) {
        type = Types.KICKED; 
        entry = kickEntry;
    } else if (pruneEntry && pruneEntry.targetType === "USER" && (<User>pruneEntry.target).id === member.id) {
        type = Types.PRUNED;
        entry = pruneEntry;
    }
    
    let { embed, text, reason } = createEmbed(member, entry, type);

    if(member.guild === member.client.mainGuild) member.client.logChannel.send(embed);
    else member.client.devLogChannel.send(embed);

    console.log(`${identifyer}: ${member.displayName} (Id: ${member.id}) ${text} at ${member.client.logDate()} | Reason: ${reason}`.red);
}

function createEmbed(member: GuildMember, entry: GuildAuditLogsEntry | null, type: Types) {
    const identifyer = member.user.bot ? "Bot" : "User";

    const issuer = member.guild.members.resolve(entry.executor.id);

    const embed = new MessageEmbed()
        .setColor("RED")
        .setTimestamp(Date.now())
        .setTitle(`${identifyer} ${tools.FirstCharUpperCase(Types[type].toLowerCase())} From The Server`)
        .addFields([
            { name: identifyer, value: `${member}`, inline: false },
            { name: `${identifyer} Tag`, value: `\`\`\`${member.user.tag}\`\`\``, inline: true },
            { name: `${identifyer} Id`, value: `\`\`\`xl\n${member.id}\`\`\``, inline: true }
        ]);

    let text = "leaved the server";
    let reason = "N/A";

    if(entry) {
        embed.addFields([
            { name: "By", value: `${issuer}`, inline: false },
            { name: "Reason", value: `${entry.reason ? `\`\`\`md\n# ${entry.reason}\`\`\`` : "N/A"}`, inline: false }
        ]);
        text = `was ${Types[type].toLowerCase()} by ${issuer.displayName}`;
        if(entry.reason) reason = entry.reason;
    }
    
    return { embed, text, reason };
}

enum Types {
    "LEFT",
    "BANNED",
    "KICKED",
    "PRUNED"
}