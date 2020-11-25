import { Message, MessageEmbed } from "discord.js";
import BaseCommand from "../../structures/base-command";

class SearchRole implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = true;

    name = "searchrole";
    aliases = [];
    desc = "Dev";
    usage = "Dev"

    public async execute(message: Message, args?: string[]) {
        let guild = message.client.guilds.resolve(args[1]);
        if(!guild) guild = message.guild;

        const role = guild.roles.resolve(args[0]);

        if(role) {
            const embed = new MessageEmbed()
                .setTitle("Role")
                .addField(role.name, `Name: ${role}\nID: ${role.id}\nUserCount: ${role.members.size}`);
            return message.channel.send({ embed: embed });
        } else {
            const roles = guild.roles.cache.array();
            const desc = [];
            for(const i in roles) {
                desc.push({
                    name: roles[i].name,
                    pos: roles[i].position
                });
            }

            let sortedDesc = sortByKey(desc, "pos");

            sortedDesc = sortedDesc.reverse();
            sortedDesc[sortedDesc.length - 1].name = "everyone";
            const msg = [];
            for(const i in sortedDesc) {
                msg.push(sortedDesc[i].name/* + " | Pos: " + sortedDesc[i].pos*/);
            }

            msg.join("\n");
            return message.channel.send(msg, { split: { char: "\n" } });
        }
    }
}

export default new SearchRole();

function sortByKey(array: any, key: any): Array<any> {
    return array.sort(function(a: { [x: string]: any; }, b: { [x: string]: any; }) {
        const x = a[key]; const y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}