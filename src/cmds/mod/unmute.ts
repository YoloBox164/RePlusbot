import { Message, MessageMentions } from "discord.js";
import Tools from "../../utils/tools";
import { Prefix, StaffIds } from "../../settings.json";
import { MuteHandler } from "../../systems/security";
import BaseCommand from "../../structures/base-command";

class Unmute implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = true;
    isDev = false;

    name = "unmute";
    aliases = ["visszanemit", "visszanémit"];
    desc = "Vedd le a némítást manuálisan egy felhasználóról.";
    usage = `${Prefix}unmute [felhasználó elmítés]`;

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
            return message.channel.send(`Nincs ilyen felhasználó.\`Segítség => ${this.usage}\``);
        }
        if(target_member.id == message.member.id) {
            return message.channel.send("Magadról nem  veheted le a némítást.");
        }

        MuteHandler.Remove(target_member);
        return message.channel.send("Sikeresen le szetted a némítást.");
    }
}

export default new Unmute();