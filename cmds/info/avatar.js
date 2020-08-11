const Discord = require("discord.js");
const Tools = require("../../utils/tools");

module.exports = {
    /**
     * @async
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: async (message, args) => {
        const msg = await message.channel.send("Avatár lehívása folyamatban...");
        const target = Tools.GetMember(message, args);

        const embed = new Discord.MessageEmbed()
            .setTitle(`${target.displayName} avatárja`)
            .setDescription(`[Avatar LINK](${target.user.displayAvatarURL({ format: "png", size: 4096 })})`)
            .setImage(target.user.displayAvatarURL({ format: "png", size: 4096 }))
            .setColor(target.displayHexColor);

        await message.channel.send({ embed: embed });
        msg.delete();
    },
    args: true,
    name: "avatar",
    aliases: ["profile"],
    desc: "Nézd meg sajátod vagy más avatárját.",
    usage: ">avatar <felhasználó>"
};