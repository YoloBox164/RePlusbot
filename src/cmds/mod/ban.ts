import BaseCommand from "../../structures/base-command";
import { Message, MessageMentions } from "discord.js";
import Tools from "../../utils/tools";
import { Prefix, StaffIds } from "../../settings.json";

class Ban implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = true;
    isDev = false;

    name = "ban";
    aliases = ["kitilt", "kitiltas"];
    desc = "A Botnak a saját ban parancsa.";
    usage = `${Prefix}ban [felhasználó tag-je] <kitiltás oka>`;

    public execute(message: Message, args?: string[]) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, StaffIds) && !message.member.permissions.has("BAN_MEMBERS", true)) {
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
            return message.channel.send("Magadat nem tilthatod ki!");
        }
        let reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs.";
        if(target_member.bannable) return target_member.ban({ reason: reason });
        else return message.channel.send("Nem tudod kitiltani ezt a felhasználót.");
    }
}

export default new Ban();