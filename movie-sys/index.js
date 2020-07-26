const Discord = require('discord.js');
const fs = require('fs');

const Settings = require('../settings.json');
const Database = require('../database');
/** @type {Object<string, {ChannelId:string,AuthorId:string,CloseTimestampt:number}>} */
const MovieMessages = require('./movie-msg.json');

const TicketPrice = 250 //Bit

module.exports = {
    /** @param {Discord.Client} bot */
    CacheMovieMessages: function(bot) {
        for(const messageId in MovieMessages) {
            if(MovieMessages.hasOwnProperty(messageId)) {
                const movieMsg = MovieMessages[messageId];
                /** @type {Discord.TextChannel} */
                const channel = bot.channels.resolve(movieMsg.ChannelId);
                if(channel) channel.messages.fetch(messageId, true).catch(console.error);
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
    },
    /**
     * @param {Discord.Client} bot The bot itself.
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    MakeReactable: function(bot, message, args) {
        if(!message.content.startsWith(`${Settings.Prefix}movie`)) return;
        if(!args[0]) return;
        let messageId = args[0];
    }
}