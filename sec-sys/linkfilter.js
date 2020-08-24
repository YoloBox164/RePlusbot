const EmbedTemplates = require("../utils/embed-templates");
const RegexpPatterns = require("../utils/regexp-patterns");
const Database = require("../database");

/** @type {Array<string>}  */
const BannedPages = require("./blacklisted/pornwebpages.json").concat(require("./blacklisted/webpages.json"));

module.exports = {
    /**
     * @param {import("discord.js").Message} message
     * @returns {Boolean} If the message got deleted true, otherwise false.
    */
    Check: function(message) {
        const matches = message.content.match(RegexpPatterns.LinkFinder);
        let found = false;
        let isDiscordLink = false;
        if(matches != null && matches.length > 0) {
            for(const link of matches) {
                const match = RegexpPatterns.LinkFinder.exec(link);
                let groups = null;
                if(match) groups = match.groups;
                if(groups && groups.Domain && groups.TLD) {
                    found = BannedPages.some(l => l == `${groups.Domain}.${groups.TLD}`);
                    if(groups.FullDomain == "discord.gg") isDiscordLink = true;
                }
            }
        }

        if(found) {
            let reason = "Fekete listán lévő oldal küldése.";
            let respReason = "fekete listán lévő oldalt küldtél";

            if(isDiscordLink) {
                reason = "Discord meghívó link küldése engedély nélkül.";
                respReason = "discord meghívó linket küldtél engedély nélkül";
            }

            Database.GetData("Users", message.author.id).then(userData => {
                let blLinks = 1;
                let warns = 0;
                let exp = 0;
                if(userData) {
                    blLinks += userData.blLinks;
                    warns += userData.warns;
                    exp = userData.exp - 100;
                    if(exp < 0) exp = 0;
                }
                if(blLinks === 3) {
                    warns++;
                    /** @type {import("../database").Warnings} */
                    const warning = {
                        userId: message.author.id,
                        time: Date.now(),
                        warning: "Háromszori fekete listán lévő oldal küldése után járó figyelmeztetés!"
                    };
                    Database.SetData("Warnings", warning).then(() => {
                        message.channel.send(`**${message.member}, ez a 3. fekete listán lévő oldal amit elküldtél. Most egy hivatalos figyelmeztetést kapsz, ami a profilodon is meg fog látszani. Ha a következőkben folytatod akkor ki leszel rúgva (kick) a szerveről.**`);
                        const warnEmbed = EmbedTemplates.Warning(message, message.member, message.guild.member(message.client.user), warning.warning);
                        message.client.automodLogChannel.send({ embed: warnEmbed });
                    });
                }
                Database.SetData("Users", {
                    id: message.author.id,
                    tag: message.author.tag,
                    blLinks: blLinks,
                    warns: warns,
                    exp: exp
                });
            });

            const logEmbed = EmbedTemplates.MsgDelete(message, reason);
            message.client.automodLogChannel.send({ embed: logEmbed });

            message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${respReason}.**`);

            if(message.deletable) message.delete({ reason: reason });
            return true;
        }
        return false;
    }
};