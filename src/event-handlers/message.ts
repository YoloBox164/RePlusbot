import { Message } from "discord.js";
import colors from "colors";
import embedTemplates from "../utils/embed-templates";
import { Clean, MemberHasOneOfTheRoles } from "../utils/tools";
import LevelSystem from "../systems/level";
import { Channels, Emojis, StaffIds } from "../settings.json";
import RegexpPatterns from "../utils/regexp-patterns";
import SecuritySys from "../systems/security";
import Config from "../config.json";

export default async (message: Message) => {
    if(message.partial) await message.fetch().catch((err) => console.error(new Error(err)));
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    if(message.author.id !== message.client.devId
      && (message.channel.id == Channels.modLogId || message.channel.id == Channels.automodLogId)) {
        const reason = "A log csatornákba nem küldhetsz üzeneteket.";
        if(message.deletable) message.delete({ reason: reason }).catch(console.error);
        message.author.send(reason);
    }

    if(Config.mode === "development" || !MemberHasOneOfTheRoles(message.member, StaffIds)) {
        if(await SecuritySys.Automod.LinkFilter.Check(message).catch((err) => console.error(new Error(err)))) return;
        if(SecuritySys.Automod.WordFilter.Check(message)) return;
        if(SecuritySys.Automod.SpamProtection.CheckTime(message)) return;
        if(SecuritySys.Automod.SpamProtection.CheckContent(message)) return;
    }

    SecuritySys.Regist.CheckMsg(message);
    upvoteSys(message);

    const commands = await message.client.CommandHandler.commands;

    if(checkPrefix(message.content, message.client.devPrefix) && message.author.id === message.client.devId) {
        const { command, args } = makeArgs(message, message.client.devPrefix);
        const cmd = commands.get(command);

        if(cmd && cmd.isDev) cmd.execute(message, args);
        LevelSystem.GiveExp(message, true).catch((err) => console.error(new Error(err)));
    } else if(checkPrefix(message.content, message.client.prefix)) {
        const { command, args } = makeArgs(message, message.client.prefix);
        const cmd = commands.get(command) || commands.find(c => c.aliases && c.aliases.includes(command));

        if(cmd && !cmd.isDev) {
            const logMsg = `${message.member.displayName} used the ${cmd.name} in ${message.channel.name}.`;
            if(cmd.mustHaveArgs && args.length === 0) {
                const embed = embedTemplates.Cmd.ArgErr(message.client, cmd);
                message.channel.send(embed);
            } else {
                cmd.execute(message, args).then(() => {
                    console.log(colors.cyan(logMsg));
                }).catch(error => {
                    console.error(error);
                    message.client.logChannel.send(embedTemplates.Error(`\`\`\`xl\n${Clean(error)}\n\`\`\``));
                });
            }
            LevelSystem.GiveExp(message, true).catch((err) => console.error(new Error(err)));
        } else message.channel.send(embedTemplates.Cmd.Help(message.client));
    } else if(message.mentions.has(message.client.user, { ignoreEveryone: true, ignoreRoles: true })) {
        message.channel.send(embedTemplates.Cmd.Help(message.client));
        LevelSystem.GiveExp(message, false).catch((err) => console.error(new Error(err)));
    } else LevelSystem.GiveExp(message, false).catch((err) => console.error(new Error(err)));
}

function checkPrefix(text: string, prefix: string): boolean {
    let safePrefix = "";
    for(const char of prefix) safePrefix += `\\${char}`;
    return new RegExp(`^${safePrefix}\\w+`).test(text);
}

function makeArgs(message: Message, prefix: string): { command: string; args: string[]; } {
    const [ command, ...args ] = message.content.trim().slice(prefix.length).split(/\s+/g);
    return { command: command.toLowerCase(), args: args };
}

function upvoteSys(message: Message) {
    if(Channels.upvoteIds.includes(message.channel.id)) {
        const match = message.content.match(RegexpPatterns.LinkFinder);
        if(!match && message.attachments.size === 0) return;
        const voteup = message.guild.emojis.cache.get(Emojis.voteupId);
        const votedown = message.guild.emojis.cache.get(Emojis.votedownId);
        message.react(voteup).then(msg => msg.message.react(votedown)).catch(console.error);
    }
}