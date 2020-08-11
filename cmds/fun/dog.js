const Discord = require("discord.js");
const got = require("got");

module.exports = {
    /**
     * @async
     * @param {Discord.Message} message Discord message.
     */
    execute: async (message) => {
        const msg = await message.channel.send("Lekérés...");
        const link = "https://api.thedogapi.com/v1/images/search?mime_types=gif";

        const response = await got(link);
        const data = JSON.parse(response.body);

        const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
            .setDescription(`[LINK](${data[0].url})`)
            .setFooter("thedogapi.com")
            .setColor(message.guild.member(message.client.user).displayHexColor)
            .setImage(data[0].url);

        await message.channel.send({ embed: embed });
        msg.delete();
    },
    args: false,
    name: "dog",
    aliases: ["dogy", "kutyi"],
    desc: "Véletlenszerű kutyi gifek.",
    usage: ">dog"
};