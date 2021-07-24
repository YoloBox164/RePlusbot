import { Message } from "discord.js";
import logger from "../logger";

export async function ShutdownSequence(message: Message, text: string): Promise<void> {
  try {
    await message.client.logChannel.send(`\`${text}\``);
    await message.channel.send(`\`${text}\``);
    //await Database.Connection.end().then(() => logger.info("Database shutdown"));
    //await AnalyticSys.Shut().then(() => logger.info("Analytic Sys Shut"));
    //Radio.disconnect();
  } catch (error) {
    return Promise.reject(error);
  }
  logger.info(text);
  message.client.destroy();
  process.exit(0);
}
