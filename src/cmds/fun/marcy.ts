import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import path from "path";

class Marcy implements BaseCommand {
  pathToCmd = module.filename;

  mustHaveArgs = false;
  isDev = false;

  name = "marcy";
  aliases = ["marci"];
  desc = "Marcy effekt!";
  usage = `${Prefix}marcy`;

  public async execute(message: Message) {
    try {
      const connection = await message.member.voice.channel?.join();
      const dispatcher = connection.play(path.join(process.env.APP_ROOT, "assets/cmds/fun/Marcy.mp3"));
      dispatcher.on("finish", () => {
        connection.disconnect();
        if(message.deletable) message.delete();
      });
    } catch(error) {
      return Promise.reject(error);
    }
  }

}

export default new Marcy();