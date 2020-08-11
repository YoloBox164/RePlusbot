const Discord = require("discord.js");

module.exports = {
    /**
     * @async
     * @param {import("discord.js").Message} message Discord message.
     */
    execute: async (message) => {
        const msg = await message.channel.send("Szerver ikon lehívása...");

        const embed = new Discord.MessageEmbed()
            .setTitle("Szerver Ikon")
            .setDescription(`[Ikon LINK](${message.guild.iconURL({ format: "png", size: 4096 })})`)
            .setImage(message.guild.iconURL({ format: "png", size: 4096 }))
            .setColor(message.member.displayHexColor);

        await message.channel.send({ embed: embed });
        msg.delete();
    },
    args: false,
    name: "icon",
    aliases: ["servericon", "ico"],
    desc: "Megjeleníti a szerver ikont.",
    usage: ">icon"
};