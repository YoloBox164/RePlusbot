import { Client, DMChannel, NewsChannel, Structures, TextChannel } from "discord.js";
import { Prefix } from "../settings";

declare module "discord.js" {
  interface Message {
    startsWithPrefix: boolean;
  }
}

const prefixRegex = new RegExp(`^${escapeRegExp(Prefix)}\\w+`);

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

Structures.extend("Message", (Message) => {
  class CustomMessage extends Message {
    public startsWithPrefix = prefixRegex.test(this.content);

    constructor(client: Client, data: Record<string, unknown>, channel: DMChannel | TextChannel | NewsChannel) {
      super(client, data, channel);
    }
  }

  return CustomMessage;
});
