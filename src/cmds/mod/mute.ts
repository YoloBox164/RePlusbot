import { Message, MessageMentions } from "discord.js";
import Tools from "../../utils/tools";
import { Prefix, StaffIds } from "../../settings.json";
import { MuteHandler } from "../../systems/security";
import BaseCommand from "../../structures/base-command";

class Mute implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "mute";
    aliases = ["nemit", "némit"];
    desc = "";
    usage = `${Prefix}mute [felhasználó említés] <idő>`;

    public async execute(message: Message, args?: string[]) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, StaffIds) && !message.member.permissions.has("MUTE_MEMBERS", true)) {
            return message.channel.send("Nincsen jogod használni ezt a paracsot.");
        }
        if(!args[0]) {
            return message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.usage}\``);
        }
        const target_memberId = args[0].match(MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, "");
        const target_member = message.guild.member(target_memberId);
        if(!target_member) {
            return message.channel.send(`Nincs ilyen felhasználó vagy nem lett meg adva.\`Segítség => ${this.usage}\``);
        }
        if(target_member.id == message.member.id) {
            return message.channel.send("Magadat nem némíthatod le");
        }

        const time = args[1];
        const regExp = new RegExp(/(\d+)(mh|w|d|h|m|s)/g);
        const match = regExp.exec(time);

        if(!time || !match) {
            return message.channel.send(`Nem adtál meg időt vagy hozzá idő típust. Helyes használat és típusok: \`${this.usage}\`\n${Times.GetHelpArray().join(" | ")}`);
        }

        const timeNum = parseInt(match[1]);
        const millis = Times.millis[match[2]];

        if(!millis) {
            return message.channel.send(`Nem adtál meg helyes időt, helyes idő típusok: ${Times.GetHelpArray().join(" | ")}`);
        }

        MuteHandler.Add(target_member, timeNum * millis);
        return message.channel.send("Sikeres némítás.");
    }
}

export default new Mute();

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
        const helpTypeNames: string[] = [];
        for(const type in this.names) {
            if (this.names[type]) {
                const name = this.names[type];
                helpTypeNames.push(`\`${type}: ${name}\``);
            }
        }
        return helpTypeNames;
    }
};