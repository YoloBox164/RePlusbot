import { Message, MessageEmbed } from "discord.js";
import { ShopItem } from ".";
import { Prefix } from "../../../settings.json";

export default async (message: Message, items: ShopItem[]) => {
    const strItems: string[] = [];
    for (let index = 0; index < items.length; index++) {
        const shopItem = items[index];
        shopItem.shopId = index + 1;
        const price = shopItem.isMontly ? `${shopItem.price} bits/hó` : `${shopItem.price} bits`;
        const limited = shopItem.isLimited ? ` - **Limit**: ${shopItem.limit}` : "";
        strItems.push(`\`${shopItem.shopId}\` - **${shopItem.name}**: ${shopItem.desc} **---** *${price}*${limited}`);
    }
    const embed = new MessageEmbed()
        .setAuthor(message.member.displayName, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
        .setTimestamp(Date.now())
        .setColor("#78b159")
        .setTitle("Shop - Termékek és Szolgáltatások")
        .setDescription(strItems.join("\n"))
        .addField("Help", `Vásárolni és lemondani szolgáltatásokat ezzel a parancsal lehet:\`\`\`${Prefix}shop <id>\`\`\``);
    message.channel.send(embed);
}