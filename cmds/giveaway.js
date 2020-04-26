const Discord = require("discord.js");

const fs = require('fs');

const Settings = require('../settings.json');

const times = {
    millis: {
        "mh": 2629800000,
        "w": 604800017,
        "d": 86400000,
        "h": 3600000,
        "m": 60000,
        "s": 1000,
    },
    names: {
        "mh": "month",
        "w": "week",
        "d": "day",
        "h": "hour",
        "m": "minutes",
        "s": "seconds",
    },
    types: ["mh", "w", "d", "h", "m", "s"]
};

const rEmoji = "🎉";

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var time = args[0];
    var regExp = new RegExp(/(\d+)(mh|w|d|h|m|s)/g);
    var match = regExp.exec(time);

    if(!time || !match) {
        message.channel.send(`Nem adtál meg időt, helyes használat: \`${this.help.usage}\``);
        return;
    }

    var timeNum = parseInt(match[1]);
    var type = match[2];

    //This way it keeps the formatting unlike the args.slice(1).join(" ");
    var text = message.content.slice(Settings.Prefix.length + this.help.cmd.length + 1 + time.length + 1); //The ones are spaces

    var embed = new Discord.MessageEmbed()
        .setAuthor(message.member.displayName, message.author.avatarURL)
        .setTitle("🎉 Giveaway! 🎉")
        .setColor(message.member.displayHexColor)
        .setDescription(text);
    
    message.channel.send({embed: embed}).then(/**@param {Discord.Message} msg */msg =>  {
        msg.react(rEmoji);
        if(type) {
            times.types.forEach(t => {
                if(type == t) {
                    /** @type {number} */
                    var date = Date.now() + (timeNum * times.millis[`${t}`]);
                    var data = {};
                    data[`${msg.id}`] = {
                        date: date,
                        channelId: msg.channel.id
                    };
                    console.log(data);
                    fs.writeFile("./giveaways.json", JSON.stringify(data, null, 4), err => { if(err) throw err; });
                }
            });
        }
    }).catch(console.error);
}

module.exports.help = {
    cmd: "giveaway",
    alias: [],
    name: "Giveaway",
    desc: "Leírás",
    usage: ">giveaway [Idő] [Szöveg]",
    category: "staff"
}