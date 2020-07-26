const Discord = require('discord.js');
const fs = require('fs');

const Settings = require('../settings.json');
const Database = require('../database');
/** @type {Object<string, {ChannelId:string,AuthorId:string}>} */
const MovieMessages = require('./movie-msg.json');
const MovieMessagesJSONPath = "./movie-sys/movie-msg.json";
const RegexpPatterns = require('../utils/regexp-patterns');

const TicketPrice = 250 //Bit

module.exports = {
    /** @param {Discord.Client} bot */
    CacheMovieMessages: function(bot) {
        for(const messageId in MovieMessages) {
            if(MovieMessages.hasOwnProperty(messageId)) {
                const movieMsgData = MovieMessages[messageId];
                /** @type {Discord.TextChannel} */
                const channel = bot.channels.resolve(movieMsgData.ChannelId);
                if(channel) channel.messages.fetch(messageId, true).catch(console.error);
                else {
                    delete MovieMessages[`${messageId}`];
                    fs.writeFile(MovieMessagesJSONPath, JSON.stringify(MovieMessages, null, 4), err => { if(err) throw err; });
                }
            }
        }
    },
    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
    */
    CheckReaction: function(reaction, user) {
        if(reaction.emoji.name !== Settings.emojis.ticket) return;
        if(!MovieMessages[reaction.message.id]) return;
        var currencyData = Database.GetData('currency', user.id);
        currencyData.bits -= TicketPrice;
        let member = reaction.message.guild.member(user);
        member.roles.add(Settings.Roles.TicketRoleId).then(() => Database.SetData('currency', currencyData)).catch(console.error);
    }
}