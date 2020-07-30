const Discord = require('discord.js');
const bot = new Discord.Client();

const Tools = require('./utils/tools.js');
const database = require('./database');
const daily = require('./storage/daily.json');
const SecSys = require('./sec-sys');
const AnalyticSys = require('./analytic-sys');
const MovieSys = require('./movie-sys');

const fs = require('fs');
const colors = require('colors/safe');

const dateFormat = require('dateformat');

const Config = require('./config.json');
process.env.mode = Config.mode;

const Settings = require('./settings.json');
const EmbedTemplates = require('./utils/embed-templates.js');
const prefix = Settings.Prefix;

bot.prefix = prefix;
bot.devPrefix = '#>';
bot.devId = "333324517730680842";

/** @type {Discord.Collection<string, Array<string>} */
var categories = new Discord.Collection();
/** @type {Discord.Collection<string, cmd>} */
var devCommands = new Discord.Collection();
/** @type {Discord.Collection<string, cmd>} */
var commands = new Discord.Collection();
/** @type {Discord.Collection<string, string} */
var aliasCmds = new Discord.Collection();

/** @type {Discord.Guild} */
var mainGuild;
/** @type {Discord.TextChannel} */
var logChannel;
/** @type {Discord.TextChannel} */
var welcomeChannel;
/** @type {Discord.TextChannel} */
var devLogChannel;

//First load of commands -- Future TODO implement Discord.js's Commando.js!!
console.log(colors.yellow("BOT Starting...\n"));
loadCmds();

bot.login(Config.TOKEN).catch(console.error);

/** @param {number} timestamp */
bot.logDate = (timestamp) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
}

let statuses = [">help", "Node.Js", "Made By CsiPA0723#0423", "Discord.js", "Better-Sqlite3"]

