import { Message } from "discord.js";
import { Command } from "../../command-handler";
import { ShutdownSequence } from "../../utils/shutdown-sequence";

class Shutdown extends Command {
  public category = "Dev";
  public args = ["[options]"];
  public isDev = true;

  public name = "Shutdown";
  public aliases = ["sh", "shut"];
  public desc = "Shutdown listing";

  public async run(message: Message, args: string[]) {
    const shutdowns = ["shutdown", "shut", "s"];
    const updates = ["update", "upd", "up"];
    const restarts = ["restart", "res", "rs"];
    const switchmodes = ["switchmode", "switch", "sw"];

    const command = args[0];
    if (!command) return;

    if (shutdowns.includes(command)) {
      await ShutdownSequence(message, "Shutting down");
    } else if (updates.includes(command)) {
      await ShutdownSequence(message, "Updating");
    } else if (restarts.includes(command)) {
      await ShutdownSequence(message, "Restarting");
    } else if (switchmodes.includes(command)) {
      await ShutdownSequence(message, `Switching to mode: ${process.env.NODE_ENV}`);
    }
  }
}

export default new Shutdown();
