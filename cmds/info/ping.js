module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     */
    execute: (message) => {
        message.channel.send("Pong!");
    },
    args: false,
    name: "ping",
    alias: [],
    desc: "Ping - Pong!",
    usage: ">ping"
};