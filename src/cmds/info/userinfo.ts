import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import Database, { Warnings } from "../../systems/database";
import BaseCommand from "../../structures/base-command";
import Tools from "../../utils/tools";
import LevelSystem from "../../systems/level"
import { Prefix } from "../../settings.json";

class UserInfo implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "userinfo";
    aliases = ["user"];
    desc = "Információk a te profilodról vagy máséról.";
    usage = `${Prefix}userinfo <felhasználó>`;

    public async execute(message: Message, args?: string[]) {
        const targetMember = Tools.GetMember(message, args);
        const roleArr = targetMember.roles.cache.array();
        roleArr.pop();
        let roles = roleArr.join(" | ");
        if(!roles) roles = "Nincsen rangja.";

        const msg = await message.channel.send("Adatok rendezése...");
        const warnings: Warnings[] = await Database.Connection.query("SELECT * FROM Warnings WHERE userId = ?;", [targetMember.id]);
        const warningStringArr: string[] = [];
        for(const { warning, time } of warnings) {
            warningStringArr.push(`'${warning}' (${message.client.logDate(time)})`);
        }

        const userData = await Database.GetData("Users", targetMember.id);

        if(!warningStringArr[0]) warningStringArr[0] = "Nincs";

        const attach = new MessageAttachment(await LevelSystem.GetImageBuffer(targetMember), "exp.png");

        const avatarURL = targetMember.user.displayAvatarURL({ size: 4096, format: "png", dynamic: true });
        const embed = new MessageEmbed()
            .setAuthor(targetMember.user.tag, avatarURL)
            .setThumbnail(avatarURL)
            .setTitle("Felhasználói információ:")
            .setColor(targetMember.displayHexColor)
            .attachFiles([attach])
            .setImage("attachment://exp.png")
            .setDescription(
                `**Név:** *${targetMember}*
                **Státusz:** \`${targetMember.presence.status.toUpperCase()}\`
                **Teljsen Felhasználói név:** *${targetMember.user.username}#${targetMember.user.discriminator}*
                **ID:** *${targetMember.id}*\n
                **Szerverre Csatlakozott:** *${message.client.logDate(targetMember.joinedTimestamp)}*
                **Felhasználó létrehozva:** *${message.client.logDate(targetMember.user.createdTimestamp)}*
                **Rangok:** *${roles}*\n
                **Figyelmeztetések:**
                ${warningStringArr.join("\n")}`
            ).addField("Statok",
                `Összes elküldött üzenet: ${userData?.messages | 0}
                Parancs használatok száma: ${userData?.commandUses | 0}
                
                Hangszobákban töltött idő: ${Tools.RedableTime(userData?.allTime | 0)}`
            );
        msg.channel.send({ embed: embed }).then(() => msg.delete({ reason: "Done waiting." }));
    };
    
}

export default new UserInfo();