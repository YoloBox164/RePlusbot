import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import Radio from "../../systems/radio";

class Join implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = true;

    name = "join";
    aliases = ["j"];
    desc = "";
    usage = `${Prefix}join`;

    public async execute() {
        Radio.join();
    }
    
}

export default new Join();