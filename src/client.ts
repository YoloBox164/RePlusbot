import { Client, TextChannel } from "discord.js";
const client = new Client({
    partials: ["GUILD_MEMBER", "CHANNEL", "MESSAGE", "REACTION", "USER"],
    ws: { intents: [
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
    ]}
});

import path from "path";
process.env.APP_ROOT = path.resolve(__dirname).split("\\").slice(0, -1).join("/");

import Config from "./config.json";
process.env.mode = Config.mode;

import Settings from "./settings.json";
import CommandHandler from "./command-handler";
import EventHandler from "./event-handler";
import ErrorHandler from "./error-handler";
import Database from "./systems/database";
import AnalyticSys from "./systems/analytic";
import SecSys from "./systems/security";
import EmbedTemplates from "./utils/embed-templates";

import colors from "colors";

client.prefix = Settings.Prefix;

client.devPrefix = "#>";
client.devId = "333324517730680842";

console.log(colors.yellow("BOT Starting...\n"));
client.CommandHandler = new CommandHandler();
client.EventHandler = new EventHandler(client);

import dateFormat from "dateformat";
client.logDate = (timestamp: number) => {
    if(!timestamp) timestamp = Date.now();
    return dateFormat(timestamp, "yyyy-mm-dd | HH:MM:ss 'GMT'o");
};

const statuses = [`${Settings.Prefix}help`, "Made By CsiPA0723#0423"];

client.on("ready", async () => {
    ErrorHandler.Init(client);

    client.logChannel = <TextChannel>client.channels.resolve(Settings.Channels.modLogId);
    client.automodLogChannel = <TextChannel>client.channels.resolve(Settings.Channels.automodLogId);
    client.economyLogChannel = <TextChannel>client.channels.resolve(Settings.Channels.economyLogId);
    client.devLogChannel = <TextChannel>client.channels.resolve("647420812722307082");
    client.mainGuild = client.logChannel.guild;
    
    await Database.Connect().catch(console.error);

    AnalyticSys.Init(client);
    SecSys.MuteHandler.Restart(client.mainGuild);

    // Caching msg in the regist channel
    const registChannel = <TextChannel>client.channels.resolve(Settings.Channels.registId);
    registChannel.messages.fetch({}, true).catch(console.error);

    if(Config.mode === "development") {
        client.user.setPresence({ activity: { name: "in development", type: "PLAYING" }, status: "dnd" });
    } else {
        client.setInterval(() => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setPresence({ activity: { name: `${status}`, type: "WATCHING" }, status: "online" });
        }, 30000); // Half a minute
    }

    client.logChannel.send(EmbedTemplates.Online(`**Mode:**\`\`\`${Config.mode}\`\`\``));
    console.log("Ready!");
});

client.login(Config.TOKEN).catch(console.error);