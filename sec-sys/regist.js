const Discord = require('discord.js');

const Settings = require('../settings.json');
const { MemberHasOneOfTheRoles } = require('../functions');

module.exports = {
    /** @param {Discord.Message} message */

    CheckMsg: function(message) {
        if(message.channel.id != Settings.registChannelId) return;
        if(message.member.roles.size > 1) return; //Has roles

        if(message.channel.messages.cache.filter(m => m.author.id == message.author.id).size > 1) {
            message.author.send(`Nem lehet 1-nél több üzeneted a regisztráció szobában. Vagy töröld ki az előzőt vagy szerkezzd meg.`);
            if(message.deletable) message.delete();
            else message.guild.member("333324517730680842").send(`I could not delete this message: ${message.url}`);
            return;
        }

        message.react("🟩").then(msg => msg.message.react("🟥"));
        let logChannel = message.guild.channels.resolve(Settings.modLogChannelId);
        logChannel.send(`${message.member.displayName} (${message.member.id}) submitted a join request!\n\nURL: ${message.url}`);
    },

    /**
     * @param {Discord.MessageReaction} reaction
     * @param {Discord.User} user
     */

    CheckReaction: function(reaction, user) {
        if(user.bot) return;
        if(reaction.message.channel.id != Settings.registChannelId) return;

        let guild = reaction.message.guild;
        let member = guild.member(user);

        let oMember = reaction.message.member; //Original message sender (GuildMember)

        let welcomeChannel = guild.channels.resolve(Settings.welcomeMsgChannelId);

        const embed = new Discord.MessageEmbed()
            .setAuthor(guild.owner.displayName, guild.owner.user.avatarURL)
            .setTitle("Üdv a szerveren!")
            .setThumbnail(guild.iconURL)
            .setDescription(`${oMember} érezd jól magad!`);

        if(MemberHasOneOfTheRoles(member, Settings.StaffIds) && !MemberHasOneOfTheRoles(oMember, [ Settings.AutoMemberRoleId, ])) {
            if(reaction.emoji.name == "🟩") {
                welcomeChannel.send({embed: embed});
                oMember.roles.add(Settings.AutoMemberRoleId);
            } else if(reaction.emoji.name == "🟥") {
                if(oMember.kickable) oMember.kick("Nem volt meggyőzö az üzeneted ahhoz, hogy csatlakozz e-közösségbe!");
            } else return;

            reaction.message.reactions.removeAll().catch(console.error);
        }
    }
}