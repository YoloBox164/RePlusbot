const Discord = require("discord.js");
const Bot = new Discord.Client({ partials: [/* "CHANNEL",*/ "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"] });

const Config = require("./config.json");
process.env.mode = Config.mode;
const Settings = require("./settings.json");

Bot.CommandHandler = require("./command-handler");
Bot.devId = "333324517730680842";
Bot.devPrefix = "#>";
Bot.prefix = Settings.Prefix;

/**
* @type {number} [timestamp] milliseconds since epoch
* @return {string} Readable date
*/
Bot.logDate = (timestamp) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
};

const Tools = require("./utils/tools");
const Database = require("./database");
const daily = require("./storage/daily.json");
const SecSys = require("./sec-sys");
const AnalyticSys = require("./analytic-sys");
const MovieSys = require("./movie-sys");
const XpSys = require("./xp-sys");

const fs = require("fs");
const colors = require("colors/safe");
const dateFormat = require("dateformat");

const EmbedTemplates = require("./utils/embed-templates.js");
const RegexpPatterns = require("./utils/regexp-patterns.js");

/** @type {Discord.Guild} */
let mainGuild = undefined;
/** @type {Discord.TextChannel} */
let logChannel = undefined;
/** @type {Discord.TextChannel} */
let devLogChannel = undefined;

// First load of commands -- Future TODO implement Discord.js's Commando.js!!
console.log(colors.yellow("BOT Starting...\n"));
Bot.CommandHandler.loadCmds();

Bot.login(Config.TOKEN).catch(console.error);

const statuses = [">help", "Node.Js", "Made By CsiPA0723#0423", "Discord.js", "Better-Sqlite3"];

Bot.once("ready", async () => {
    Database.Connect();
    AnalyticSys.Init();

    /* INIT hardcoded channels and guilds */
    mainGuild = Bot.guilds.resolve("572873520732831754");
    logChannel = mainGuild.channels.resolve(Settings.Channels.modLogId);
    devLogChannel = Bot.guilds.resolve("427567526935920655").channels.resolve("647420812722307082");

    // Caching msg in the regist channel
    /** @type {Discord.TextChannel} */
    const registChannel = Bot.channels.resolve(Settings.Channels.registId);
    registChannel.messages.fetch({ cache: true }).catch(console.error);

    MovieSys.CacheMovieMessages(Bot);

    // Caching the NSFWreactMessage to be able to work with it.
    // /**@type {Discord.TextChannel} */
    /* var reactChannel = bot.channels.resolve(SETTINGS.reactChannelId);
    reactChannel.messages.fetch(reactRoles.help.NSFWReactMessage, true).catch(console.error);*/

    // Passing the channels and guilds to the bot.
    Bot.mainGuild = mainGuild;
    Bot.logChannel = logChannel;
    Bot.devLogChannel = devLogChannel;

    console.log(colors.bold(`Revolt Bot READY! (${Config.mode})`));
    logChannel.send(EmbedTemplates.Online(`**MODE:** \`${Config.mode}\``));

    if(Config.mode === "development") {
        Bot.user.setPresence({ activity: { name: "in development", type: "PLAYING" }, status: "dnd" });
    } else {
        Bot.setInterval(() => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            Bot.user.setPresence({ activity: { name: `you | ${status}`, type: "WATCHING" }, status: "online" });
        }, 30000);
    }

    /** Removing mutes or restarting mute timers */
    for(const userId in SecSys.MuteHandler.MutedUsers) {
        if(SecSys.MuteHandler.MutedUsers[userId]) {
            const time = SecSys.MuteHandler.MutedUsers[userId];
            if(time > Date.now()) SecSys.MuteHandler.Remove(mainGuild.member(userId));
            else setTimeout(() => SecSys.MuteHandler.Remove(mainGuild.member(userId)), time - Date.now());
        }
    }

    /* bot.setInterval(() => {
        const MUTES = JSON.parse(fs.readFileSync("./mute.json"));
        for(i in MUTES) {
            var mutedMember = MUTES[i];
            if(mutedMember.time < Date.now()) {
                var member = mainGuild.members.resolve(mutedMember.id);
                member.removeRole(SETTINGS.MuteRoleId);
                target.setMute(false).catch(console.error);
                delete MUTES[`${mutedMember.id}`];
                fs.writeFile("./mute.json", JSON.stringify(MUTES, null, 4), err => {
                    if(err) throw err;
                    console.log(`Unmuted ${member.displayName}`);
                    logChannel.send(`Unmuted ${member.displayName}`)
                });
            } else {
                member.roles.add(SETTINGS.MuteRoleId);
                target.setMute(true).catch(console.error);
            }
        }
    }, 10000);*/

    Bot.setInterval(async () => {
        const Giveaways = JSON.parse(fs.readFileSync("./storage/giveaways.json"));
        for(const i in Giveaways) {
            /** @type {number} */
            const date = Giveaways[i].date;
            /** @type {string} */
            const channelId = Giveaways[i].channelId;
            const now = Date.now();
            if(date <= now) {
                /** @type {Discord.TextChannel} */
                const giveawayChannel = mainGuild.channels.resolve(channelId);
                /** @type {Discord.Message} */
                const msg = await giveawayChannel.messages.fetch(i).catch(console.error);
                if(!msg) return console.log("Message not found.");
                const users = await msg.reactions.cache.first().users.fetch().catch(console.error);
                await users.delete(Bot.user.id);
                let winner = users.random();
                while(winner.bot) winner = users.random();
                const text = `Gratulálunk ${winner}! Megnyerted a nyereményjátékot!`;

                const embed = new Discord.MessageEmbed()
                    .setColor(msg.member.displayHexColor)
                    .setDescription(text);
                giveawayChannel.send({ embed: embed });

                msg.reactions.removeAll().catch(console.error);
                delete Giveaways[i];
                fs.writeFile("./giveaways.json", JSON.stringify(Giveaways, null, 4), err => {
                    if(err) throw err;
                    console.log(`Deleted giveaway ${i}`);
                    logChannel.send(`Deleted giveaway ${i}`);
                });
            }
        }
    }, 60000);
});

