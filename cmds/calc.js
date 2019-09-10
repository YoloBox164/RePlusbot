const Discord = require("discord.js");
const math = require('mathjs');

module.exports.run = async (bot, message, args) => {
    if(!args[0]) return message.channel.send("Invalid input");

    let res;
    try {
        res = math.eval(args.join(' '));
    } catch (e) {
        return message.channel.send("Invalid input")
    }

    const embed = new Discord.RichEmbed()
        .setColor(0xffffff)
        .setTitle('Math calculation')
        .addField('Input', `\`\`\`js\n${args.join("")}\`\`\``)
        .addField('Output', `\`\`\`js\n${res}\`\`\``);

    message.channel.send({embed: embed});
}

module.exports.help = {
    cmd: "calc",
    alias: ["calculate"],
    name: "Calculations",
    desc: "You can calculate almost everything!",
    usage: ">calc [calculation] e.g.: >calc 1+1",
    category: "user"
}