bot.on('ready', async () => {
    console.log(colors.yellow("---[ Preparing Databases ]---\n"));
    database.Prepare('currency');
    database.Prepare('wumpus');
    database.Prepare('warnedUsers');
    database.Prepare('warnings');
    console.log(colors.yellow("\n---[ Preparing Databases ]---\n"));

    /* INIT hardcode channels and guilds */
    mainGuild = bot.guilds.resolve('572873520732831754');
    logChannel = mainGuild.channels.resolve(Settings.Channels.modLogId);
    welcomeChannel = mainGuild.channels.resolve(Settings.Channels.welcomeMsgId);
    devLogChannel = bot.guilds.resolve('427567526935920655').channels.resolve('647420812722307082');
    
    //Caching msg in the regist channel
    /** @type {Discord.TextChannel} */
    let registChannel = bot.channels.resolve(Settings.Channels.registId);
    registChannel.messages.fetch({cache: true}).catch(console.error);

    MovieSys.CacheMovieMessages(bot);

    //Caching the NSFWreactMessage to be able to work with it.
    ///**@type {Discord.TextChannel} */
    /*var reactChannel = bot.channels.resolve(SETTINGS.reactChannelId);
    reactChannel.messages.fetch(reactRoles.help.NSFWReactMessage, true).catch(console.error);*/
    
    //Passing the channels and guilds to the bot.
    bot.mainGuild = mainGuild;
    bot.logChannel = logChannel;
    bot.devLogChannel = devLogChannel;

    //Init Analytic system
    AnalyticSys.Init();

    AnalyticSys.GetAllUserData().then(allUserData => {
        allUserData.forEach((userData, userId) => {
            let user = bot.users.resolve(userId);
            if(user) userData.tag = user.tag;
            if(!userData.lastVoiceChannel) userData.lastVoiceChannel = {};
            if(!userData.textChannels) userData.textChannels = {};
            if(!userData.voiceChannels) userData.voiceChannels = {};
            AnalyticSys.WriteUserData(userId, userData);
        });
    });

    console.log(colors.bold(`Revolt Bot READY! (${Config.mode})`));
    logChannel.send(`\`ONLINE\` | \`MODE: ${Config.mode}\``);
    
    if(Config.mode === "development") {
        bot.user.setPresence({activity: {name: `in development`, type: "PLAYING"}, status: "dnd"});
    } else {
        bot.setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            bot.user.setPresence({activity: {name: `you | ${status}`, type: "WATCHING"}, status: "online"});
        }, 30000);
    }

    /** Removing mutes or restarting mute timers */
    for(const userId in SecSys.MuteHandler.MutedUsers) {
        if(SecSys.MuteHandler.MutedUsers.hasOwnProperty(userId)) {
            const time = SecSys.MuteHandler.MutedUsers[userId];
            if(time > Date.now()) SecSys.MuteHandler.Remove(mainGuild.member(userId));
            else setTimeout(() => SecSys.MuteHandler.Remove(mainGuild.member(userId)), time - Date.now());
        }
    }

    /*bot.setInterval(() => {
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

    bot.setInterval(async () => {
        const Giveaways = JSON.parse(fs.readFileSync("./storage/giveaways.json"));
        for(i in Giveaways) {
            /** @type {number} */
            var date = Giveaways[i].date;
            /** @type {string} */
            var channelId = Giveaways[i].channelId;
            var now = Date.now();
            if(date <= now) {
                /** @type {Discord.TextChannel} */
                var giveawayChannel = mainGuild.channels.resolve(channelId);
                /** @type {Discord.Message} */
                var msg = await giveawayChannel.messages.fetch(i).catch(console.error);
                if(!msg) return console.log("Message not found.");
                var users = await msg.reactions.cache.first().users.fetch().catch(console.error);
                await users.delete(bot.user.id);
                var winner = users.random();
                while(winner.bot) winner = users.random();
                var text = `Gratulálunk ${winner}! Megnyerted a nyereményjátékot!`;

                var embed = new Discord.MessageEmbed()
                    .setColor(msg.member.displayHexColor)
                    .setDescription(text);
                giveawayChannel.send({embed: embed});

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

bot.on('presenceUpdate', async (oldMember, newMember) => CheckWumpus(newMember));

bot.on('messageReactionAdd', (messageReaction, user) => { 
    SecSys.Regist.CheckReaction(messageReaction, user);
    MovieSys.CheckReaction(messageReaction, user);
});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;

    if(Config.mode === "development" || !Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds)) {
        if(SecSys.Automod.LinkFilter.Check(message)) return;
        if(SecSys.Automod.WordFilter.Check(message)) return;
        if(SecSys.Automod.SpamProtection.CheckTime(message)) return;
        if(SecSys.Automod.SpamProtection.CheckContent(message)) return;
    }

    if(message.channel.id == Settings.Channels.modLogId || message.channel.id == Settings.Channels.automodLogId) {
        let reason = "A log csatornákba nem küldhetsz üzeneteket."
        if(message.deletable) message.delete({reason: reason}).catch(console.error);
        message.author.send(reason);
    }

    SecSys.Regist.CheckMsg(message);

    AnalyticSys.messageCountPlus(message, false);
    upvoteSys(message);

    if(message.mentions.has(bot.user)) message.channel.send("`>help` » Ha kell segítség használatomhoz.");

    if(message.content.startsWith(">:")) return;

    if(message.content.startsWith(bot.devPrefix) && message.author.id === bot.devId) {
        const { command, args } = makeArgs(message, bot.devPrefix);
        if(command == "sh") {
            ShutdownCmds(message, args);
            return;
        }

        /** @type {cmd} */
        let cmd = devCommands.get(command);
        if(cmd) cmd.run(bot, message, args);

    } else if(message.content.startsWith(prefix)) {
        const { command, args } = makeArgs(message, prefix);

        bot.commands = commands;
        bot.aliasCmds = aliasCmds;

        let cmd = commands.get(command) || commands.get(aliasCmds.get(command));
        if(cmd) {
            if(message.content.startsWith("> ")) return;
            let logMsg = `${message.member.displayName} used the ${cmd.help.cmd} in ${message.channel.name}.`;
            cmd.run(bot, message, args);
            console.log(colors.cyan(logMsg));
        }
        else message.channel.send("`>help` » Ha kell segítség használatomhoz.");
        AnalyticSys.messageCountPlus(message, true);
    }
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    if(newMessage.author.bot) return;
    if(newMessage.channel.type === 'dm') return;
    
    if(Config.mode === "development" || !Tools.MemberHasOneOfTheRoles(newMessage.member, Settings.StaffIds)) {
        let isMsgDeleted = false;
        if(!isMsgDeleted) isMsgDeleted = SecSys.Automod.LinkFilter.Check(newMessage);
        if(!isMsgDeleted) isMsgDeleted = SecSys.Automod.WordFilter.Check(newMessage);
        if(isMsgDeleted) return;
    }
});

