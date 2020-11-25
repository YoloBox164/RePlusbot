import { MessageReaction, User } from "discord.js";
import SecuritySys from "../systems/security";

export default async (reaction: MessageReaction, user: User) => {
    try {
        if(reaction.partial) await reaction.fetch();
        if(user.partial) await reaction.fetch();
        SecuritySys.Regist.CheckReaction(reaction, user);
        //MovieSys.CheckReaction(reaction, user);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(error));
    }
}