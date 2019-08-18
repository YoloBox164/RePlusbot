module.exports.run = (bot, message, args) => {
    message.channel.send("Pong!");
}

module.exports.help = {
    cmd: "ping",
    alias: [],
    name: "Ping"
}