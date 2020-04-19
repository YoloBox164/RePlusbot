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
    if(!time) {
        message.channel.send(`Nem adtál meg időt, helyes használat: \`${this.help.usage}\``);
        return;
    }

    //This way it keeps the formatting unlike the args.slice(1).join(" ");
    var text = message.content.slice(Settings.Prefix.length + this.help.cmd.length + 1 + time.length + 1); //The ones are spaces

    var embed = new Discord.RichEmbed()
        .setAuthor(message.member.displayName, message.author.avatarURL)
        .setTitle("🎉 Giveaway! 🎉")
        .setColor(message.member.displayHexColor)
        .setDescription(text);
    
    message.channel.send({embed: embed}).then(/**@param {Discord.Message} msg */msg =>  {
        msg.react(rEmoji);
        var regExp = new RegExp(/\d+([mhwds]+)/g);
        var match = regExp.exec(time);
        console.log(match);
        var type = match[1];
        if(type) {
            console.log(type);
            times.types.forEach(t => {
                console.log(t);
                if(type == t) {
                    /** @type {number} */
                    var date = Date.now() + times.millis[`${t}`];
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