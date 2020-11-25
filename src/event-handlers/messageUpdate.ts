import { Message } from "discord.js";
import SecuritySys from "../systems/security";
import Config from "../config.json";
import { MemberHasOneOfTheRoles } from "../utils/tools";
import { StaffIds } from "../settings.json";


export default async (oldMessage: Message, newMessage: Message) => {
    if(oldMessage.partial) await oldMessage.fetch();
    if(newMessage.partial) await newMessage.fetch();

    if(newMessage.author.bot) return;
    if(newMessage.channel.type === "dm") return;

    if(Config.mode === "development" || !MemberHasOneOfTheRoles(newMessage.member, StaffIds)) {
        if(SecuritySys.Automod.LinkFilter.Check(newMessage)) return;
        if(SecuritySys.Automod.WordFilter.Check(newMessage)) return;
    }
}