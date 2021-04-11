import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Radio from "../../systems/radio";

class Play implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = true;

    name = "play";
    aliases = ["p"];
    desc = "";
    usage = `${Prefix}play`;

    public async execute() {
        Radio.play();
    }
    
}

export default new Play();