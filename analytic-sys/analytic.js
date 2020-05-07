const Discord = require('discord.js');
const colors = require('colors/safe');
const fs = require('fs');

const Database = require('./database');

const usersPath = "./analytic-sys/database/users/";

/**
 * @typedef voiceLogData
 * @type {object}
 * @property {number} id
 * @property {string} userId
 * @property {?string} channelId
 * @property {number} timestampt
*/

/**
 * @typedef userChannelData
 * @type {object}
 * @property {string} id
 * @property {number} time
 * @property {number} lastJoinTimestampt
 * 
 * @typedef warning
 * @type {object}
 * @property {string} text
 * @property {number} time
 * 
 * @typedef userData
 * @type {object}
 * @property {Object} lastChannel
 * @property {string} lastChannel.id
 * @property {number} lastChannel.joinedTimestampt
 * @property {number} lastChannel.leavedTimestampt
 * @property {Object.<string, userChannelData>} channels
 * @property {Object} stats
 * @property {Object} stats.voice
 * @property {Object} stats.voice.activityHours
 * @property {number} stats.voice.activityHours.start
 * @property {number} stats.voice.activityHours.end
 * @property {number} stats.voice.allTime
 * @property {number} stats.voice.perDay
 * @property {number} stats.voice.streamTime
 * @property {Object} stats.text
 * @property {number} stats.text.messages
 * @property {number} stats.text.commandUses
 * @property {string} mostUsedChannelId
 * @property {Array<warning>} warnings
 */

/*
oldChannelId => newChannelId
undefined => id | join
id => null | leave
*/

module.exports.Init = () => {
    console.log(colors.yellow("Initializing Analytic System..."));
    Database.Prepare("logs");
    console.log(colors.yellow("Analytic System Ready!"));
}

module.exports.Shut = () => {
    Database.SQLiteDb.close();
}

/**
 * @param {Discord.VoiceState} oldVoiceState
 * @param {Discord.VoiceState} newVoiceState
*/
module.exports.voiceState = (oldVoiceState, newVoiceState) => {
    VoiceLogger(oldVoiceState, newVoiceState);

    var userId = newVoiceState.id
    var userData = GetUserData(userId);

    var query = "SELECT * FROM logs WHERE userId = ? ORDER BY id DESC LIMIT 2;";
    /**@type {Array<voiceLogData>}*/
    var last2Data = Database.SQLiteDb.prepare(query).all(userId); //Data[0] New Data | Data[1] Old Data
    if(last2Data.length < 2) return;
    //only if leaving or changing channels
    if(oldVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
        var pastTime = last2Data[0].timestampt - last2Data[1].timestampt;
        userData.stats.voice.allTime += pastTime;

        if(!userData.channels[oldVoiceState.channelID]) {
            userData.channels[oldVoiceState.channelID] = {
                id: oldVoiceState.channelID,
                time: pastTime,
                lastJoinTimestampt: last2Data[1].timestampt
            };
        } else {
            userData.channels[oldVoiceState.channelID].time += pastTime;
            userData.channels[oldVoiceState.channelID].lastJoinTimestampt = last2Data[1].timestampt;
        }
    }

    //If Joining or Changing channels
    if(newVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
        userData.lastChannel.id = newVoiceState.channelID;
        userData.lastChannel.joinedTimestampt = last2Data[0].timestampt;
        userData.lastChannel.leavedTimestampt = -1;
    }
    //if leaving channel
    else if(oldVoiceState.channelID && !newVoiceState.channelID) {
        userData.lastChannel.id = oldVoiceState.channelID;
        userData.lastChannel.joinedTimestampt = last2Data[1].timestampt;
        userData.lastChannel.leavedTimestampt = last2Data[0].timestampt;
    }

    WriteUserData(userId, userData);
}

/**
 * @param {Discord.Message} message
 * @param {boolean} isCommandTrue
*/
module.exports.messageCountPlus = (message, isCommandTrue) => {
    var userId = message.author.id;
    var userData = GetUserData(userId);
    if(!isCommandTrue) userData.stats.text.messages += 1;
    if(isCommandTrue) userData.stats.text.commandUses += 1;
    WriteUserData(userId, userData);
}

/**
 * @param {Discord.VoiceState} oldVoiceState
 * @param {Discord.VoiceState} newVoiceState
*/
function VoiceLogger(oldVoiceState, newVoiceState) {
    if(oldVoiceState.channelID == newVoiceState.channelID) return;

    var voiceLog = Log();
    voiceLog.channelId = newVoiceState.channelID;
    voiceLog.userId = newVoiceState.id;
    voiceLog.timestampt = Date.now();

    Database.AddData(voiceLog);
}

/**
 * @param {string} userId
 * @returns {userData}
*/
function GetUserData(userId) {
    var userData = User();
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
    var log = {
        userId: "",
        channelId: "",
        timestampt: 0
    };
    return log;
}

/** @returns {userData} */ 
function User() {
    var user = {
        lastChannel: {
            id: "",
            joinedTimestampt: 0,
            leavedTimestampt: 0
        },
        channels: {},
        stats: {
            voice: {
                activityHours: {
                    start: 0,
                    end: 0
                },
                allTime: 0,
                perDay: 0,
                streamTime: 0,
            },
            text: {
                messages: 0,
                commandUses: 0
            }
        },
        mostUsedChannelId: "",
        warnings: []
    };
    return user;
}