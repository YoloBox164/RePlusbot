const Discord = require('discord.js');
const bot = new Discord.Client();

const functions = require('./functions.js');
const database = require('./database.js');
const daily = require('./daily.json');

const fs = require('fs');
const colors = require('colors/safe');

const CONFIG = require('./config.json');

const prefix = CONFIG.Prefix;

bot.devPrefix = '#>';
bot.devId = "333324517730680842";
bot.commands = new Discord.Collection();
var cmds = [];

loadCmds();

bot.login(CONFIG.TOKEN).catch(console.error);

bot.on('ready', () => {
    database.PrepareCurrencyTable();
    database.PrepareWumpusTable();
    console.log("Bot is ready!");
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
                console.log(colors.red("WARN: eval being used by " + message.author.username));
                const code = args.join(" ");
                var evaled = eval(code);
    
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                message.channel.send(clean(evaled), {code:"xl", split: [{char: '\n'}] }).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
            }
        } else if(command === "reloadcmds" || command === "reload" || command === "r") {
            loadCmds();
            message.channel.send("Commands successfully reloaded!");
        } else if(command === "shutdown" || command === "shut" || command === "s") {
            await bot.destroy().catch(console.error);
            process.exit(0);
        } else if(command === "t") {
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

        console.log(colors.green(`${message.member.displayName} is searching for the ${command} command.`));

        var CustomRoles = require('./roles.js');
        if(await CustomRoles.CheckModes(message, command)) return;

        var cmd = bot.commands.get(command);
        if(cmd) cmd.run(bot, message, args);

        console.log(colors.green(`${message.member.displayName} used the ${command} command.`));
    }
});

bot.on("guildMemberAdd", member => {
    member.addRole('611682388631617544');
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
            cmds.push(props.help.cmd);
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