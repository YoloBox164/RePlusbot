const Discord = require('discord.js');

const Settings = require('./settings.json');

const NSFWReactEmoji = "🔞";

module.exports = {
    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
    */
    CheckNSFW: function(reaction, user) {
        if(user.bot) return;
        /** @type {Discord.TextChannel} */
        var channel = reaction.message.channel;
        if(channel.id != Settings.reactChannelId) return;
        if(reaction.emoji.name != NSFWReactEmoji) return;
        
        var guild = reaction.message.guild;
        var NSWFRole = guild.roles.resolve(Settings.NSWFRoleId);
        var member = guild.member(user);
        
        if(!member.roles.cache.get(NSWFRole.id)) member.roles.add(NSWFRole).catch(console.error);
        else member.roles.remove(NSWFRole).catch(console.error);
    }
}

module.exports.help = {
    NSFWReactMessage: "704118261226143744"
}