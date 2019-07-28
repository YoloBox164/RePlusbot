const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generating avatar...");
    var joinedArgs = args.join(" ").toLowerCase();
    var target = message.mentions.users.first()
        || message.guild.members.find(member => joinedArgs.includes(member.displayName.toLowerCase()))
        || message.guild.members.get(args[0])
        || message.author;

    if(!target.username) target = target.user;

    var embed = new Discord.RichEmbed()
        .setTitle(`${message.guild.member(target).displayName}'s avatar`)
        .setImage(target.displayAvatarURL)
        .setColor(message.guild.member(target).displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "avatar",
    name: "Avatar Icon"
}