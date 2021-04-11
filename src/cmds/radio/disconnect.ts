import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Radio from "../../systems/radio";

class Disconnect implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = true;

    name = "disconnect";
    aliases = [];
    desc = "";
    usage = `${Prefix}disconnect`;

    public async execute() {
        Radio.disconnect();
    }
    
}

export default new Disconnect();