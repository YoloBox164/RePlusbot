const Discord = require("discord.js");

const Tools = require("../../utils/tools");
const Settings = require("../../settings.json");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && !message.member.permissions.has("BAN_MEMBERS", true)) {
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
            message.channel.send("Magadat nem tilthatod ki!");
            return;
        }
        let reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs.";
        if(target_member.bannable) target_member.ban({ reason: reason });
        else message.channel.send("Nem tudod kitiltani ezt a felhasználót.");
    },
    args: true,
    name: "ban",
    aliases: ["kitilt", "kitiltas"],
    desc: "A Botnak a saját ban parancsa.",
    usage: ">ban [felhasználó tag-je] <kitiltás oka>"
};