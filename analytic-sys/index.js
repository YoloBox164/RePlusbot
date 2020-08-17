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
                if(last2Data.length < 2) return;
                // only if leaving or changing channels
                if(oldVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
                    const pastTime = last2Data[0].timestampt - last2Data[1].timestampt;
                    userData.allTime += pastTime;
                }
                Database.SetData("Users", userData);
            });
        }).catch(console.error);
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
