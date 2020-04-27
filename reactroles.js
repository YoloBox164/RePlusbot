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
        if(reaction.emoji != NSFWReactEmoji) return;

        var guild = reaction.message.guild;
        var NSWFRole = guild.roles.resolve(Settings.NSWFRoleId);
        var member = guild.member(user);
        
        member.addRole(NSWFRole).catch(console.error);
    }
}