const Discord = require("discord.js");
const AnalyticDatabase = require("./database");
const Database = require("../database");

/** @type {import("discord.js").Collection<string, import("discord.js").Collection<string, {start: number, end: number}>>} */
const offTimers = new Discord.Collection();

/*
 * ╔══════════════╦══════════════╦═══════╗
 * ║ oldChannelId ║ newChannelId ║ state ║
 * ╠══════════════╬══════════════╬═══════╣
 * ║ undefined    ║ string       ║ join  ║
 * ║ string       ║ null         ║ leave ║
 * ╚══════════════╩══════════════╩═══════╝
*/

module.exports = {
    Init() { AnalyticDatabase.Connect(); },
    Shut() { AnalyticDatabase.Connection.end(); },

    Database: AnalyticDatabase,

    /**
     * @param {import("discord.js").VoiceState} oldVoiceState
     * @param {import("discord.js").VoiceState} newVoiceState
    */
    voiceState(oldVoiceState, newVoiceState) {
        VoiceLogger(oldVoiceState, newVoiceState);

        const userId = newVoiceState.id;
        const userTag = newVoiceState.member.user.tag;

        if(newVoiceState.channelID) { // join or change
            const mutedMembers = newVoiceState.channel.members.filter(m => m.voice.mute);
            const usersOnOff = offTimers.get(newVoiceState.channelID);

            if(newVoiceState.channel.members.size === 1) {

            } else if(newVoiceState.channel.members.size > 1) {
                
            }
        }

        // only if leaving or changing channels
        if(oldVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
            CalcVoiceTime(userId, userTag);
        }
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
 * @param {string} userId
 * @param {string} userTag
 * @param {number} [offTime=0] By default it is 0
 */
function CalcVoiceTime(userId, userTag, offTime = 0) {
    AnalyticDatabase.GetData(userId).then(async last2Data => { // Data[0] New Data | Data[1] Old Data
        if(!last2Data) return;
        if(last2Data.length < 2) return;
        const userData = await Database.GetData("Users", userId);
        const pastTime = last2Data[0].timestampt - last2Data[1].timestampt;

        let allTime = pastTime - offTime;
        if(userData) allTime += userData.allTime;
        if(allTime < 0) allTime = 0;

        Database.SetData("Users", {
            id: userId,
            tag: userTag,
            allTime: allTime
        }).catch(console.error);
    });
}
/**
 * @param {import("discord.js").VoiceState} oldVoiceState
 * @param {import("discord.js").VoiceState} newVoiceState
*/
function VoiceLogger(oldVoiceState, newVoiceState) {
    if(oldVoiceState.channelID === newVoiceState.channelID) return;

    /** @type {import("./database").VoiceLogs} */
    const voiceLog = {
        channelId: newVoiceState.channelID,
        userId: newVoiceState.id,
        timestampt: Date.now()
    };

    AnalyticDatabase.AddData(voiceLog);
}
