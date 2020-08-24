const Discord = require("discord.js");
const Database = require("../database");

const EmbedTemplates = require("../utils/embed-templates");

const MuteHandler = require("./mute-handler");

/**
 * @typedef userSpamData
 * @type {Object}
 * @property {number} messageCount
 * @property {Discord.Collection<String, Discord.Message>} messages
 * @property {Discord.Message} lastMessage
 * @property {NodeJS.Timeout} timeout
*/

/**
 * @typedef usesMsgContentData
 * @type {Object}
 * @property {Discord.Message} lastMessage
 * @property {NodeJS.Timeout} timeout
*/

/** @type {Discord.Collection<String, userSpamData> */
const userCollection = new Discord.Collection();
/** @type {Discord.Collection<String, usesMsgContentData> */
const userContentCollection = new Discord.Collection();

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
            userData.lastMessage = userData.messages.last();
            userData.messages.set(message.id, message);
            userCollection.set(message.author.id, userData);

            const difference = message.createdTimestamp - userData.lastMessage.createdTimestamp;
            const firstLastDifference = userData.messages.last().createdTimestamp - userData.messages.first().createdTimestamp;

            if(difference > this.help.TimeDifferenceTreshold) {
                clearTimeout(userData.timeout);
                const messages = CreateMessageCollecton();
                messages.set(message.id, message);

                userData = {
                    messageCount: 1,
                    messages: messages,
                    lastMessage: null,
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
                message.client.automodLogChannel.send({ embed: embed });
                message.channel.send(`**${message.member}, üzeneteid törölve lettek az automod által, mert ${userData.messages.size} üzenetet küldtél ${seconds} másodperc alatt.**\n\n*A jutalmad egy 5 perces némítás!* 😃`);

                UpdateDatabase(message, userData);

                return true;
            } else if(userData.messageCount > this.help.MessageTreshold) {
                userData.messages.set(message.id, message);
                message.channel.bulkDelete(userData.messages).catch(console.error);
                clearTimeout(userData.timeout);
                userCollection.delete(message.author.id);

                MuteHandler.Add(message.member, this.help.MuteTime);

                const embed = EmbedTemplates.SpamDelete(message, `${userData.messages.size} üzenet kevesebb mint 5 másodperc alatt.`);
                message.client.automodLogChannel.send({ embed: embed });
                message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${userData.messages.size} üzenetet küldtél kevesebb mint 5 másodperc alatt.**\n\n*A jutalmad egy 5 perces némítás!* 😃`);

                UpdateDatabase(message, userData);

                return true;
            }
        } else {
            const messages = CreateMessageCollecton();
            messages.set(message.id, message);
            userData = {
                messageCount: 1,
                messages: messages,
                lastMessage: null,
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
        if(message.content.startsWith(">")) return false;
        if(message.content.startsWith(message.client.devPrefix)) return false;
        if(message.content.startsWith("ch!")) return false;
        if(message.content.startsWith("m!")) return false;
        if(message.content.startsWith("m?")) return false;

        let userData = userContentCollection.get(message.author.id);

        if(userData && message.content !== ""
          && message.content.toLowerCase().trim() === userData.lastMessage.content.toLowerCase().trim()) {
            message.delete({ reason: "Has the same content as the previous message" }).catch(console.error);
            const embed = EmbedTemplates.SpamDelete(message, "Az üzenet tartalma megegyezett az előző üzenetével.");
            message.client.automodLogChannel.send({ embed: embed });
            message.channel.send(`**${message.member}, üzeneteid törölve lettek az automod által, mert az üzenet tartalma megegyezett az előző üzeneteddel.**`).then(msg => msg.delete({ timeout: 15000, reason: "cooldown timeout" }));
            return true;
        } else if(!userData) {
            userData = {
                lastMessage: message,
                timeout: setTimeout(() => userContentCollection.delete(message.author.id), this.help.HalfAnHoureInMilliseconds)
            };
            userContentCollection.set(message.author.id, userData);
        } else {
            userData.lastMessage = message;
            clearTimeout(userData.timeout);
            userData.timeout = setTimeout(() => userContentCollection.delete(message.author.id), this.help.HalfAnHoureInMilliseconds);
        }
        return false;
    }
};

/** @returns {Discord.Collection<String, Discord.Message>} */
function CreateMessageCollecton() { return new Discord.Collection(); }

/**
 * @date 2020-08-18
 * @param {import("discord.js").Message} message
 * @param {userSpamData} userSpamData
 */
function UpdateDatabase(message, userSpamData) {
    Database.GetData("Users", message.author.id).then(userData => {
        let warns = 0;
        let spams = 1;
        let exp = 0;
        if(userData) {
            spams += userData.spams;
            exp = userData.exp - userSpamData.messages.size * 10;
            if(exp < 0) exp = 0;
            warns = userData.warns;
        }
        if(spams === 3) {
            message.channel.send(`**${message.member}, ez a 3. spamed. Most egy hivatalos figyelmeztetést kapsz, ami a profilodon is meg fog látszani. Ha a következőkben folytatod a spamelést akkor ki leszel rúgva (kick) a szerveről.**`);
            warns++;
            /** @type {import("../database").Warnings} */
            const warning = {
                userId: message.author.id,
                time: Date.now(),
                warning: "Háromszori spamelés után járó figyelmeztetés!"
            };
            Database.SetData("Warnings", warning);
        }
        Database.SetData("Users", {
            id: message.author.id,
            tag: message.author.tag,
            spams: spams,
            exp: exp,
            warns: warns
        });
    });
}
