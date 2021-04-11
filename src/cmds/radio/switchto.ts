import { Message } from "discord.js";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Radio, { FMs } from "../../systems/radio";

function getDesc() {
    let string = "FMs:\n\n"
    for (const fmName in FMs) {
        string += `-- ${fmName}\n`
    }
    return string.trim();
}

class SwitchTo implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = true;

    name = "switchto";
    aliases = ["swt"];
    desc = `${getDesc()}`;
    usage = `${Prefix}switchto [fm channel]`;

    public async execute(message: Message, args: string[]) {
        if(FMs[args[0]]) {
            message.channel.send(`Switchhing to ${FMs[args[0]]}`);
            Radio.switchTo(FMs[args[0]]);
        } else message.channel.send(`Not found this FM`);
    }
    
}

export default new SwitchTo();