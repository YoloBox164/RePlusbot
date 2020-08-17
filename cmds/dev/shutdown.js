const Database = require("../../database");
const AnalyticSys = require("../../analytic-sys");
const Config = require("../../config.json");

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @param {string[]} args
     */
    execute: async (message, args) => {
        const reloads = ["reloadcmds", "reload", "r"];
        const shutdowns = ["shutdown", "shut", "s"];
        const updates = ["update", "upd", "up"];
        const restarts = ["restart", "res", "rs"];
        const switchmodes = ["switchmode", "switch", "sw"];

        const command = args[0];
        if(!command) return;

        if(reloads.includes(command)) {
            const cmd = message.client.CommandHandler.commands.get(args[1]) ||
                message.client.CommandHandler.commands.find(c => c.aliases && c.aliases.includes(args[1]));
            if(cmd) {
                message.client.logChannel.send(`\`Reloading ${cmd.name}\``);
                console.log(`Reloading ${cmd.name}`);
                message.client.CommandHandler.reloadCmd(cmd.name);
                message.channel.send(`${cmd.name} successfully reloaded!`);
            } else {
                message.client.logChannel.send("`Reloading commands`");
                console.log("Reloading commands");
                message.client.CommandHandler.loadCmds();
                message.channel.send("Commands successfully reloaded!");
            }
        } else if(shutdowns.includes(command)) {
            await shutdown(message, "Shutting down");
        } else if(updates.includes(command)) {
            await shutdown(message, "Updating");
        } else if(restarts.includes(command)) {
            await shutdown(message, "Restarting");
        } else if(switchmodes.includes(command)) {
            await shutdown(message, "Switching to mode: " + (Config.mode == "development" ? "production." : "development."));
        } else if(["twitch", "tw"].includes(command)) {
            if(Config.mode === "production") return;
            // console.log("Reloading twitch webhook");
            delete require.cache[require.resolve("./twitch.js")];
            const twitch = require("./twitch.js");
            twitch.CheckSub();
        }
    },
    name: "sh",
    dev: true,
    args: true
};

/**
 * @param {import("discord.js").Message} message
 * @param {string} text
 */
async function shutdown(message, text) {
    await message.client.logChannel.send(`\`${text}\``);
    await message.channel.send(`\`${text}\``);
    await Database.Connection.end();
    AnalyticSys.Shut();
    console.log(text);
    message.client.destroy();
    process.exit(0);
}