bot.on('messageDelete', (message) => { MovieSys.CheckDeletedMsg(message); });

/** @param {Discord.Message} message */
function upvoteSys(message) {
    if(message.channel.id == Settings.Channels.upvoteId) {
        var voteup = message.guild.emojis.cache.get(Settings.emojis.voteupId);
        var votedown = message.guild.emojis.cache.get(Settings.emojis.votedownId);
        message.react(voteup).then(msg => msg.message.react(votedown)).catch(console.error);
    }
}

/**
 * @param {Discord.Message} message 
 * @param {string} prefix
 * @returns {{command:string, args: Array<string>}}
 */
function makeArgs(message, prefix) {
    var messageArray = message.content.split(/\s+\n+|\s+|\n+/g);
    var args = [];
    var command = messageArray[0].toLowerCase().slice(prefix.length);
    if(!command && messageArray[1]) {
        command = messageArray[1].toLowerCase();
        args = messageArray.slice(2);
    } else args = messageArray.slice(1);

    return { command: command, args: args };
}

bot.on('inviteCreate', invite => inviteLogHandler(invite, "Created"));
bot.on('inviteDelete', invite => inviteLogHandler(invite, "Deleted"));

/**
 *  @param {Discord.Invite} invite
 *  @param {string} text
 */
function inviteLogHandler(invite, text) {
    /** @type {Discord.Guild} */
    let guild = invite.guild;
    let botMember = guild.member(bot.user);
    let inviterMember = guild.member(invite.inviter);

    let createMsg = `**Inviter:** ${inviterMember} Id: ${inviterMember ? inviterMember.id : null}
        **Code:** ${invite.code}
        **URL:** ${invite.url}
        **Channel:** ${invite.channel}\n
        **Created At:** ${invite.createdTimestamp ? bot.logDate(invite.createdTimestamp) : null}
        **Expires At:** ${invite.createdTimestamp ? bot.logDate(invite.expiresTimestamp) : null}\n
        **Max Age:** ${invite.maxAge} ms
        **Max Uses:** ${invite.maxUses}
        **Target User:** ${invite.targetUser} | Is From Stream: ${invite.targetUserType == 1 ? "True" : "False"}
        **Temporary:** ${invite.temporary}`;

    let deleteMsg = `**Code:** ${invite.code}
        **URL:** ${invite.url}
        **Channel:** ${invite.channel}`;

    const embed = new Discord.MessageEmbed()
        .setColor(botMember.displayHexColor)
        .setTitle(`Invite ${text}`)
        .setDescription(text === "Created" ? createMsg : deleteMsg);
    
    logChannel.send({embed: embed});
}

