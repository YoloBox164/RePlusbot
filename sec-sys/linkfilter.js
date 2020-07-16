const Discord = require('discord.js');

const Settings = require('../settings.json');
const EmbedTemplates = require('../utils/embed-templates');

const BannedPages = require('./blacklisted/pornwebpages.json').concat(require('./blacklisted/webpages.json'));

let regexp = /\b(?<!@)(?:(?!\d+)(?:(?<Protocol>\w+):\/\/)?(?<FullDomain>(?:(?:(?<www>w{0,3})\.)?(?<Domain>[\w-\.]+)\.(?!\d+)(?<TLD>\w{2,3}))|(?:(?:\d{1,3})\.(?:\d{1,3})\.(?:\d{1,3})\.(?:\d{1,3})(?::?\d{1,6})))){1,68}(?<AfterString>\/[\w\/]*)?\b/gi;

module.exports = { 
    /** 
     * @param {Discord.Message} message
     * @returns {Boolean} If the message got deleted true, otherwise false.
    */
    Check: function(message) {
        let matches = message.content.match(regexp);
        let found = false;
        let isDiscordLink = false;
        if(matches != null && matches.length > 0) {
            for(const link of matches) {
                let match = regexp.exec(link);
                let groups = null;
                if(match) groups = match.groups;
                if(groups && groups.Domain && groups.TLD) {
                    found = BannedPages.some(link => link == `${groups.Domain}.${groups.TLD}`);
                    if(groups.FullDomain == "discord.gg") isDiscordLink = true;
                }
            }
        }
        
        if(found) {
            /**@type {Discord.TextChannel} */
            let logChannel = message.client.channels.resolve(Settings.Channels.automodLogId);

            let reason = "Fekete listán lévő oldal küldése.";
            let respReason = "fekete listán lévő oldalt küldtél";
            
            if(isDiscordLink) {
                reason = "Discord meghívó link küldése engedély nélkül.";
                respReason = "discord meghívó linket küldtél engedély nélkül";
            }

            let logEmbed = EmbedTemplates.LogMsgDelete(message, reason);
            logChannel.send({embed: logEmbed});

            message.channel.send(`**${message.member}, üzeneted törölve lett az automod által, mert ${respReason}.**`);

            if(message.deletable) message.delete({reason: reason});
            return true;
        }
        return false;
    }
}