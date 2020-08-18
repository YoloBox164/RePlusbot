const Database = require("../../database");
const Settings = require("../../settings.json");

const Tools = require("../../utils/tools");
const EmbedTemplates = require("../../utils/embed-templates");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: (message, args) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != message.client.devId) {
            return message.channel.send("Nincs jogod ehez a parancshoz.");
        }

        const targetMember = Tools.GetMember(message, args, false);

        if(targetMember) {
            let reason = args.slice(1).join(" ");
            if(!reason) reason = "Nincs";
            const issuer = message.member;

            if(targetMember.id == issuer.id && !message.client.devId) {
                return message.channel.send("Magadnak nem adhatsz figyelmeztetést.");
            }

            let userData = Database.GetData("users", targetMember.id);
            if(!userData) userData = { id: targetMember.id, warns: 1 };
            else userData.warns += 1;
            Database.SetData("users", userData);

            /** @type {import('../../database').Warnings} */
            const warning = {
                userId: targetMember.id,
                warning: reason,
                time: Date.now()
            };
            Database.SetData("warnings", warning);

            message.channel.send(`${targetMember} figyelmeztetve lett.\n**Figyelmeztetés Oka**: '${reason}'.`);
            /** @type {Discord.TextChannel} */
            const logChannel = message.client.logChannel;

            const embed = EmbedTemplates.Warning(message, targetMember, issuer, reason);

            const conLogMsg = `Warned ${targetMember.displayName} (Id: ${targetMember.id}) by ${issuer.displayName} (Id: ${issuer.id})`;

            logChannel.send(embed);
            console.log(conLogMsg);
        } else {return message.channel.send(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => \`${this.usage}\``);}
    },
    args: true,
    name: "warn",
    aliases: ["figyelmeztet"],
    desc: "Egy egyszerű figyelmeztető rendszer",
    usage: ">warn [felhasználó] <Figyelmeztetés oka>"
};