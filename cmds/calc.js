const Discord = require("discord.js");
const math = require('mathjs');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(!args[0]) return message.channel.send("Hibás bevitel");

    let res;
    try {
        res = math.evaluate(args.join(' '));
    } catch (e) {
        return message.channel.send("Hibás bevitel")
    }

    const embed = new Discord.MessageEmbed()
        .setColor(0xffffff)
        .setTitle('Matematika számítás')
        .addField('Bemenet', `\`\`\`js\n${args.join("")}\`\`\``)
        .addField('Kimenet', `\`\`\`js\n${res}\`\`\``);

    message.channel.send({embed: embed});
}

module.exports.help = {
    cmd: "calc",
    alias: ["calculate"],
    name: "Számítás",
    desc: "Konkrétan egy számológép.",
    usage: ">calc [számítás] pl.: >calc 1+1",
    category: "felhasználói"
}