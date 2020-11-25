import Tools from "../../utils/tools";
import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import embedTemplates from "../../utils/embed-templates";
import Economy, { ResponseTypes } from "../../systems/economy";

class Send implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = false;

    name = "send";
    aliases = ["transfer", "küld", "küldés"];
    desc = "Ezzel a parancsal tudsz küldeni biteket más felhasználóknak.";
    usage = `${Prefix}send [felhasználó] [mennyiség]`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        const target = Tools.GetMember(message, args, false);
        if(!target) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Nem találtam ilyen felhasználót.", this);
            return message.channel.send(embed);
        }

        if(target.id === message.author.id) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Magadnak nem utalhatsz bitet.", this);
            return message.channel.send(embed);
        }

        if(target.user.bot) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Botnak nem küldhetsz bitet.", this);
            return message.channel.send(embed);
        }

        if(!args[1] || isNaN(parseInt(args[1]))) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem volt megadva.", this);
            return message.channel.send(embed);
        }

        let amount = parseInt(args[1]);
        if(amount < 0) {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Mennyiség nem lehet negatív.", this);
            return message.channel.send(embed);
        }

        Economy.Transfer(message.member, target, amount).then(({fromUserData, toUserData, response}) => {
            if(response === ResponseTypes.INSUFFICIENT) {
                const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Jelenleg 0 bited van ezért nem tudsz küldeni másnak.", this);
                return message.channel.send(embed);
            }

            if(response === ResponseTypes.DONE) {
                const embed = new MessageEmbed()
                    .setAuthor(message.member.displayName, message.author.displayAvatarURL())
                    .setTimestamp(Date.now())
                    .setColor("#78b159")
                    .setTitle("Bits")
                    .setDescription(`${message.member.displayName} átutalt ${amount} bitet ${target} egyenlegébe.`)
                    .addField(`${target.displayName} egyenlege`, `\`\`\`${toUserData.bits} bits\`\`\``)
                    .addField(`${message.member.displayName} egyenlege`, `\`\`\`${fromUserData.bits} bits\`\`\``);

                return message.channel.send(embed);
            }

            if(response === ResponseTypes.NONE) {
                return Promise.reject("Something went wrong");
            }
        });
    }
}

export default new Send();