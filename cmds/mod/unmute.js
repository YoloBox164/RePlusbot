const fs = require("fs");

const Tools = require('../../utils/tools.js');
const SETTINGS = require('../../settings.json');
//const MUTES = require('../mute.json');

const Discord = require('discord.js');
/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    return;
}

module.exports.help = {
    cmd: "unmute",
    alias: ["visszanemit", "visszanémit"],
    name: "Unmute",
    desc: "Text and Voice unmute a user.",
    usage: ">unmute [user]",
    category: "moderator"
}