import { Message, MessageReaction, TextChannel, User } from "discord.js";
import { Channels, StaffIds, Roles } from "../../settings.json";
import EmbedTemplates from "../../utils/embed-templates";
import { MemberHasOneOfTheRoles } from "../../utils/tools";

export function CheckMsg(message: Message) {
    if(message.channel.id != Channels.registId) return;
    if(message.member.roles.cache.size > 1) return; // Has roles

    if(message.channel.messages.cache.filter(m => m.author.id == message.author.id).size > 1) {
        message.author.send("Nem lehet 1-nél több üzeneted a regisztráció szobában. Vagy töröld ki az előzőt vagy szerkezzd meg.");
        if(message.deletable) message.delete();
        else message.guild.member("333324517730680842").send(`I could not delete this message: ${message.url}`);
        return;
    }

    message.react("🟩").then(msg => msg.message.react("🟥"));

    const embed = EmbedTemplates.JoinRequest(message);

    message.client.logChannel.send({ embed: embed });
}


export function CheckReaction(reaction: MessageReaction, user: User) {
    if(user.bot) return;
    if(reaction.message.channel.id != Channels.registId) return;

    const guild = reaction.message.guild;
    const member = guild.member(user);

    const oMember = reaction.message.member; // Original message sender (GuildMember)

    const welcomeChannel = <TextChannel>guild.channels.resolve(Channels.welcomeMsgId);

    if(MemberHasOneOfTheRoles(member, StaffIds) && !MemberHasOneOfTheRoles(oMember, [ Roles.AutoMemberId ])) {
        if(reaction.emoji.name == "🟩") {
            if(reaction.message.deletable) reaction.message.delete();
            const embed = EmbedTemplates.Join(guild, oMember);
            welcomeChannel.send({ embed: embed });
            oMember.roles.add([Roles.AutoMemberId, Roles.AutoSeparator]);
        } else if(reaction.emoji.name == "🟥") {
            if(reaction.message.deletable) reaction.message.delete();
            if(oMember.kickable) oMember.kick("Nem volt meggyőzö az üzeneted ahhoz, hogy csatlakozz e-közösségbe!");
        } else { return; }
    }
}

export default {
    CheckMsg,
    CheckReaction
}