const fs = require('fs');
const convert = require('convert-units');
const Discord = require('discord.js');
const Tools = require('../../utils/tools.js');
const SETTINGS = require('../../settings.json');

//const MUTES = require('../mute.json');

const timeHelpCollection = new Discord.Collection();
timeHelpCollection.set('y', {
    name: 'year',
    singluar: 'Year',
    pluar: 'Years'

});
timeHelpCollection.set('mh', {
    name: 'month',
    singluar: 'Month',
    pluar: 'Months'
});
timeHelpCollection.set('w', {
    name: 'week',
    singluar: 'Week',
    pluar: 'Weeks'
});
timeHelpCollection.set('d', {
    name: 'd',
    singluar: 'Day',
    pluar: 'Days'
});
timeHelpCollection.set('h', {
    name: 'h',
    singluar: 'Hour',
    pluar: 'Hours'
});
timeHelpCollection.set('m', {
    name: 'min',
    singluar: 'Minute',
    pluar: 'Minutes'
});
timeHelpCollection.set('s', {
    name: 's',
    singluar: 'Second',
    pluar: 'Seconds'
});

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    return;
}

module.exports.help = {
    cmd: "mute",
    alias: ["nemit", "némit"],
    name: "Mute",
    desc:
        `Voice and Text mute a user.
        
        Valid time formations: 
            \`s => seconds\`
            \`m => minute\`
            \`h => hour\`
            \`d => day\`
            \`w => week\`
            \`mh => month\`
            \`y => year\`
        If time was not given then it will be permament.`,
    usage: ">mute [username / mention / id] <time> <time type>",
    category: "moderator"

}