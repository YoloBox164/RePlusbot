const Discord = require('discord.js');
const bot = new Discord.Client();

const functions = require('./functions.js');
const database = require('./database.js');
const daily = require('./daily.json');

const fs = require('fs');
const colors = require('colors/safe');

const dateFormat = require('dateformat');

const CONFIG = require('./config.json');
process.env.mode = CONFIG.mode;

const prefix = CONFIG.Prefix;

bot.devPrefix = '#>';
bot.devId = "333324517730680842";
bot.commands = new Discord.Collection();
bot.aliasCmds = new Discord.Collection();

var mainGuild, loggingChannel, welcomeChannel;

loadCmds();

bot.logDate = (timestamp) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss");
}

bot.login(CONFIG.TOKEN).catch(console.error);

var statuses = [">help", "Node.Js", "Made By CsiPA0723#0423", "Discord.js", "Better-Sqlite3"]

bot.on('ready', () => {
    database.PrepareCurrencyTable();
    database.PrepareWumpusTable();

    mainGuild = bot.guilds.get('572873520732831754');
    loggingChannel = mainGuild.channels.get(CONFIG.modLogChannnelId);
    welcomeChannel = mainGuild.channels.get(CONFIG.newMemberRoleId);

    bot.loggingChannel = loggingChannel;

    console.log(colors.bold(`Revolt Bot READY! (${CONFIG.mode})`));
    loggingChannel.send(`\`ONLINE\` | \`MODE: ${CONFIG.mode}\``);
    
    bot.setInterval(() => {
        var status = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setPresence({game : {name: status}, status: 'online'});
    }, 10000);
});

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;

    CheckWumpus(message);

    if(!message.content.startsWith(prefix) && !message.content.startsWith(bot.devPrefix)) return;
    var messageArray = message.content.split(/ +/g);
    var args = [];
    if(message.content.startsWith(bot.devPrefix) && message.author.id === bot.devId) {
        var command = messageArray[0].toLowerCase().slice(bot.devPrefix.length);
    
        if(!command && messageArray[1]) {
            command = messageArray[1].toLowerCase();
            args = messageArray.slice(2);
        } else args = messageArray.slice(1);

        if(command === "eval") {
            try {
                console.log(colors.red("WARN: eval being used by " + message.member.displayName));
                const code = args.join(" ");
                var evaled = eval(code);
    
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                message.channel.send(clean(evaled), {code:"xl", split: [{char: '\n'}] }).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
            }
        } else if(["reloadcmds", "reload", "r"].includes(command)) {
            loggingChannel.send("\`Reloading commands\`");
            console.log("Reloading commands");
            loadCmds();
            message.channel.send("Commands successfully reloaded!");
        } else if(["shutdown", "shut", "s"].includes(command)) {
            await loggingChannel.send("\`Shutting down\`");
            await console.log("Shutting down");
            await bot.destroy().catch(console.error);
            process.exit(0);
        } else if(["twitch", "tw"].includes(command)) {
            if(CONFIG.mode === "production") return;
            //console.log("Reloading twitch webhook");
            delete require.cache[require.resolve('./twitch.js')];
            const twitch = require('./twitch.js');
            twitch.CheckSub();
        }
        
    } else {
        var command = messageArray[0].toLowerCase().slice(prefix.length);

        if(!command && messageArray[1]) {
            command = messageArray[1].toLowerCase();
            args = messageArray.slice(2);
        } else args = messageArray.slice(1);

        var CustomRoles = require('./roles.js');
        if(await CustomRoles.CheckModes(message, command)) {
            console.log(colors.cyan(`${message.member.displayName} used the ${command} in ${message.channel.name}.`));
            return;
        }

        var cmd = bot.commands.get(command) || bot.commands.get(bot.aliasCmds.get(command));
        if(cmd) cmd.run(bot, message, args);

        console.log(colors.cyan(`${message.member.displayName} used the ${command} command in ${message.channel.name}.`));
    }
});

bot.on("guildMemberAdd", member => {
    member.addRole(CONFIG.newMemberRoleId);

    loggingChannel.send(`${member.displayName} (${member.id}) joined the server at \`${bot.logDate(member.joinedTimestamp)}\``);

    welcomeChannel.send(`Üdv a szerveren ${member}, érezd jól magad!`);

    console.log(colors.green(`${member.displayName} (${member.id}) joined the server at \`${bot.logDate(member.joinedTimestamp)}\``));
});

