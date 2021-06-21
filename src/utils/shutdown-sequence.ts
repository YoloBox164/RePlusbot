import { Message } from "discord.js";

export async function ShutdownSequence(message: Message, text: string): Promise<void> {
  try {
    await message.client.logChannel.send(`\`${text}\``);
    await message.channel.send(`\`${text}\``);
    //await Database.Connection.end().then(() => console.log("Database shutdown"));
    //await AnalyticSys.Shut().then(() => console.log("Analytic Sys Shut"));
    //Radio.disconnect();
  } catch(error) {
    return Promise.reject(error);
  }
  console.log(text);
  message.client.destroy();
  process.exit(0);
}