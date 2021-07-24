import { Message, MessageEmbed } from "discord.js";
import { Command } from "../../command-handler";
import GetMember from "../../utils/tools/getmember";

class Avatar extends Command {
  public category = "Info";
  public args = ["<felhasználó>"];
  public isDev = false;

  public name = "Avatar";
  public aliases = ["profile"];
  public desc = "Nézd meg sajátod vagy más avatárját.";

  constructor() {
    super();
    this.init();
  }

  public async run(message: Message, args: Array<string>) {
    const msg = await message.channel.send("Avatár lehívása folyamatban...");
    const target = GetMember(message, args);

    const avatarUrl = target.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true });

    const embed = new MessageEmbed()
      .setTitle(`${target.displayName} avatárja`)
      .setDescription(`[Avatar LINK](${avatarUrl})`)
      .setImage(avatarUrl)
      .setColor(target.displayHexColor);

    message.channel.send({ embed: embed }).then(() => msg.delete());
  }
}

export default new Avatar();
