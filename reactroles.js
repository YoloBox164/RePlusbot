const Discord = require('discord.js');

const Settings = require('./settings.json');

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

        var guild = reaction.message.guild;
        var NSWFRole = guild.roles.get(Settings.NSWFRoleId);
        var member = guild.member(user);
        
        member.addRole(NSWFRole).catch(console.error);
    }
}