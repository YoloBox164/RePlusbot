import colors from "colors";
import { Message } from "discord.js";
import util from "util";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import tools from "../../utils/tools";

class Eval implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = true;

    name = "eval";
    aliases = [];
    desc = "Devtool";
    usage = `${Prefix}eval [code]`;

    public async execute(message: Message, args: string[]): Promise<any> {
        try {
            console.log(colors.red("WARN: eval being used by " + message.member.displayName));
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") evaled = util.inspect(evaled);
            return message.channel.send(tools.Clean(evaled), { code:"xl", split: { char: "\n" } }).catch(error => {
                console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
            });
        } catch (err) {
            return message.channel.send(`\`ERROR\` \`\`\`xl\n${tools.Clean(err)}\n\`\`\``).catch(error => {
                console.error(`${error.name}: ${error.message}\nStack: ${error.stack}`);
            });
        }
    }
}

export default new Eval();