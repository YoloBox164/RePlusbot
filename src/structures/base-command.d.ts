import Discord from "discord.js";

export default interface BaseCommand {
    pathToCmd: string;

    mustHaveArgs: boolean;
    isDev: boolean;

    name: string;
    aliases: string[];
    desc: string;
    usage: string;
    
    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    execute: (message: Discord.Message, args?: string[]) => Promise<any>;
}