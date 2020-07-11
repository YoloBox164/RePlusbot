const Discord = require('discord.js');

const Settings = require('../settings.json');
const SecEmbed = require('./embed');

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
                let { groups } = regexp.exec(link);
                if(groups && groups.Domain && groups.TLD) {
                    found = BannedPages.some(link => link == `${groups.Domain}.${groups.TLD}`);
                    if(groups.FullDomain == "discord.gg") isDiscordLink = true;
                }
            }
        }
        
        if(found) {
            /**@type {Discord.TextChannel} */
            let logChannel = message.client.channels.resolve(Settings.modLogChannelId);
            let msg = "Fekete listán lévő oldal küldése.";
            if(isDiscordLink) msg = "Discord meghívó link küldése.";
            let embed = SecEmbed.Get(message, msg);
            logChannel.send({embed: embed});
            if(message.deletable) message.delete({reason: msg});
            return true;
        }
        return false;
    }
}