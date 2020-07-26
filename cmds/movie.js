const Discord = require('discord.js');
const fs = require('fs');

const Settings = require('../settings.json');
/** @type {Object<string, {ChannelId:string,AuthorId:string}>} */
const MovieMessages = require('../movie-sys/movie-msg.json');
/** Relative to bot.js */
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
    console.log(match);
    if(match.groups.guildId != message.guild.id) { console.log("mismatch of guilds"); return; }
    /** @type {Discord.TextChannel} */
    let movieMsgChannel = bot.channels.resolve(match.groups.channelId);
    if(!movieMsgChannel) { console.log("not found channel"); return; }
    movieMsgChannel.messages.fetch(match.groups.messageId, true).then(movieMsg => {
        MovieMessages[`${movieMsg.id}`] = {
            AuthorId: movieMsg.author.id,
            ChannelId: movieMsgChannel.id
        }
        fs.writeFile(MovieMessagesJSONPath, JSON.stringify(MovieMessages, null, 4), err => { if(err) throw err; });
        movieMsg.react(Settings.emojis.ticket);
        message.channel.send("Sikeresen létrehoztál egy jegy vásárlói üzenetet. Az üzenet törlésével tudod megállítani a jegyek vásárlását.");
    }).catch(console.error);

}

module.exports.help = {
    cmd: "movie",
    alias: ["film"],
    name: "Movie",
    desc: "Ezzel a parancsal tudsz üzeneteket jegy vásárlói üzeneté tenni. Egészen addig érvényes egy ilyen üzenet amíg az nem kerül törlésre.",
    usage: ">movie [Discord Üzenet Link]",
    category: "staff"
}