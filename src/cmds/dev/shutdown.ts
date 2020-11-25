import { Message } from "discord.js";
import Config from "../../config.json";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";
import { exec } from "child_process";
import { ShutdownSequence } from "../../utils/tools";

enum RemoveCmds {
    "win32" = "del /q .\\dist\\cmds && tsc",
    "linux" = "rm -rf ./dist/cmds && tsc"
}

enum RemoveHandlers {
    "win32" = "del /q .\\dist\\event-handlers && tsc",
    "linux" = "rm -rf ./dist/event-handlers && tsc"
}

class Shutdown implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = true;
    isDev = true;

    name = "sh";
    aliases = [];
    desc = "Shutdown listing";
    usage = `${Prefix}sh [options]`;

    public async execute(message: Message, args?: string[]): Promise<any> {
        const reloads = ["reloadcmds", "reload", "r"];
        const eventHandlers = ["reloadhandler", "handlers", "rh"];
        const shutdowns = ["shutdown", "shut", "s"];
        const updates = ["update", "upd", "up"];
        const restarts = ["restart", "res", "rs"];
        const switchmodes = ["switchmode", "switch", "sw"];

        const command = args[0];
        if(!command) return;

        const CommandHandler = message.client.CommandHandler;
        const EventHandler = message.client.EventHandler;

        const commands = await message.client.CommandHandler.commands;

        if(reloads.includes(command)) {
            const cmd = commands.get(args[1]) || commands.find(c => c.aliases && c.aliases.includes(args[1]));
            if(cmd) {
                message.client.logChannel.send(`\`Reloading ${cmd.name}\``);
                console.log(`Reloading ${cmd.name}`);
                exec(RemoveCmds[process.platform], {cwd: `${process.env.APP_ROOT}`}, (error, stdout, stderr) => {
                    if(error || stderr) {
                        if(error) console.error("Error", error);
                        if(stderr) console.error("Stderr", stderr);
                        return;
                    }
                    if(stdout) console.log("Stdout", stdout);

                    CommandHandler.reloadCmd(cmd.name);
                    message.channel.send(`${cmd.name} successfully reloaded!`);
                });
            } else {
                message.client.logChannel.send("`Reloading commands`");
                console.log("Reloading commands");
                exec(RemoveCmds[process.platform], {cwd: `${process.env.APP_ROOT}`}, (error, stdout, stderr) => {
                    if(error || stderr) {
                        if(error) console.error("Error", error);
                        if(stderr) console.error("Stderr", stderr);
                        return;
                    }
                    if(stdout) console.log("Stdout", stdout);

                    CommandHandler.loadCmds();
                    message.channel.send("Commands successfully reloaded!");
                });
            }
        } else if(eventHandlers.includes(command)) {
            console.log("Reloading Event handlers");
            exec(RemoveHandlers[process.platform], {cwd: `${process.env.APP_ROOT}`}, (error, stdout, stderr) => {
                if(error || stderr) {
                    if(error) console.error("Error", error);
                    if(stderr) console.error("Stderr", stderr);
                    return;
                }
                if(stdout) console.log("Stdout", stdout);

                EventHandler.loadHandlers();
                message.channel.send("Event handlers successfully reloaded!");
            });
        } else if(shutdowns.includes(command)) {
            await ShutdownSequence(message, "Shutting down");
        } else if(updates.includes(command)) {
            await ShutdownSequence(message, "Updating");
        } else if(restarts.includes(command)) {
            await ShutdownSequence(message, "Restarting");
        } else if(switchmodes.includes(command)) {
            await ShutdownSequence(message, "Switching to mode: " + (Config.mode == "development" ? "production." : "development."));
        }
    }
}

export default new Shutdown();