Bot.on("presenceUpdate", async (oldPresence, newPresence) => CheckWumpus(newPresence));

Bot.on("messageReactionAdd", async (reaction, user) => {
    if(reaction.partial) await reaction.fetch();
    if(user.partial) await reaction.fetch();
    SecSys.Regist.CheckReaction(reaction, user);
    MovieSys.CheckReaction(reaction, user);
});

Bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(message.partial) await message.fetch();

    if(Config.mode === "development" || !Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds)) {
        if(SecSys.Automod.LinkFilter.Check(message)) return;
        if(SecSys.Automod.WordFilter.Check(message)) return;
        if(SecSys.Automod.SpamProtection.CheckTime(message)) return;
        if(SecSys.Automod.SpamProtection.CheckContent(message)) return;
    }

    if(message.channel.id == Settings.Channels.modLogId || message.channel.id == Settings.Channels.automodLogId) {
        const reason = "A log csatornákba nem küldhetsz üzeneteket.";
        if(message.deletable) message.delete({ reason: reason }).catch(console.error);
        message.author.send(reason);
    }

    SecSys.Regist.CheckMsg(message);
    upvoteSys(message);

    if(message.content.startsWith(Bot.devPrefix) && message.author.id === Bot.devId) {
        const { command, args } = makeArgs(message, Bot.devPrefix);

        const cmd = Bot.CommandHandler.commands.get(command);
        if(cmd && cmd.dev) cmd.execute(message, args);
        XpSys.GiveExp(message, true);
    } else if(message.content.startsWith(Bot.prefix)) {
        if(message.content.startsWith(">:")) return;
        if(message.content.startsWith("> ")) return;
        const { command, args } = makeArgs(message, Bot.prefix);

        const cmd = Bot.CommandHandler.commands.get(command) ||
            Bot.CommandHandler.commands.find(c => c.aliases && c.aliases.includes(command));

        if(cmd && !cmd.dev) {
            const logMsg = `${message.member.displayName} used the ${cmd.name} in ${message.channel.name}.`;
            cmd.execute(message, args);
            console.log(colors.cyan(logMsg));
        } else {
            message.channel.send("`>help` » Ha kell segítség használatomhoz.");
        }
        XpSys.GiveExp(message, true);
    } else if(message.mentions.has(Bot.user)) {
        message.channel.send("`>help` » Ha kell segítség használatomhoz.");
        XpSys.GiveExp(message, false);
    } else {
        XpSys.GiveExp(message, false);
    }
});

