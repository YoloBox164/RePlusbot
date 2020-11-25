const Settings = require("../../settings.json");

const Discord = require("discord.js");

// TODO Finish it

module.exports = {
    /**
     * @param {Discord.Client} bot The bot itself.
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: (bot, message, args) => {
        const pollChannel = message.channel;
        const logChannel = bot.channels.resolve(Settings.Channels.modLogId);

        const startEmbed = new Discord.MessageEmbed();

        message.author.send({ embed: startEmbed }).then(msg => {
            message.channel.send(`Szavazás tervező elküldvie ${message.member} számára.`);
            const filter = m => m.content.startsWith(Settings.Prefix);
            const collector = msg.channel.createMessageCollector(filter);
        }).catch(reason => {
            console.error(reason);
            message.channel.send("Szavazás tervezőt nem tudtam elküldeni.");
        });
    },
    args: true,
    dev: true,
    name: "poll",
    aliases: ["szavazas", "szavazás", "szavaz"],
    desc: "",
    usage: ">poll"
};