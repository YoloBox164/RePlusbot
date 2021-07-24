import colors from "colors";
import { Message } from "discord.js";
import util from "util";
import { Command } from "../../command-handler";
import logger from "../../logger";
import { Clean } from "../../utils/tools/clean";

class Eval extends Command {
  public category = "Dev";
  public args = ["[code]"];
  public isDev = true;

  public name = "Eval";
  public aliases = [];
  public desc = "Devtool";

  public async run(message: Message, args: string[]) {
    try {
      logger.warn(colors.red("WARN: eval being used by " + message.member.displayName));
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") evaled = util.inspect(evaled);
      message.channel.send(Clean(evaled), { code: "xl", split: { char: "\n" } }).catch((error) => {
        logger.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
      });
    } catch (error) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${Clean(error)}\n\`\`\``).catch((error) => {
        logger.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
      });
      return Promise.reject(error);
    }
  }
}

export default new Eval();
