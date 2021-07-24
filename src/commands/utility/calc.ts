import { Message, MessageEmbed } from "discord.js";
import { evaluate } from "mathjs";
import { Command } from "../../command-handler";
import logger from "../../logger";

class Calc extends Command {
  public category = "Utility";
  public args = ["[számítás]"];
  public isDev = false;

  public name = "Calc";
  public aliases = ["calculate"];
  public desc = "Egy számológép.";

  public async run(message: Message, args: Array<string>) {
    if (!args[0]) {
      message.channel.send("Kérem adjon meg egy helyes matematikai számítást.");
      return;
    }
    try {
      const res = evaluate(args.join(" "));
      const embed = new MessageEmbed()
        .setColor(0xffffff)
        .setTitle("Matematika számítás")
        .addField("Bemenet", `\`\`\`js\n${args.join("")}\`\`\``)
        .addField("Kimenet", `\`\`\`js\n${res}\`\`\``);

      message.channel.send({ embed: embed });
    } catch (error) {
      message.channel.send("Valami nem úgy ment mint kellett volna.").catch(logger.error);
      return Promise.reject(error);
    }
  }
}

export default new Calc();
