const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generating...");

    var embed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL)
        .setTitle("Server information:")
        .setDescription(
            `**Name of the server:** ${message.guild.name}
            **ServerID:** ${message.guild.id}\n
            **Owner:** ${message.guild.owner}
            **Owner FULL Username:** ${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}
            **OwnerID:** ${message.guild.ownerID}\n
            **Created At:** ${message.guild.createdAt}\n
            **Member Count:** ${message.guild.members.filter(m => !m.user.bot).size}
            **Bot Count:** ${message.guild.members.filter(m => m.user.bot).size}
            **Channel Count:** ${message.guild.channels.size}`
        )
        .setThumbnail(message.guild.iconURL)
        .setColor(message.guild.members.get(bot.user.id).displayHexColor);

    message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "serverinfo",
    alias: ["info", "guild", "guildinfo"],
    name: "Server Information",
    desc: "Shows the server information.",
    usage: ">serverinfo",
    category: "user"
}