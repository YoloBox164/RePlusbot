const Discord = require('discord.js');

const Database = require('../../database');
const Settings = require('../../settings.json');

const Tools = require('../../utils/tools.js');
const EmbedTemplates = require('../../utils/embed-templates');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
*/
module.exports.run = (bot, message, args) => {
    if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds) && message.author.id != bot.devId) {
        return message.channel.send("Nincs jogod ehez a parancshoz.");
    }
    
    const targetMember = Tools.GetMember(message, args, false);

    if(targetMember) {
        let reason = args.slice(1).join(" ");
        if(!reason) reason = "Nincs";
        let issuer = message.member;

        if(targetMember.id == issuer.id && !bot.devId) {
            return message.channel.send("Magadnak nem adhatsz figyelmeztetést.");
        }

        let userData = Database.GetData("users", targetMember.id);
        if(!userData) userData = { id: targetMember.id, warns: 1 };
        else userData.warns += 1;
        Database.SetData('users', userData);

        /** @type {import('../../database').warnings} */
        const warning = {
            userid: targetMember.id,
            warning: reason,
            time: Date.now()
        }
        Database.SetData('warnings', warning);

        message.channel.send(`${targetMember} figyelmeztetve lett.\n**Figyelmeztetés Oka**: '${reason}'.`);
        /**@type {Discord.TextChannel} */
        const logChannel = bot.logChannel;
        
        const embed = EmbedTemplates.Warning(message, targetMember, issuer, reason);

        let conLogMsg = `Warned ${targetMember.displayName} (Id: ${targetMember.id}) by ${issuer.displayName} (Id: ${issuer.id})`;

        logChannel.send(embed);
        console.log(conLogMsg);
    } else return message.channel.send(`Nem találtam ilyen felhasználót.\n\n\`Segítség\` => \`${this.help.usage}\``);
}

module.exports.help = {
    cmd: "warn",
    alias: ["figyelmeztet"],
    name: "Figyelmeztetés",
    desc: "Egy egyszerű figyelmeztető rendszer",
    usage: ">warn [felhasználó] <Figyelmeztetés oka>",
    category: "staff"
}