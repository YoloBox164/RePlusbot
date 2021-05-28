import colors from "colors/safe";
import { Message, TextChannel } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings";

class Purge implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = true;
    isDev = false;

    name = "purge";
    aliases = ["clear"];
    desc = "Törölj üzeneteket 1 és 100 között.";
    usage = `${Prefix}purge [1 - 100]`;

    public async execute(message: Message, args?: string[]) {
        if(message.member == message.guild.member(message.client.devId) || message.member.hasPermission("MANAGE_MESSAGES", { checkAdmin: true, checkOwner: true })) {
            const deleteCount = parseInt(args[0], 10);
            if(!deleteCount || (deleteCount < 1 || deleteCount > 100)) {
                return message.reply("Kérlek adj meg egy számot 1 és 99 között.");
            }

            return (<TextChannel>message.channel).bulkDelete(deleteCount + 1).then(() => {
                const logMsg = `${message.member.displayName} deleted ${deleteCount} messages in ${message.channel}`;
                console.log(colors.yellow(`LOG: Deleted messages: ${deleteCount}`));

                if(message.guild == message.client.mainGuild) return message.client.logChannel.send(logMsg);
                else return message.client.devLogChannel.send(logMsg);
            }).catch(error => {
                return message.channel.send(`Nem tudtam törölni. Hiba: ${error}`);
            });
        } else {
            return message.channel.send("Nincs jogod hasznélni ezt a parancsot.");
        }
    }
}

export default new Purge();