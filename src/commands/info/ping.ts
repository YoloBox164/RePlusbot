import { Message } from "discord.js";
import { Command } from "../../command-handler";

class Ping extends Command {
  public name = "Ping";
  public aliases = [];
  public category = "Info";
  public desc = "Ping - Pong!";
  public args = [];
  public isDev = false;

  constructor() {
    super();
    this.init();
  }

  public async run(message: Message): Promise<void> {
    message.channel.send("Pong!");
  }
}

export default new Ping();
