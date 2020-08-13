const Discord = require("discord.js");
const AnalyticDatabase = require("./database");
const Database = require("../database");


/*
oldChannelId => newChannelId
undefined => id | join
id => null | leave
*/

module.exports = {
    Init() { AnalyticDatabase.Connect(); },
    Shut() { AnalyticDatabase.Connection.end(); },

    /**
     * @param {import("discord.js").VoiceState} oldVoiceState
     * @param {import("discord.js").VoiceState} newVoiceState
    */
    voiceState(oldVoiceState, newVoiceState) {
        VoiceLogger(oldVoiceState, newVoiceState);

        const userId = newVoiceState.id;
        Database.GetData("Users", userId).then(userData => {
            if(userData.tag !== oldVoiceState.member.user.tag) {
                userData.tag = oldVoiceState.member.user.tag;
            }
            AnalyticDatabase.GetData(userId).then(last2Data => { // Data[0] New Data | Data[1] Old Data
                console.log(last2Data);
                if(last2Data.length < 2) return;
                // only if leaving or changing channels
                if(oldVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
                    const pastTime = last2Data[0].timestampt - last2Data[1].timestampt;
                    userData.stats.allTime += pastTime;
                }
                Database.SetData("Users", userData);
            });
        }).catch(err => {throw err;});
    },

    /**
     * @param {import("discord.js").Message} message
     * @param {boolean} isCommandTrue
    */
    messageCountPlus(message, isCommandTrue) {
        const userId = message.author.id;
        Database.GetData("Users", userId).then(userData => {
            if(!userData) {
                userData = {
                    id: userId,
                    tag: message.author.tag,
                    messages: 1,
                    commandUses: 1
                };
            } else {
                userData.messages += 1;
                if(isCommandTrue) userData.commandUses += 1;
            }
            Database.SetData("Users", userData);
        }).catch(err => {throw err;});
    },

    /** @returns {Promise<import("discord.js").Collection<string, import("../database").Users>>} */
    GetAllUserData() {
        /** @type {Promise<Discord.Collection<string, import("../database").Users>>} */
        const promise = new Promise((resolve, reject) => {
            /** @type {Discord.Collection<string, import("../database").Users>} */
            const users = new Discord.Collection();
            Database.Connection.query("SELECT * FROM Users").then(rows => {
                rows.forEach(row => { users.set(row.id, row); });
                resolve(users);
            }).catch(reject);
        });
        return promise;
    }
};

/**
 * @param {import("discord.js").VoiceState} oldVoiceState
 * @param {import("discord.js").VoiceState} newVoiceState
*/
function VoiceLogger(oldVoiceState, newVoiceState) {
    if(oldVoiceState.channelID == newVoiceState.channelID) return;

    const voiceLog = {
        channelId: newVoiceState.channelID,
        userId: newVoiceState.id,
        timestampt: Date.now()
    };
    AnalyticDatabase.AddData(voiceLog);
}
