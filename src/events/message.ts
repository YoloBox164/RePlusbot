import { Message } from "discord.js";
import CommandHandler from "../command-handler";

export default async function (message: Message): Promise<void> {
  try {
    if(message.partial) await message.fetch();
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.startsWithPrefix) return;

    const { command, args } = CommandHandler.getCommand(message);

    if(!command) return;

    if(!command.isDev) command.run(message, args);
    else if(message.author.isDev) command.run(message, args);
  } catch(error) {
    return Promise.reject(error);
  }
}