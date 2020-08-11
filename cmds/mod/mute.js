const Discord = require("discord.js");

const Tools = require("../../utils/tools");
const Settings = require("../../settings.json");
const { MuteHandler } = require("../../sec-sys");

const Times = {
    millis: {
        mh: 2629800000,
        w: 604800017,
        d: 86400000,
        h: 3600000,
        m: 60000,
        s: 1000
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
        const helpTypeNames = [];
        for(const type in this.names) {
            if (this.names[type]) {
                const name = this.names[type];
                helpTypeNames.push(`\`${type}: ${name}\``);
            }
        }
        return helpTypeNames;
    }
};

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: async (message, args) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("MUTE_MEMBERS", true)) {
            message.channel.send("Nincsen jogod használni ezt a paracsot.");
            return;
        }
        if(!args[0]) {
            message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.usage}\``);
            return;
        }
        const target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, "");
        const target_member = message.guild.member(target_memberId);
        if(!target_member) {
            message.channel.send(`Nincs ilyen felhasználó vagy nem lett meg adva.\`Segítség => ${this.usage}\``);
            return;
        }
        if(target_member.id == message.member.id) {
            message.channel.send("Magadat nem némíthatod le");
            return;
        }

        const time = args[1];
        const regExp = new RegExp(/(\d+)(mh|w|d|h|m|s)/g);
        const match = regExp.exec(time);

        if(!time || !match) {
            message.channel.send(`Nem adtál meg időt vagy hozzá idő típust. Helyes használat és típusok: \`${this.usage}\`\n${Times.GetHelpArray().join(" | ")}`);
            return;
        }

        const timeNum = parseInt(match[1]);
        const millis = Times.millis[match[2]];

        if(!millis) {
            message.channel.send(`Nem adtál meg helyes időt, helyes idő típusok: ${Times.GetHelpArray().join(" | ")}`);
            return;
        }

        MuteHandler.Add(target_member, timeNum * millis);
        message.channel.send("Sikeres némítás.");
    },
    args: true,
    name: "mute",
    aliases: ["nemit", "némit"],
    desc: "",
    usage: ">mute [felhasználó említés] <idő>"
};