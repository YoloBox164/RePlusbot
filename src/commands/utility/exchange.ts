import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../command-handler";
import axios from "axios";

class Exchange extends Command {
  public category = "Utility";
  public args = ["<érték>", "<valutaból>", "<másik valutába>"];
  public isDev = false;

  public name = "Exchange";
  public aliases = ["change", "currency", "ex"];
  public desc = "Valuta átváltó | használd ISO 4217 valuta kódokat (pl.: HUF, EUR, USD, stb.)";

  constructor() {
    super();
    this.init();
  }

  public async run(message: Message, args: Array<string>) {
    try {
      const msg = await message.channel.send("Átváltás...");
      const isoCurrMap = await axios.get<ISOCurrencyMapResponse>(
        "http://www.localeplanet.com/api/auto/currencymap.json",
        { responseType: "json" }
      );

      const valueIsNaN = Number(args[0]) !== Number(args[0]);

      const val = valueIsNaN ? 1 : Number(args[0]);
      let fr: string, to: string;

      if (valueIsNaN) {
        fr = args[0]?.toUpperCase();
        to = args[1]?.toUpperCase();
      } else {
        fr = args[1]?.toUpperCase();
        to = args[2]?.toUpperCase();
      }

      fr ||= "EUR";
      to ||= "HUF";

      const response = await axios.get<ExchangeRateAPIResponse>(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API}/pair/${fr}/${to}`,
        { responseType: "json" }
      );

      if (response.data.result === "error") {
        message.channel.send(response.data["error-type"]);
        return;
      }

      const embed = new MessageEmbed()
        .setThumbnail("https://www.exchangerate-api.com/img/logo-square.png")
        .setTitle(`${fr} => ${to}`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL({ size: 4096, format: "png", dynamic: true }))
        .setColor(message.guild.member(message.client.user).displayHexColor)
        .addField(
          "Eredmény",
          `\`\`\`${response.data.conversion_rate * val} ${isoCurrMap.data[to].symbol_native}\`\`\``
        );

      message.channel.send({ embed: embed }).then(() => msg.delete());
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default new Exchange();
