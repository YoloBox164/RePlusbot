const Discord = require('discord.js');

const Tools = require('../../utils/tools.js');
const Settings = require('../../settings.json');
const { MuteHandler } = require('../../sec-sys');

const Times = {
    millis: {
        mh: 2629800000,
        w: 604800017,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000,
    },
    names: {
        mh: "hónap",
        w: "hét",
        d: "nap",
        h: "óra",
        m: "perc",
        s: "másodperc"
    },
    types: ["mh", "w", "d", "h", "m", "s"],
    GetHelpArray: function() {
        let helpTypeNames = [];
        for(const type in this.names) {
            if (this.names.hasOwnProperty(type)) {
                const name = this.names[type];
                helpTypeNames.push(`\`${type}: ${name}\``)
            }
        }
        return helpTypeNames;
    }
};

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("MUTE_MEMBERS", true)) {
        message.channel.send("Nincsen jogod használni ezt a paracsot.");
        return;
    }
    if(!args[0]) {
        message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.help.usage}\``);
        return;
    }
    let target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, '');
    let target_member = message.guild.member(target_memberId);
    if(!target_member) {
        message.channel.send(`Nincs ilyen felhasználó vagy nem lett meg adva.\`Segítség => ${this.help.usage}\``);
        return;
    }
    if(target_member.id == message.member.id) {
        message.channel.send("Magadat nem némíthatod le");
        return;
    }

    let time = args[1];
    let regExp = new RegExp(/(\d+)(mh|w|d|h|m|s)/g);
    let match = regExp.exec(time);

    if(!time || !match) {
        message.channel.send(`Nem adtál meg időt vagy hozzá idő típust. Helyes használat és típusok: \`${this.help.usage}\`\n${Times.GetHelpArray().join(" | ")}`);
        return;
    }

    let timeNum = parseInt(match[1]);
    let millis = Times.millis[match[2]];

    if(!millis) {
        message.channel.send(`Nem adtál meg helyes időt, helyes idő típusok: ${Times.GetHelpArray().join(" | ")}`);
        return;
    }

    MuteHandler.Add(target_member, timeNum * millis);
    message.channel.send("Sikeres némítás.");
}

module.exports.help = {
    cmd: "mute",
    alias: ["nemit", "némit"],
    name: "Mute",
    desc: "",
    usage: ">mute [felhasználó említés] <idő>"
}