bot.on("guildMemberRemove", async member => {
    var kickEntry = await member.guild.fetchAuditLogs({type: 'MEMBER_KICK'}).then(audit => audit.entries.first());
    var pruneEntry = await member.guild.fetchAuditLogs({type: 'MEMBER_PRUNE'}).then(audit => audit.entries.first());

    var text, reason;
    if(kickEntry && kickEntry.target.id === member.id) {
        text = "was kicked by " + member.guild.members.get(kickEntry.executor.id).displayName;
        if(kickEntry.reason) reason = kickEntry.reason;
        else reason = "Kicked";
    } else if (pruneEntry && pruneEntry.target.id === member.id) {
        text = "was pruned by" +  member.guild.members.get(pruneEntry.executor.id).displayName;
        if(pruneEntry.reason) reason = pruneEntry.reason;
        else reason = "Pruned";
    } else {
        text = "leaved the server";
        reason = "Leaved";
    }

    loggingChannel.send(`${member.displayName} (${member.id}) ${text} at \`${bot.logDate(member.joinedTimestamp)}\` | Reason: ${reason}`);
    console.log(colors.red(`${member.displayName} (${member.id}) ${text} at \`${bot.logDate(member.joinedTimestamp)}\` | Reason: ${reason}`));
});

process.on('uncaughtException', err => {
    loggingChannel.send(`\`ERROR: Uncaught Exception\`\n\`\`\`js\n${clean(err)}\n\`\`\`\n\`SHUTTING DOWN\` | \`${bot.logDate()}\``).catch(console.error);
    console.error(err);
    bot.setTimeout(() => { bot.destroy() }, 20000);
});

process.on('unhandledRejection', err => {
    loggingChannel.send(`\`ERROR: Unhandled Rejection\`\n\`\`\`js\n${clean(err)}\n\`\`\`\n\`SHUTTING DOWN\` | \`${bot.logDate()}\``).catch(console.error);
    console.error(err);
    bot.setTimeout(() => { bot.destroy() }, 20000);
});

function loadCmds() {
    fs.readdir("./cmds/",(err, files) => {
        if(err) console.error(`ERROR: ${err}`);

        var jsfiles = files.filter(f => f.split(".").pop() === "js");
        if(jsfiles.length <= 0) {
            console.log(colors.red("ERROR: No commands to load!"));
            return;
        }

        console.log(colors.cyan(`Loading ${jsfiles.length} bot commands!`));

        jsfiles.forEach((f, i) => {
            delete require.cache[require.resolve(`./cmds/${f}`)];
            var props = require(`./cmds/${f}`);
            console.log(colors.white(`${i + 1}: ${f} loaded!`));
            bot.commands.set(props.help.cmd, props);
            props.help.alias.forEach((name) => {
                bot.aliasCmds.set(name, props.help.cmd);
            });

        });

        console.log(colors.cyan(`Successfully loaded ${jsfiles.length} commands!`));
    });
}

function clean(text) {
    if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

function CheckWumpus(message) {
    var currencyData = database.GetCurrencyData(message.author.id);
    var wumpusData = database.GetWumpusData(message.author.id);
    if(!wumpusData.hasRole) {
        database.DeleteWumpusData(message.author.id);
        delete wumpusData;
        return;
    }

    if(message.member.roles.has(database.config.WumpusRoleId) && !wumpusData.perma) {
        var now = new Date(Date.now());
        var year = now.getFullYear();
        var month = now.getMonth();

        var MonthDateRange = functions.GetMonthDateRange(year, month);
        if(daily.EndOfTheMonthInMilliSeconds < MonthDateRange.end) {
            daily.EndOfTheMonthInMilliSeconds = MonthDateRange.end;
            fs.writeFile("./daily.json", JSON.stringify(daily, null, 4), err => { if(err) throw err; });
        }
        if(wumpusData.roleTime < daily.EndOfTheMonthInMilliSeconds) {
            if(currencyData.bits >= database.config.WumpusRoleCost) {
                currencyData.bits -= database.config.WumpusRoleCost;
                database.SetCurrencyData(currencyData);
                wumpusData.roleTime = daily.EndOfTheMonthInMilliSeconds + database.config.DayInMilliSeconds;
                database.SetWumpusData(wumpusData);
                if(!message.member.roles.has(database.config.WumpusRoleId)) message.member.addRole(database.config.WumpusRoleId);
            } else {
                database.DeleteWumpusData(message.author.id);
                delete wumpusData;
                message.member.removeRole(database.config.WumpusRoleId, "Did not have enough bits.");
            }
        } else if(!message.member.roles.has(database.config.WumpusRoleId)) message.member.addRole(database.config.WumpusRoleId);
    } else if(!message.member.roles.has(database.config.WumpusRoleId)) message.member.addRole(database.config.WumpusRoleId);
}