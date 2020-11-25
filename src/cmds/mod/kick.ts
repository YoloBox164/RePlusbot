import Discord, { Message } from "discord.js";
import Tools from "../../utils/tools";
import Settings from "../../settings.json";
import BaseCommand from "../../structures/base-command";

class Kick implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "kick";
    aliases = ["kirug", "kirugas"];
    desc = "A Botnak a saját kick parancsa.";
    usage = `${Settings.Prefix}kick [felhasználó tag-je] <kirúgás oka>`;

    public execute(message: Message, args?: string[]) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("KICK_MEMBERS", true)) {
            return message.channel.send("Nincsen jogod használni ezt a paracsot.");
        }
        if(!args[0]) {
            return message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.usage}\``);
        }
        const target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, "");
        const target_member = message.guild.member(target_memberId);
        if(!target_member) {
            return message.channel.send(`Nincs ilyen felhasználó.\`Segítség => ${this.usage}\``);
        }
        if(target_member.id == message.member.id) {
            return message.channel.send("Magadat nem rúghatod ki!");
        }
        let reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs.";
        if(target_member.kickable) return target_member.kick(reason);
        else return message.channel.send("Nem tudod kirúgni ezt a felhasználót.");
    }
}

export default new Kick();