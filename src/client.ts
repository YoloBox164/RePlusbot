
import { Client } from "discord.js";
import { DateTime } from "luxon";

import "./command-handler";
import "./commands";
import EventHandler from "./event-handler";

const client = new Client({
  partials: ["GUILD_MEMBER", "CHANNEL", "MESSAGE", "REACTION", "USER"],
  ws: {
    intents: [
      "DIRECT_MESSAGES",
      "DIRECT_MESSAGE_REACTIONS",
      "DIRECT_MESSAGE_TYPING",
      "GUILDS",
      "GUILD_BANS",
      "GUILD_EMOJIS",
      "GUILD_INTEGRATIONS",
      "GUILD_INVITES",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "GUILD_PRESENCES",
      "GUILD_VOICE_STATES",
      "GUILD_WEBHOOKS"
    ]
  },
});

declare module 'discord.js' {
  interface Client {
    mainGuild: Guild;
    logChannel: TextChannel;
    automodLogChannel: TextChannel;
    economyLogChannel: TextChannel;
    devLogChannel: TextChannel;

    logDate: (timestampt?: number) => string;
  }
}

client.logDate = (timestamp: number) => {
  if(!timestamp) timestamp = Date.now();
  return DateTime.fromMillis(timestamp).toFormat("yyyy-MM-dd | TT 'GMT'ZZZ");
};

client.on("ready", () => {
  EventHandler(client);
  console.log("Ready!");
});

client.login(process.env.TOKEN).catch(console.error);