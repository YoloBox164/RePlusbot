const Discord = require('discord.js');

/**
 * @param {Discord.VoiceState} oldVoiceState
 * @param {Discord.VoiceState} newVoiceState
*/
module.exports.voiceState = (oldVoiceState, newVoiceState) => {
    
}

function userTemplate() {
    var user = {
        current: {
            channelId: "",
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
                speakTime: 0,
                streamTime: 0,
                selfMute: 0,
                selfDeaf: 0,
                serverMute: 0,
                serverDeaf: 0
            },
            text: {
                messages: 0,
                commandUses: 0
            }
        },
        mostUsedChannel: "",
        lastChannel: {
            id: "",
            timestampt: 0
        },
        warnings: {}
    };
    return user;
}

function channelTemplate() {
    var channel = {
        users: {},
        top10User: {},
        lastJoin: {
            userId: "",
            timestampt: 0
        }
    };
    return channel;
}

const state = {
    JOIN: 0,
    LEAVE: 1
};

function logTemplate() {
    var log = {
        userId: "",
        channelId: "",
        timestampt: 0,
        joinLeave: state.JOIN
    };
    return log;
}