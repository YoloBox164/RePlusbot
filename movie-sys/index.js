const Discord = require('discord.js');
const fs = require('fs');

const Settings = require('../settings.json');
const Database = require('../database');

const MovieMessagesJSONPath = "./movie-sys/movie-msg.json";

const TicketPrice = 250 //Bit

/** @typedef {Object<string, {ChannelId:string,AuthorId:string}>} MovieMsgJSON */

module.exports = {
    /** @param {Discord.Client} bot */
    CacheMovieMessages: function(bot) {
        const MovieMessages = this.GetJSON();
        for(const messageId in MovieMessages) {
            if(MovieMessages.hasOwnProperty(messageId)) {
                const movieMsgData = MovieMessages[messageId];
                /** @type {Discord.TextChannel} */
                const channel = bot.channels.resolve(movieMsgData.ChannelId);
                if(!channel) { this.RemoveFromJSON(messageId); continue; }
                channel.messages.fetch(messageId, true).catch(reason => {
                    channel.guild.members.cache.forEach(m => m.roles.remove(Settings.Roles.TicketRoleId));
                    this.RemoveFromJSON(messageId);
                    console.log("Deleted Data FROM JSON and removed roles from members. Reason:", reason);
                });
            }
        }
    },

    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
    */
    CheckReaction: function(reaction, user) {
        const MovieMessages = this.GetJSON();
        if(reaction.emoji.name !== Settings.emojis.ticket) return;
        if(!MovieMessages[reaction.message.id]) return;
        if(user.bot) return;
        var currencyData = Database.GetData('currency', user.id);
        currencyData.bits -= TicketPrice;
        let member = reaction.message.guild.member(user);
        member.roles.add(Settings.Roles.TicketRoleId).then(() => Database.SetData('currency', currencyData)).catch(console.error);
    },

    /** @param {Discord.Message} message */
    CheckDeletedMsg: function(message) {
        const MovieMessages = this.GetJSON();
        if(!MovieMessages[`${message.id}`]) return;

        this.RemoveFromJSON(message.id);
        message.guild.members.cache.forEach(m => m.roles.remove(Settings.Roles.TicketRoleId));
    },

    /** @returns {MovieMsgJSON} */
    GetJSON: function() { 
        return JSON.parse(fs.readFileSync(MovieMessagesJSONPath));
    },

    /** @param {MovieMsgJSON} MovieMessages */
    AddToJSON: function(MovieMessages) {
        fs.writeFileSync(MovieMessagesJSONPath, JSON.stringify(MovieMessages, null, 4), err => { if(err) throw err; });
    },

    /** @param {string} messageId */
    RemoveFromJSON: function(messageId) {
        const MovieMessages = this.GetJSON();
        delete MovieMessages[`${messageId}`];
        fs.writeFileSync(MovieMessagesJSONPath, JSON.stringify(MovieMessages, null, 4), err => { if(err) throw err; });
    }
}

