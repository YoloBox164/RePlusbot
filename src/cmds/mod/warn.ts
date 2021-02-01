import Database, { Warnings } from "../../systems/database";
import Settings from "../../settings.json";
import Tools from "../../utils/tools";
import EmbedTemplates from "../../utils/embed-templates";
import BaseCommand from "../../structures/base-command";
import { Message } from "discord.js";

class Warn implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = true;
    isDev = false;

    name = "warn";
    aliases = ["figyelmeztet"];
    desc = "Egy egyszerű figyelmeztető rendszer";
    usage = `${Settings.Prefix}warn [felhasználó] <Figyelmeztetés oka>`;

    public async execute(message: Message, args?: string[]) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != message.client.devId) {
            return message.channel.send("Nincs jogod ehez a parancshoz.");
        }

        const targetMember = Tools.GetMember(message, args, false);

        if(targetMember) {
            let reason = args.slice(1).join(" ");
            if(!reason) reason = "Nincs";
            const issuer = message.member;

            if(targetMember.id == issuer.id && !message.client.devId) {
                return message.channel.send("Magadnak nem adhatsz figyelmeztetést.");
            }

            let userData = await Database.GetData("Users", targetMember.id);
            if(!userData) userData = { id: targetMember.id, warns: 1 };
            else userData.warns += 1;
            Database.SetData("Users", userData);

            const warning: Warnings = {
                userId: targetMember.id,
                warning: reason,
                time: Date.now()
            };
            Database.SetData("Warnings", warning);

            message.channel.send(`${targetMember} figyelmeztetve lett.\n**Figyelmeztetés Oka**: '${reason}'.`);
            const logChannel = message.client.logChannel;

            const embed = EmbedTemplates.Warning(targetMember, issuer, reason);

            const conLogMsg = `Warned ${targetMember.displayName} (Id: ${targetMember.id}) by ${issuer.displayName} (Id: ${issuer.id})`;

            console.log(conLogMsg);
            return logChannel.send(embed);

        } else { return message.channel.send(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => \`${this.usage}\``); }
    }
}

export default new Warn();