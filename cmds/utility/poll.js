const Settings = require('../../settings.json');

const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
*/
module.exports.run = (bot, message, args) => {
    let pollChannel = message.channel;
    let logChannel = bot.channels.resolve(Settings.Channels.modLogId);

    let startEmbed = new Discord.MessageEmbed();

    message.author.send({embed: startEmbed}).then(msg => {
        message.channel.send(`Szavazás tervező elküldvie ${message.member} számára.`);
        const filter = m => m.content.startsWith(Settings.Prefix);
        const collector = msg.channel.createMessageCollector(filter);
    }).catch(reason => {
        console.error(reason);
        message.channel.send("Szavazás tervezőt nem tudtam elküldeni.");
    });
}

module.exports.help = {
    cmd: "poll",
    alias: ["szavazas", "szavazás", "szavaz"],
    name: "Szavazás",
    desc: "",
    usage: ">poll",
    category: "felhasználói"
}