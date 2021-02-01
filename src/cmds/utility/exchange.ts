import Discord, { Message } from "discord.js";
import got from "got";
import BaseCommand from "../../structures/base-command";
import { Prefix } from "../../settings.json";

const api = "06b26c42ff1b069252795e80";

class Exchange implements BaseCommand {
    pathToCmd = module.filename;

    mustHaveArgs = false;
    isDev = false;

    name = "exchange";
    aliases = ["change", "currency", "ex"];
    desc = "Valuta átváltó | használd ISO 4217 valuta kódokat (pl.: HUF, EUR, USD, stb.)";
    usage = `${Prefix}exchange <érték> <valutaból> <másik valutába>`;

    /**
     * @param message Discord message.
     * @param args The message.content in an array without the command.
     */
    public async execute(message: Message, args: Array<string>) {
        try {
            const msg = await message.channel.send("Átváltás...");
            const isoCurrMap: any = await got("http://www.localeplanet.com/api/auto/currencymap.json").json();

            const val = isNaN(Number(args[0])) ? 1 : Number(args[0]);
            let fr: string, to: string;
    
            if(isNaN(Number(args[0]))) {
                if(args[0]) fr = args[0].toUpperCase();
                if(args[1]) to = args[1].toUpperCase();
            } else {
                if(args[1]) fr = args[1].toUpperCase();
                if(args[2]) to = args[2].toUpperCase();
            }
    
            if(!fr) fr = "EUR";
            if(!to) to = "HUF";
    
            const symbol = isoCurrMap[to].symbol_native;
    
            const res: any = await got(`https://v3.exchangerate-api.com/pair/${api}/${fr}/${to}`).json();
            if(res["result"] == "failed") {
                return message.channel.send(res["error"]);
            }
            const embed = new Discord.MessageEmbed()
                .setThumbnail("https://www.exchangerate-api.com/img/logo-square.png")
                .setTitle(`${fr} => ${to}`)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
                .setColor(message.guild.member(message.client.user).displayHexColor)
                .addField("Eredmény", `${res["rate"] * val} ${symbol}`);
    
            return message.channel.send({ embed: embed }).then(() => msg.delete());
        } catch (error) {
            return Promise.reject(error);
        }
        
    }
}

export default new Exchange();