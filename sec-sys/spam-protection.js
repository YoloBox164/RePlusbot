const Discord = require("discord.js");

const EmbedTemplates = require("../utils/embed-templates");
const Settings = require("../settings.json");

const MuteHandler = require("./mute-handler");

/**
 * @typedef userData
 * @type {Object}
 * @property {number} messageCount
 * @property {Discord.Collection<String, Discord.Message>} messages
 * @property {Discord.Message} lastMessage
 * @property {NodeJS.Timeout} timeout
*/

/** @type {Discord.Collection<String, userData> */
const userCollection = new Discord.Collection();

module.exports.help = {
    /** 2.5 sec in milliseconds*/
    TimeDifferenceTreshold: 2500,
    MessageTreshold: 5,
    /** 5 sec in milliseconds*/
    TimeoutTimer: 5000,
    FirstLast: {
        DifferenceTreshold: 1000,
        MessageTreshold: 2
    },
    HalfAnHoureInMilliseconds: 1800000,
    /** 5 min in milliseconds*/
    MuteTime: 320000
};

module.exports = {
    /**
     * @param {Discord.Message} message
     * @returns {boolean}
    */
    CheckTime: (message) => {
        let userData = userCollection.get(message.author.id);
        if(userData) {
            userData.messageCount++;
            userData.messages.set(message.id, message);

            const difference = message.createdTimestamp - userData.lastMessage.createdTimestamp;
            const firstLastDifference = userData.messages.last().createdTimestamp - userData.messages.first().createdTimestamp;

            if(difference > this.help.TimeDifferenceTreshold) {
                clearTimeout(userData.timeout);
                const messages = CreateMessageCollecton();
                messages.set(message.id, message);

                userData = {
                    messageCount: 1,
                    messages: messages,
                    lastMessage: message,
                    timeout: setTimeout(() => userCollection.delete(message.author.id), this.help.TimeoutTimer)
                };

                userCollection.set(message.author.id, userData);
            } else if(userData.messages.size > this.help.FirstLast.MessageTreshold
              && this.help.FirstLast.DifferenceTreshold > firstLastDifference) {
                message.channel.bulkDelete(userData.messages).catch(console.error);
                clearTimeout(userData.timeout);
                userCollection.delete(message.author.id);

                MuteHandler.Add(message.member, this.help.MuteTime);

                const seconds = firstLastDifference / 1000;
                const embed = EmbedTemplates.SpamDelete(message, `${userData.messages.size} üzenet ${seconds} másodperc alatt.`);
                /** @type {Discord.TextChannel} */
                const logChannel = message.client.channels.resolve(Settings.Channels.automodLogId);
                logChannel.send({ embed: embed });
                message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${userData.messages.size} üzenetet küldtél ${seconds} másodperc alatt.**`);

                return true;
            } else if(userData.messageCount > this.help.MessageTreshold) {
                userData.messages.set(message.id, message);
                message.channel.bulkDelete(userData.messages).catch(console.error);
                clearTimeout(userData.timeout);
                userCollection.delete(message.author.id);

                MuteHandler.Add(message.member, this.help.MuteTime);

                const embed = EmbedTemplates.SpamDelete(message, `${userData.messages.size} üzenet kevesebb mint 5 másodperc alatt.`);
                /** @type {Discord.TextChannel} */
                const logChannel = message.client.channels.resolve(Settings.Channels.automodLogId);
                logChannel.send({ embed: embed });
                message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${userData.messages.size} üzenetet küldtél kevesebb mint 5 másodperc alatt.**`);

                return true;
            } else {
                userData.lastMessage = message;
                userData.messages.set(message.id, message);
                userCollection.set(message.author.id, userData);
            }
        } else {
            const messages = CreateMessageCollecton();
            messages.set(message.id, message);
            userData = {
                messageCount: 1,
                messages: messages,
                lastMessage: message,
                timeout: setTimeout(() => userCollection.delete(message.author.id), this.help.TimeoutTimer)
            };
            userCollection.set(message.author.id, userData);
        }
        return false;
    },
    /**
     * @param {Discord.Message} message
     * @returns {boolean}
    */
    CheckContent: (message) => {
        const userData = userCollection.get(message.author.id);
        // console.log(userData.lastMessage.content);
        if(userData && !message.content.startsWith(">")
          && message.content == userData.lastMessage.content
          && userData.lastMessage.createdTimestamp < Date.now() - this.help.HalfAnHoureInMilliseconds) {
            message.channel.bulkDelete(userData.messages).catch(console.error);
            clearTimeout(userData.timeout);
            userCollection.delete(message.author.id);
            console.log("Spam! Delete by content.");
            return true;
        }
        return false;
    }
};

/** @returns {Discord.Collection<String, Discord.Message>} */
function CreateMessageCollecton() { return new Discord.Collection(); }
