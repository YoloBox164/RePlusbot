const Discord = require("discord.js");

const colors = require('colors');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    try {
        console.log(colors.red("WARN: eval being used by " + message.member.displayName));
        const code = args.join(" ");
        var evaled = eval(code);

        if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
        message.channel.send(clean(evaled), {code:"xl", split: [{char: '\n'}] }).catch(error => {
            console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
        });
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``).catch(error => {
            console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
        });
    }
}

function clean(text) {
    if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
}

module.exports.help = {
    cmd: "eval"
}