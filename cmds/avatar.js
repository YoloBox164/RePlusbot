const Discord = require("discord.js");

const Tools = require('../utils/tools');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Avatár lehívása folyamatban...");
    var target = Tools.GetMember(message, args);

    var embed = new Discord.MessageEmbed()
        .setTitle(`${target.displayName} avatárja`)
        .setDescription(`[Avatar LINK](${target.user.displayAvatarURL({format: "png", size: 4096})})`)
        .setImage(target.user.displayAvatarURL({format: "png", size: 4096}))
        .setColor(target.displayHexColor);

    await message.channel.send({embed: embed});
    msg.delete();
}

module.exports.help = {
    cmd: "avatar",
    alias: ["profile"],
    name: "Avatár Ikon",
    desc: "Nézd meg sajátod vagy más avatárját.",
    usage: ">avatar <felhasználó>",
    category: "felhasználói"
}