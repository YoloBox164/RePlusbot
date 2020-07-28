const Discord = require('discord.js');
const colors = require('colors/safe');
const fs = require('fs');

const Database = require('./database');

const usersPath = "./analytic-sys/database/users/"; //Path is relative to bot.js

/**
 * @typedef voiceLogData
 * @type {object}
 * @property {number} id
 * @property {string} userId
 * @property {?string} channelId
 * @property {number} timestampt
*/

/**
 * @typedef userTextChannelData
 * @type {object}
 * @property {string} id
 * @property {string} name
 * @property {number} messages
 * @property {number} commandUses
 * 
 * @typedef userVoiceChannelData
 * @type {object}
 * @property {string} id
 * @property {string} name
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
 * @property {Object} lastVoiceChannel
 * @property {string} lastVoiceChannel.id
 * @property {number} lastVoiceChannel.joinedTimestampt
 * @property {number} lastVoiceChannel.leavedTimestampt
 * @property {Object} stats
 * @property {number} stats.allTime
 * @property {number} stats.messages
 * @property {number} stats.commandUses
 * @property {Object<string, userTextChannelData>} textChannels
 * @property {Object<string, userVoiceChannelData>} voiceChannels
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

    const userId = newVoiceState.id
    const userData = GetUserData(userId);
    if(!userData.voiceChannels) userData.voiceChannels = {};

    const query = "SELECT * FROM logs WHERE userId = ? ORDER BY id DESC LIMIT 2;";
    /**@type {Array<voiceLogData>}*/
    const last2Data = Database.SQLiteDb.prepare(query).all(userId); //Data[0] New Data | Data[1] Old Data
    if(last2Data.length < 2) return;
    //only if leaving or changing channels
    if(oldVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
        const pastTime = last2Data[0].timestampt - last2Data[1].timestampt;
        userData.stats.allTime += pastTime;

        if(!userData.voiceChannels[oldVoiceState.channelID]) {
            userData.voiceChannels[oldVoiceState.channelID] = {
                id: oldVoiceState.channelID,
                name: oldVoiceState.channel.name,
                time: pastTime,
                lastJoinTimestampt: last2Data[1].timestampt
            };
        } else {
            userData.voiceChannels[oldVoiceState.channelID].time += pastTime;
            userData.voiceChannels[oldVoiceState.channelID].lastJoinTimestampt = last2Data[1].timestampt;
        }
    }

    //If Joining or Changing channels
    if(newVoiceState.channelID && oldVoiceState.channelID != newVoiceState.channelID) {
        userData.lastVoiceChannel.id = newVoiceState.channelID;
        userData.lastVoiceChannel.joinedTimestampt = last2Data[0].timestampt;
        userData.lastVoiceChannel.leavedTimestampt = -1;
    }
    //if leaving channel
    else if(oldVoiceState.channelID && !newVoiceState.channelID) {
        userData.lastVoiceChannel.id = oldVoiceState.channelID;
        userData.lastVoiceChannel.joinedTimestampt = last2Data[1].timestampt;
        userData.lastVoiceChannel.leavedTimestampt = last2Data[0].timestampt;
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
    userData.stats.messages += 1;
    if(isCommandTrue) userData.stats.commandUses += 1;
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

/**@returns {Promise<Discord.Collection<string, userData>>} */
function GetAllUserData() {
    /** @type {Promise<Discord.Collection<string, userData>>} */
    const promise = new Promise((resolve, reject) => {
        /** @type {Discord.Collection<string, userData>} */
        const users = new Discord.Collection();
        fs.readdir(usersPath, (err, files) => {
            if(err) throw err;

            const jsonfiles = files.filter(f => f.split('.').pop() === "json");
            if(jsonfiles.length <= 0) return;
            
            jsonfiles.forEach(file => {
                if(fs.existsSync(usersPath + file)) {
                    const userId = file.split('.')[0];
                    /** @type {userData} */
                    const userData = JSON.parse(fs.readFileSync(usersPath + file));
                    if(userData.channels) { //Old json data
                        let fixedUserData = User();
                        fixedUserData.lastVoiceChannel = userData.lastVoiceChannel;
                        fixedUserData.stats.allTime = userData.stats.voice.allTime;
                        fixedUserData.stats.commandUses = userData.stats.text.commandUses;
                        fixedUserData.stats.messages = userData.stats.text.messages;
                        fixedUserData.voiceChannels = userData.channels;
                        WriteUserData(userId, fixedUserData);
                        users.set(userId, fixedUserData);
                    } else users.set(userId, userData);
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
        if(userData.channels) { //Old json data
            let fixedUserData = User();
            fixedUserData.lastVoiceChannel = userData.lastVoiceChannel;
            fixedUserData.stats.allTime = userData.stats.voice.allTime;
            fixedUserData.stats.commandUses = userData.stats.text.commandUses;
            fixedUserData.stats.messages = userData.stats.text.messages;
            fixedUserData.voiceChannels = userData.channels;
            WriteUserData(userId, fixedUserData);
            return fixedUserData;
        }
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
        lastVoiceChannel: {
            id: "",
            joinedTimestampt: 0,
            leavedTimestampt: 0
        },
        stats: {
            allTime: 0,
            messages: 0,
            commandUses: 0
        },
        textChannels: {},
        voiceChannels: {}
    };
    return user;
}