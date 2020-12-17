import { Message } from "discord.js";
import BaseCommand from "../../../structures/base-command";
import { Prefix } from "../../../settings.json";
import embedTemplates from "../../../utils/embed-templates";
import info from "./info";
import fs from "fs";

export class ShopItem {
    name: string;
    desc: string;
    price: number;
    isMontly: boolean;
    
    shopId: number;

    limit = 0;
    get isLimited() { return this.limit > 0 };

    constructor(name: string, desc: string, price: number, isMonthly: boolean) {
        this.name = name;
        this.desc = desc;
        this.price = price;
        this.isMontly = isMonthly;
    }

    public async runMethod(message: Message, args?: string[]): Promise<any> {};
}

class Shop implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "shop";
    aliases = ["bolt"];
    desc = "Vásárlói menü. Itt tudsz különbféle rangokat és kiegészítőket vásárolni a biteidből.";
    usage = `${Prefix}shop <árú id-je>`;

    items: ShopItem[] = [];

    constructor() {
        const files = fs.readdirSync(`${module.path}/items`).filter(f => f.split(".").pop() === "js");
        for (const file of files) {
            const shopItem = <ShopItem>require(`${module.path}/items/${file}`).default;
            console.log("SHOP".red + ` - ${shopItem.name} loaded!`);
            if(shopItem instanceof ShopItem) this.items.push(shopItem);
            else console.warn(new Error(`File "${file}" does not have default export witch is instance of ShopItem class.`));
        }
    }

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
    */
    public async execute(message: Message, args?: string[]) {
        if(!args[0] || !args) return info(message, this.items);
        const shopItemId = parseInt(args[0]);
        if(!isNaN(shopItemId) && this.items.some(si => si.shopId === shopItemId)) {
            const shopItem = this.items.find(si => si.shopId === shopItemId);
            return shopItem.runMethod(message, args);
        } else {
            const embed = embedTemplates.Cmd.ArgErrCustom(message.client, "Nincs ilyen árú vagy nem adott meg egy id!", this);
            return message.channel.send(embed);
        }
    }
}

export default new Shop();