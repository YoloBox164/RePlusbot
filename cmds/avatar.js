const Discord = require("discord.js");

const Functions = require('../functions.js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Generating avatar...");
    var target = Functions.GetMember(message, args);

    var embed = new Discord.RichEmbed()
        .setTitle(`${target.displayName}'s avatar`)
        .setDescription(`[Avatar LINK](${target.user.displayAvatarURL})`)
        .setImage(target.user.displayAvatarURL)
        .setColor(target.displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "avatar",
    alias: ["profile"],
    name: "Avatar Icon",
    desc: "View yours or others avatar.",
    usage: ">avatar <user>",
    category: "user"
}