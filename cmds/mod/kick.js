const Discord = require("discord.js");

const Tools = require("../../utils/tools");
const Settings = require("../../settings.json");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("KICK_MEMBERS", true)) {
            message.channel.send("Nincsen jogod használni ezt a paracsot.");
            return;
        }
        if(!args[0]) {
            message.channel.send(`Kérlek adj meg egy felhasználót.\`Segítség => ${this.usage}\``);
            return;
        }
        const target_memberId = args[0].match(Discord.MessageMentions.USERS_PATTERN)[0].replace(/[<@!>]/g, "");
        const target_member = message.guild.member(target_memberId);
        if(!target_member) {
            message.channel.send(`Nincs ilyen felhasználó.\`Segítség => ${this.usage}\``);
            return;
        }
        if(target_member.id == message.member.id) {
            message.channel.send("Magadat nem rúghatod ki!");
            return;
        }
        let reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs.";
        if(target_member.kickable) target_member.kick(reason);
        else message.channel.send("Nem tudod kirúgni ezt a felhasználót.");
    },
    args: true,
    name: "kick",
    aliases: ["kirug", "kirugas"],
    desc: "A Botnak a saját kick parancsa.",
    usage: ">kick [felhasználó tag-je] <kirúgás oka>"
};