Bot.on("messageUpdate", (oldMessage, newMessage) => {
    if(newMessage.author.bot) return;
    if(newMessage.channel.type === "dm") return;

    if(Config.mode === "development" || !Tools.MemberHasOneOfTheRoles(newMessage.member, Settings.StaffIds)) {
        if(SecSys.Automod.LinkFilter.Check(newMessage)) return;
        if(SecSys.Automod.WordFilter.Check(newMessage)) return;
    }
});

Bot.on("messageDelete", async (message) => {
    if(message.partial) await message.fetch();
    MovieSys.CheckDeletedMsg(message);
});

/** @param {Discord.Message} message */
function upvoteSys(message) {
    if(Settings.Channels.upvoteIds.includes(message.channel.id)) {
        const match = message.content.match(RegexpPatterns.LinkFinder);
        if(!match && message.attachments.size === 0) return;
        const voteup = message.guild.emojis.cache.get(Settings.emojis.voteupId);
        const votedown = message.guild.emojis.cache.get(Settings.emojis.votedownId);
        message.react(voteup).then(msg => msg.message.react(votedown)).catch(console.error);
    }
}

/**
 * @param {Discord.Message} message
 * @param {string} prefix
 * @returns {{command:string, args: Array<string>}}
 */
function makeArgs(message, prefix) {
    const messageArray = message.content.split(/\s+/g);
    const args = messageArray.slice(1);
    const command = messageArray[0].toLowerCase().slice(prefix.length);

    return { command: command, args: args };
}

Bot.on("inviteCreate", invite => inviteLogHandler(invite, "Created"));
Bot.on("inviteDelete", invite => inviteLogHandler(invite, "Deleted"));

/**
 *  @param {Discord.Invite} invite
 *  @param {string} text
 */
function inviteLogHandler(invite, text) {
    /** @type {Discord.Guild} */
    const guild = invite.guild;
    const botMember = guild.member(Bot.user);
    const inviterMember = guild.member(invite.inviter);

    const createMsg = `**Inviter:** ${inviterMember} Id: ${inviterMember ? inviterMember.id : null}
        **Code:** ${invite.code}
        **URL:** ${invite.url}
        **Channel:** ${invite.channel}\n
        **Created At:** ${invite.createdTimestamp ? Bot.logDate(invite.createdTimestamp) : null}
        **Expires At:** ${invite.createdTimestamp ? Bot.logDate(invite.expiresTimestamp) : null}\n
        **Max Age:** ${invite.maxAge} ms
        **Max Uses:** ${invite.maxUses}
        **Target User:** ${invite.targetUser} | Is From Stream: ${invite.targetUserType == 1 ? "True" : "False"}
        **Temporary:** ${invite.temporary}`;

    const deleteMsg = `**Code:** ${invite.code}
        **URL:** ${invite.url}
        **Channel:** ${invite.channel}`;

    const embed = new Discord.MessageEmbed()
        .setColor(botMember.displayHexColor)
        .setTitle(`Invite ${text}`)
        .setDescription(text === "Created" ? createMsg : deleteMsg);

    logChannel.send({ embed: embed });
}

