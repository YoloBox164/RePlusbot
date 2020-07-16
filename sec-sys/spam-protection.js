const Discord = require('discord.js');

/**
 * @typedef userData
 * @type {Object}
 * @property {number} messageCount
 * @property {Discord.Collection<String, Discord.Message>} messages
 * @property {Discord.Message} lastMessage
 * @property {NodeJS.Timeout} timeout
*/

/** @type {Discord.Collection<String, userData> */
let userCollection = new Discord.Collection();

module.exports.help = {
    TimeDifferenceTreshold: 2500, //milliseconds
    MessageTreshold: 5,
    TimeoutTimer: 5000 //milliseconds
}

module.exports = {
    /** @param {Discord.Message} message */
    Check: (message) => {
        let userData = userCollection.get(message.author.id);
        if(userData) {
            let difference = message.createdTimestamp - userData.lastMessage.createdTimestamp;
            console.log(difference);
            if(difference > this.help.TimeDifferenceTreshold) {
                clearTimeout(userData.timeout);
                let messages = CreateMessageCollecton();
                messages.set(message.id, message);
                userData = {
                    messageCount: 1,
                    messages: messages,
                    lastMessage: message,
                    timeout: setTimeout(() => {
                        userCollection.delete(message.author.id);
                        console.log("Removed user from spam collection.");
                    }, this.help.TimeoutTimer)
                }
                userCollection.set(message.author.id, userData);
            } else {
                userData.messageCount++;
                if(userData.messageCount > this.help.MessageTreshold) {
                    userData.messages.forEach(msg => { if(msg.deletable) msg.delete(); });
                    console.log("Spam!");
                } else {
                    userData.lastMessage = message;
                    userData.messages.set(message.id, message);
                    userCollection.set(message.author.id);
                }
            }
        } else {
            let messages = CreateMessageCollecton();
            messages.set(message.id, message);
            userData = {
                messageCount: 1,
                messages: messages,
                lastMessage: message,
                timeout: setTimeout(() => {
                    userCollection.delete(message.author.id);
                    console.log("Removed user from spam collection.");
                }, this.help.TimeoutTimer)
            }
            userCollection.set(message.author.id, userData);
        }
    }
}

/** @returns {Discord.Collection<String, Discord.Message>} */
function CreateMessageCollecton() { return new Discord.Collection(); }