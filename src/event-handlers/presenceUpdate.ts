import { Collection, Presence, Snowflake } from "discord.js";
import Economy from "../systems/economy";

const cooldown = new Collection<Snowflake, NodeJS.Timeout>();

export default (oldPresence: Presence | null, newPresence: Presence) => {
    if(!cooldown.has(newPresence.member.id)) Economy.CheckWumpus(newPresence.member).then(() => {
        cooldown.set(newPresence.member.id, setTimeout(() => {
            cooldown.delete(newPresence.member.id)
        }, 3600000)); // 1 hour cooldown
    });
}