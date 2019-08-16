const Discord = require('discord.js');
const bot = new Discord.Client();

const functions = require('./functions.js');
const database = require('./database.js');

const fs = require('fs');
const colors = require('colors/safe');

const CONFIG = require('./config.json');

const prefix = CONFIG.Prefix;

bot.owner = "333324517730680842";
bot.commands = new Discord.Collection();
var cmds = [];

loadCmds();

bot.login(CONFIG.TOKEN).catch(console.error);

bot.on('ready', () => {
    database.PrepareCurrencyTable();
    console.log("Bot is ready!");
});

bot.on('message', message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;
    if(!message.content.startsWith(prefix)) return;

    var messageArray = message.content.split(/ +/g);
    var command = messageArray[0].toLowerCase().slice(prefix.length);
    var args = [];

    if(!command && messageArray[1]) {
        command = messageArray[1].toLowerCase();
        args = messageArray.slice(2);
    } else args = messageArray.slice(1);

    if(command === "eval" && bot.owner === message.author.id) {
        try {
            console.log(colors.red("WARN: eval being used by " + message.author.username));
            const code = args.join(" ");
            var evaled = eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            message.channel.send(clean(evaled), {code:"xl", split: [{char: '\n'}] }).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``).catch(error => {console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`)});
        }
    } else {
        var cmd = bot.commands.get(command);
        if(cmd) cmd.run(bot, message, args);
    }
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