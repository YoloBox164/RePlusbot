import { Prefix, StaffIds } from "../../settings.json";
import Database from "../../systems/database";
import Tools from "../../utils/tools";
import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import embedTemplates from "../../utils/embed-templates";
import Economy from "../../systems/economy";

class Remove implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = false;

    name = "remove";
    aliases = [];
    desc = "(STAFF) Ezzel a parancsal tudsz megvonni biteket a felhasználókntól.";
    usage = `${Prefix}remove <felhasználó> [mennyiség] (Ha nincsen felhasználó megadva akkor te leszel.)`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        if(!Tools.MemberHasOneOfTheRoles(message.member, StaffIds) && message.author.id != message.client.devId) {
            return message.channel.send("Nincs jogod ehhez a parancshoz.");
        }

        const target = Tools.GetMember(message, args);
        if(!target) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Nem találtam ilyen felhasználót.", this);
            return message.channel.send(embed);
        }

        let amount = 0;
        if(!isNaN(parseInt(args[0]))) amount = parseInt(args[0]);
        else if(!isNaN(parseInt(args[1]))) amount = parseInt(args[1]);
        else {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem volt megadva.", this);
            return message.channel.send(embed);
        }
        
        return Economy.Remove(target, amount, "ADMIN REMOVE").then(userData => {
            const embed = new MessageEmbed()
                .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setTimestamp(Date.now())
                .setColor("#78b159")
                .setTitle("Bits")
                .setDescription(`${target} egyenlege csökkent ${amount} bittel.`)
                .addField(`${target.displayName} egyenlege`, `\`\`\`${userData.bits} bits\`\`\``);

            return message.channel.send(embed);
        });
    }
}

export default new Remove();