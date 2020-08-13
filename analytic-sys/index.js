const Discord = require("discord.js");
const fs = require("fs");

const AnalyticDatabase = require("./database");
const Database = require("../database");

const usersPath = "./analytic-sys/users/"; // Path is relative to bot.js

/**
 * @typedef userData
 * @type {object}
 * @property {string} tag
 * @property {Object} lastVoiceChannel
 * @property {string} lastVoiceChannel.id
 * @property {number} lastVoiceChannel.joinedTimestampt
 * @property {number} lastVoiceChannel.leavedTimestampt
 * @property {Object} stats
 * @property {number} stats.allTime
 * @property {number} stats.messages
 * @property {number} stats.commandUses
 */

/*
oldChannelId => newChannelId
undefined => id | join
id => null | leave
*/

module.exports = {
    Init() {
        AnalyticDatabase.Connect().then(() => {
            GetAllUserData().then(allData => {
                allData.forEach((data, userId) => {
                    /** @type {import("../database").Users} */
                    const userData = {
                        id: userId,
                        allTime: data.stats.allTime,
                        commandUses: data.stats.commandUses,
                        messages: data.stats.messages,
                        tag: data.tag
                    };
                    Database.SetData("Users", userData).then(rows => console.log(rows)).catch(console.error);
                });
            });
        });
    },
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
        const userData = GetUserData(userId);
        userData.stats.messages += 1;
        if(isCommandTrue) userData.stats.commandUses += 1;
        WriteUserData(userId, userData);
    }
};

/**
 * @param {import("discord.js").VoiceState} oldVoiceState
 * @param {import("discord.js").VoiceState} newVoiceState
*/
function VoiceLogger(oldVoiceState, newVoiceState) {
    if(oldVoiceState.channelID == newVoiceState.channelID) return;

    const voiceLog = Log();
    voiceLog.channelId = newVoiceState.channelID;
    voiceLog.userId = newVoiceState.id;
    voiceLog.timestampt = Date.now();

    AnalyticDatabase.AddData(voiceLog);
}

/** @returns {Promise<import("discord.js").Collection<string, userData>>} */
function GetAllUserData() {
    /** @type {Promise<Discord.Collection<string, userData>>} */
    const promise = new Promise((resolve, reject) => {
        /** @type {Discord.Collection<string, userData>} */
        const users = new Discord.Collection();
        fs.readdir(usersPath, (err, files) => {
            if(err) reject(err);

            const jsonfiles = files.filter(f => f.split(".").pop() === "json");
            if(jsonfiles.length <= 0) return;

            jsonfiles.forEach(file => {
                if(fs.existsSync(usersPath + file)) {
                    const userId = file.split(".")[0];
                    /** @type {userData} */
                    const userData = JSON.parse(fs.readFileSync(usersPath + file));
                    users.set(userId, userData);
                }
            });
            resolve(users);
        });
    });
    return promise;
}
module.exports.GetAllUserData = GetAllUserData;

/**
 * @param {string} userId
 * @returns {userData}
*/
function GetUserData(userId) {
    let userData = User();
    if(fs.existsSync(usersPath + `${userId}.json`)) {
        userData = JSON.parse(fs.readFileSync(usersPath + `${userId}.json`));
    }
    return userData;
}
module.exports.GetUserData = GetUserData;

/**
 * @param {string} userId
 * @param {userData} userData
*/
function WriteUserData(userId, userData) {
    fs.writeFileSync(usersPath + `${userId}.json`, JSON.stringify(userData, null, 4), err => {throw err;});
}
module.exports.WriteUserData = WriteUserData;

/** @returns {voiceLogData} */
function Log() {
    const log = {
        userId: "",
        channelId: "",
        timestampt: 0
    };
    return log;
}

/** @returns {userData} */
function User() {
    const user = {
        tag: "",
        lastVoiceChannel: {
            id: "",
            joinedTimestampt: 0,
            leavedTimestampt: 0
        },
        stats: {
            allTime: 0,
            messages: 0,
            commandUses: 0
        }
    };
    return user;
}