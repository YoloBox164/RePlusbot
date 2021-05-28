import { Client } from "discord.js";
import dateFormat from "dateformat";
import Settings from "./settings";

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
    prefix: string;
    devPrefix: string;
    devId: string;

    mainGuild: Guild;
    logChannel: TextChannel;
    automodLogChannel: TextChannel;
    economyLogChannel: TextChannel;
    devLogChannel: TextChannel;

    CommandHandler: import("./command-handler").default;
    EventHandler: import("./event-handler").default;

    logDate: (timestampt?: number) => string;
    //---------------------------------------------------//

  }
}

client.logDate = (timestamp: number) => {
  if(!timestamp) timestamp = Date.now();
  return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
};

client.prefix = Settings.Prefix;

client.on("ready", () => {
  console.log("Ready!");
});

client.login(process.env.TOKEN).catch(console.error);