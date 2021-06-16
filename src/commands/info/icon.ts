import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../command-handler";

class Icon extends Command {
  public category = "Info";
  public args = [];
  public isDev = false;

  public name = "Icon";
  public aliases = ["servericon", "ico"];
  public desc = "Megjeleníti a szerver ikont.";

  constructor() {
    super();
    this.init();
  }

  public async run(message: Message) {
    if(!message.guild.iconURL()) { message.channel.send("Ennek a szervernek nincsen ikonja."); return; }
    const msg = await message.channel.send("Szerver ikon lehívása...");
    const embed = new MessageEmbed()
      .setTitle("Szerver Ikon")
      .setDescription(`[Ikon LINK](${message.guild.iconURL({ format: "png", size: 4096 })})`)
      .setImage(message.guild.iconURL({ format: "png", size: 4096 }))
      .setColor(message.member.displayHexColor);

    message.channel.send({ embed: embed }).then(() => msg.delete());
  }

}

export default new Icon();