const Discord = require('discord.js');
const fs = require('fs');

const Settings = require('../settings.json');
/** @type {Object<string, {ChannelId:string,AuthorId:string}>} */
const MovieMessages = require('./movie-msg.json');
const MovieMessagesJSONPath = "./movie-sys/movie-msg.json";
const RegexpPatterns = require('../utils/regexp-patterns');

const Tools = require('../utils/tools');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
*/
module.exports.run = (bot, message, args) => {
    if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds)) {
        message.channel.send("Nincs jogosultságod ezt a parancsot használni.");
        return;
    }
    if(!args[0]) {
        message.channel.send("Nem találtam megfelelő Discord Üzenet Linket!");
        return;
    }
    let match = RegexpPatterns.DiscordMsgURL.exec(args[0]);
    if(!match || !match.groups) {
        message.channel.send("Nem találtam megfelelő Discord Üzenet Linket!");
        return;
    }
    if(match.groups.guildId != message.guild.id) return;
    /** @type {Discord.TextChannel} */
    let movieMsgChannel = bot.channels.resolve(match.groups.channelId);
    if(movieMsgChannel === null) return;
    let movieMsg = movieMsgChannel.messages.resolve(match.groups.messageId);
    if(movieMsg === null) return;
    MovieMessages[`${movieMsg.id}`] = {
        AuthorId: movieMsg.author.id,
        ChannelId: movieMsgChannel.id
    }
    fs.writeFile(MovieMessagesJSONPath, JSON.stringify(MovieMessages, null, 4), err => { if(err) throw err; });
    movieMsg.react(Settings.emojis.ticket);
    message.channel.send("Sikeresen létrehoztál egy jegy vásárlói üzenetet. Az üzenet törlésével tudod megállítani a jegyek vásárlását.");
}

module.exports.help = {
    cmd: "movie",
    alias: ["film"],
    name: "Movie",
    desc: "Ezzel a parancsal tudsz üzeneteket jegy vásárlói üzeneté tenni. Egészen addig érvényes egy ilyen üzenet amíg az nem kerül törlésre.",
    usage: ">movie [Discord Üzenet Link]",
    category: "staff"
}