bot.on('guildMemberAdd', async member => {
    let logMsg = `${member.user.bot ? "\`BOT\`" : "\`User\`"}: ${member.displayName} (${member.id}) joined the server at \`${bot.logDate(member.joinedTimestamp)}\``;
    
    if(member.guild == mainGuild) {
        if(member.user.bot) member.roles.add(Settings.Roles.AutoBotId);
        logChannel.send(logMsg);
    } else devLogChannel.send(logMsg);
    
    console.log(colors.green(logMsg.replace(/\`/g, "")));
});

bot.on('guildMemberRemove', async member => {
    var banEntry = await member.guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
    var kickEntry = await member.guild.fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
    var pruneEntry = await member.guild.fetchAuditLogs({type: 'MEMBER_PRUNE'}).then(audit => audit.entries.first());

    var text, reason = "N/A";
    if(banEntry && banEntry.target.id === member.id) {
        text = "was banned by " + member.guild.members.resolve(banEntry.executor.id).displayName;
        if(banEntry.reason) reason = banEntry.reason;
    } else if(kickEntry && kickEntry.target.id === member.id) {
        text = "was kicked by " + member.guild.members.resolve(kickEntry.executor.id).displayName;
        if(kickEntry.reason) reason = kickEntry.reason;
    } else if (pruneEntry && pruneEntry.target.id === member.id) {
        text = "was pruned by" +  member.guild.members.resolve(pruneEntry.executor.id).displayName;
        if(pruneEntry.reason) reason = pruneEntry.reason;
    } else {
        text = "leaved the server";
    }

    var logMsg = `${member.user.bot ? "\`BOT\`" : "\`User\`"}: ${member.displayName} (Id:  \`${member.id}\`) ${text} at \`${bot.logDate()}\` | Reason: ${reason}`;

    if(member.guild == mainGuild) logChannel.send(logMsg);
    else devLogChannel.send(logMsg);
    console.log(colors.red(logMsg.replace(/\`/g, "")));
});

bot.on('voiceStateUpdate', (oldVoiceState, newVoiceState) => AnalyticSys.voiceState(oldVoiceState, newVoiceState));

process.on('uncaughtException', err => { errorHandling(err, "Uncaught Exception", true) });

process.on('unhandledRejection', err => { errorHandling(err, "Unhandled Rejection", false) });

/**
 * @param {Error} err
 * @param {string} msg
 */
function errorHandling(err, msg, toShutdown = false) {
    let logMsg = `\`${msg}\`\n\`\`\`xl\n${clean(err)}\n\`\`\``;
    if(toShutdown) logMsg += `\n\`SHUTTING DOWN\` | \`${bot.logDate()}\``;
    let embed = EmbedTemplates.Error(logMsg);
    if(logChannel) logChannel.send({embed: embed}).catch(console.error);
    console.error(err);
    if(toShutdown) bot.setTimeout(() => { bot.destroy() }, 2000);
}

function loadCmds() {
    fs.readdir("./cmds/", (err, dirs) => {
        if(err) console.error(`ERROR: ${err}`);
        dirs.forEach(dir => {
            fs.readdir(`./cmds/${dir}/`, (err, files) => {
                if(err) console.error(`ERROR: ${err}`);

                var jsfiles = files.filter(f => f.split(".").pop() === "js");
                if(jsfiles.length <= 0) {
                    console.log(colors.red("ERROR: No commands to load!"));
                    return;
                }

                console.log(colors.cyan(`Loading ${jsfiles.length} ${dir} commands!`));

                /** @type {string[]} */
                let cmdNames = [];

                jsfiles.forEach((f, i) => {
                    delete require.cache[require.resolve(`./cmds/${dir}/${f}`)];
                    /** @type {cmd} */
                    var props = require(`./cmds/${dir}/${f}`);
                    console.log(colors.white(`${i + 1}: ${f} loaded!`));
                    cmdNames.push(props.help.cmd);
                    if(dir == "dev") devCommands.set(props.help.cmd, props);
                    else {
                        commands.set(props.help.cmd, props);
                        props.help.alias.forEach((name) => {
                            aliasCmds.set(name, props.help.cmd);
                        });
                    }
                });

                categories.set(dir, cmdNames);

                if(dir != "dev") {
                    bot.categories = categories;
                    bot.commands = commands;
                    bot.aliasCmds = aliasCmds;
                }

                console.log(colors.cyan(`Successfully loaded ${jsfiles.length} ${dir} commands!\n`));
            });
        });
    });
}

/** @param {string} text */
function clean(text) {
    if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

/** @param {Discord.GuildMember} member Discord guild member */
function CheckWumpus(member) {
    var wumpusData = database.GetData('wumpus', member.id);
    if(!wumpusData.hasRole) {
        database.DeleteData('wumpus', member.id);
        delete wumpusData;
        return;
    }

    var currencyData = database.GetData('currency', member.id);
    
    if(member.roles.has(database.config.WumpusRoleId) && !wumpusData.perma) {
        var now = new Date(Date.now());
        var year = now.getFullYear();
        var month = now.getMonth();

        var MonthDateRange = Functions.GetMonthDateRange(year, month);
        if(parseInt(daily.EndOfTheMonthInMilliSeconds) < MonthDateRange.end) {
            daily.EndOfTheMonthInMilliSeconds = MonthDateRange.end;
            fs.writeFile("./daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });
        }
        if(wumpusData.roleTime < MonthDateRange.start + (database.config.DayInMilliSeconds * 2)) {
            if(currencyData.bits >= database.config.WumpusRoleCost) {
                currencyData.bits -= database.config.WumpusRoleCost;
                database.SetData('currency', currencyData);
                wumpusData.roleTime = MonthDateRange.end + database.config.DayInMilliSeconds;
                database.SetData('wumpus', wumpusData);
                if(!member.roles.has(database.config.WumpusRoleId)) member.roles.add(database.config.WumpusRoleId);
            } else {
                database.DeleteData('wumpus', member.id);
                delete wumpusData;
                member.removeRole(database.config.WumpusRoleId, "Did not have enough bits.");
            }
        } else if(!member.roles.has(database.config.WumpusRoleId)) member.roles.add(database.config.WumpusRoleId);
    } else if(!member.roles.has(database.config.WumpusRoleId)) member.roles.add(database.config.WumpusRoleId);
}

/** 
 * @param {Discord.Message} message
 * @param {Array<string>} args 
 */
async function ShutdownCmds(message, args) {
    var reloads = ["reloadcmds", "reload", "r"];
    var shutdowns = ["shutdown", "shut", "s"];
    var updates = ["update", "upd", "up"];
    var restarts = ["restart", "res", "rs"];
    var switchmodes = ["switchmode", "switch", "sw"];

    var command = args[0];
    if(!command) return;
    var dir = args[1];

    if(reloads.includes(command)) {
        logChannel.send("\`Reloading commands\`");
        console.log("Reloading commands");
        var dirs = ["cmds", "dev-cmds"];
        if(dir && dirs.includes(dir)) {
            loadCmds(dir);
        } else {
            loadCmds("cmds");
            loadCmds("dev-cmds");
        }

        message.channel.send("Commands successfully reloaded!");
    } 
    else if(shutdowns.includes(command)) await shutdown(message, "Shutting down");
    else if(updates.includes(command)) await shutdown(message, "Updating");
    else if(restarts.includes(command)) await shutdown(message, "Restarting");
    else if(switchmodes.includes(command)) await shutdown(message, "Switching to mode: " + (Config.mode == "development" ? "production." : "development."));
    else if(["twitch", "tw"].includes(command)) {
        if(Config.mode === "production") return;
        //console.log("Reloading twitch webhook");
        delete require.cache[require.resolve('./twitch.js')];
        const twitch = require('./twitch.js');
        twitch.CheckSub();
    }
}

/** 
 * @param {Discord.Message} message
 * @param {string} text 
 */
async function shutdown(message, text) {
    await logChannel.send(`\`${text}\``);
    await message.channel.send(`\`${text}\``);
    database.SQLiteDB.close();
    AnalyticSys.Shut();
    console.log(text);
    bot.destroy();
    process.exit(0);
}