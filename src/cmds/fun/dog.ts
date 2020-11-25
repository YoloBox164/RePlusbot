import { Message, MessageEmbed } from "discord.js";
import got from "got";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";

class Dog implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "dog";
    aliases = ["dogy", "kutyi"];
    desc = "Véletlenszerű kutyi gifek.";
    usage = `${Prefix}dog`;

    public async execute(message: Message) {
        try {
            const msg = await message.channel.send("Lekérés...");

            const data = await got("https://api.thedogapi.com/v1/images/search?mime_types=gif").json();

            const embed = new MessageEmbed()
                .setAuthor(message.author.tag, message.author.displayAvatarURL())
                .setDescription(`[LINK](${data[0].url})`)
                .setFooter("thedogapi.com")
                .setColor(message.guild.member(message.client.user).displayHexColor)
                .setImage(data[0].url);
    
            return message.channel.send({ embed: embed }).then(() => msg.delete());
        } catch (error) {
            return Promise.reject(new Error(error));
        }
    }
    
}

export default new Dog();