Bot.on("guildMemberAdd", async member => {
    if(member.partial) member.fetch();
    const logMsg = `${member.user.bot ? "`BOT`" : "`User`"}: ${member.displayName} (${member.id}) joined the server at \`${Bot.logDate(member.joinedTimestamp)}\``;

    if(member.guild == mainGuild) {
        if(member.user.bot) member.roles.add(Settings.Roles.AutoBotId);
        logChannel.send(logMsg);
    } else {devLogChannel.send(logMsg);}

    console.log(colors.green(logMsg.replace(/`/g, "")));
});

Bot.on("guildMemberRemove", async member => {
    if(member.partial) member.fetch();
    const banEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" }).then(audit => audit.entries.first());
    const kickEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_KICK" }).then(audit => audit.entries.first());
    const pruneEntry = await member.guild.fetchAuditLogs({ type: "MEMBER_PRUNE" }).then(audit => audit.entries.first());

    let text, reason = "N/A";
    if(banEntry && banEntry.target.id === member.id) {
        text = "was banned by " + member.guild.members.resolve(banEntry.executor.id).displayName;
        if(banEntry.reason) reason = banEntry.reason;
    } else if(kickEntry && kickEntry.target.id === member.id) {
        text = "was kicked by " + member.guild.members.resolve(kickEntry.executor.id).displayName;
        if(kickEntry.reason) reason = kickEntry.reason;
    } else if (pruneEntry && pruneEntry.target.id === member.id) {
        text = "was pruned by" + member.guild.members.resolve(pruneEntry.executor.id).displayName;
        if(pruneEntry.reason) reason = pruneEntry.reason;
    } else {
        text = "leaved the server";
    }

    const logMsg = `${member.user.bot ? "`BOT`" : "`User`"}: ${member.displayName} (Id:  \`${member.id}\`) ${text} at \`${Bot.logDate()}\` | Reason: ${reason}`;

    if(member.guild == mainGuild) logChannel.send(logMsg);
    else devLogChannel.send(logMsg);
    console.log(colors.red(logMsg.replace(/`/g, "")));
});

Bot.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => AnalyticSys.voiceState(oldVoiceState, newVoiceState));

process.on("uncaughtException", err => { errorHandling(err, "Uncaught Exception", true); });

process.on("unhandledRejection", err => { errorHandling(err, "Unhandled Rejection", false); });

/**
 * @param {Error} err
 * @param {string} msg
 */
function errorHandling(err, msg, toShutdown = false) {
    let logMsg = `\`${msg}\`\n\`\`\`xl\n${clean(err)}\n\`\`\``;
    if(toShutdown) logMsg += `\n\`SHUTTING DOWN\` | \`${Bot.logDate()}\``;
    const embed = EmbedTemplates.Error(logMsg);
    if(logChannel) logChannel.send({ embed: embed }).catch(console.error);
    console.error(err);
    if(toShutdown) Bot.setTimeout(() => { Bot.destroy(); }, 2000);
}

/** @param {string} text */
function clean(text) {
    if (typeof (text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

/** @param {import("discord.js").Presence} presence Discord guild member */
function CheckWumpus(presence) {
    const wumpusData = Database.GetData("wumpus", presence.userID);
    if(!wumpusData) return;

    if(!wumpusData.hasRole) {
        Database.DeleteData("wumpus", presence.userID);
        return;
    }

    if(wumpusData.perma && !presence.roles.cache.has(Database.config.WumpusRoleId)) {
        Database.DeleteData("wumpus", presence.userID);
        return;
    }

    const currencyData = Database.GetData("currency", presence.userID);
    if(!currencyData) return;

    if(presence.roles.has(Database.config.WumpusRoleId) && !wumpusData.perma) {
        const now = new Date(Date.now());
        const year = now.getFullYear();
        const month = now.getMonth();

        const MonthDateRange = Tools.GetMonthDateRange(year, month);
        if(parseInt(daily.EndOfTheMonthInMilliSeconds) < MonthDateRange.end) {
            daily.EndOfTheMonthInMilliSeconds = MonthDateRange.end;
            fs.writeFile("./storage/daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });
        }
        if(wumpusData.roleTime < MonthDateRange.start + (Database.config.DayInMilliSeconds * 2)) {
            if(currencyData.bits >= Database.config.WumpusRoleCost) {
                currencyData.bits -= Database.config.WumpusRoleCost;
                Database.SetData("currency", currencyData);
                wumpusData.roleTime = MonthDateRange.end + Database.config.DayInMilliSeconds;
                Database.SetData("wumpus", wumpusData);
                if(!presence.roles.has(Database.config.WumpusRoleId)) presence.roles.add(Database.config.WumpusRoleId);
            } else {
                Database.DeleteData("wumpus", presence.userID);
                presence.removeRole(Database.config.WumpusRoleId, "Did not have enough bits.");
            }
        } else if(!presence.roles.has(Database.config.WumpusRoleId)) {presence.roles.add(Database.config.WumpusRoleId);}
    } else if(!presence.roles.has(Database.config.WumpusRoleId)) {presence.roles.add(Database.config.WumpusRoleId);}
}