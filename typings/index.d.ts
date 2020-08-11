import Discord from "discord.js"

export type cmd = {
    execute: (message: Discord.Message, args: string[]) => void,
    args: boolean,
    dev: boolean,
    name: string,
    aliases: string[],
    desc: string,
    usage: string
};