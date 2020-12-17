import { Message } from "discord.js";
import { ShopItem } from "..";
import Database, { Wumpus } from "../../../../systems/database";
import Economy from "../../../../systems/economy";
import { Roles } from "../../../../settings.json";

const shopItem = new ShopItem(
    "Wumpus+",
    "Speciális rang",
    Economy.WUMPUS_ROLE_COST,
    true
);

shopItem.limit = 10;
shopItem.runMethod = async (message: Message, args: string[]) => {
    try {
        const wumpusUserCount = message.client.mainGuild.members.cache.filter(f => f.roles.cache.has(Roles.WumpusId)).size;
        if(wumpusUserCount + 1 > shopItem.limit) return message.channel.send("Ez az árú már elérte a limitét.");

        const wumpusData = await Database.GetData("Wumpus", message.member.id);
        if(wumpusData && wumpusData.hasRole) {
            return message.channel.send(`Már van ilyen rangod. Biztos le szeretnéd mondani? Ha igen írd:\`\`\`${"Igen"}\`\`\``).then(msg => {
                const filter = (m: Message) => m.content.toLowerCase() === "igen" && m.author.id === message.author.id;
                const collector = msg.channel.createMessageCollector(filter, {max: 1, time: 30000});
                collector.on("collect", (m: Message) => {
                    console.log(m.author.username, m.content);
                });

                collector.on("end", (colllected, reason) => {
                    console.log(colllected, reason);
                });
            });
        }

        const currencyData = await Economy.GetInfo(message.member);

        if(currencyData.bits >= Economy.WUMPUS_ROLE_COST) {
            await Economy.Remove(message.member, Economy.WUMPUS_ROLE_COST, "Wumpus+ rang vétel.");
            await Database.SetData("Wumpus", <Wumpus>{
                id: message.member.id,
                hasRole: true,
                perma: false,
                roleTime: Date.now()
            });
            message.member.roles.add(Roles.WumpusId);
            return message.channel.send("Sikeresen megvetted a Wumpus+ rangot.");
        } else return message.channel.send("Nincs elég bited.");
    } catch (error) {
        return Promise.reject(error);
    }
}

export default shopItem;