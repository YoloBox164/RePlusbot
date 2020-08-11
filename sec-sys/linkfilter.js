const Settings = require("../settings.json");
const EmbedTemplates = require("../utils/embed-templates");
const RegexpPatterns = require("../utils/regexp-patterns");

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
                    found = BannedPages.some(link => link == `${groups.Domain}.${groups.TLD}`);
                    if(groups.FullDomain == "discord.gg") isDiscordLink = true;
                }
            }
        }

        if(found) {
            /** @type {import("discord.js").TextChannel} */
            const logChannel = message.client.channels.resolve(Settings.Channels.automodLogId);

            let reason = "Fekete listán lévő oldal küldése.";
            let respReason = "fekete listán lévő oldalt küldtél";

            if(isDiscordLink) {
                reason = "Discord meghívó link küldése engedély nélkül.";
                respReason = "discord meghívó linket küldtél engedély nélkül";
            }

            const logEmbed = EmbedTemplates.MsgDelete(message, reason);
            logChannel.send({ embed: logEmbed });

            message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${respReason}.**`);

            if(message.deletable) message.delete({ reason: reason });
            return true;
        }
        return false;
    }
};