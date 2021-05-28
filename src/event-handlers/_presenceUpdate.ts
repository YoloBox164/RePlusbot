import { Collection, Presence, Snowflake } from "discord.js";
import Economy from "../systems/economy";

const cooldown = new Collection<Snowflake, NodeJS.Timeout>();

export default (oldPresence: Presence | null, newPresence: Presence) => {
    const memberId = newPresence.member.id;
    const member = newPresence.member;
    
    if(!cooldown.has(memberId)) Economy.CheckWumpus(member).then(() => {
        cooldown.set(memberId, setTimeout(() => {
            cooldown.delete(memberId)
        }, 3600000)); // 1 hour cooldown
    });
}