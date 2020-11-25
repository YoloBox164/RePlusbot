import { Presence } from "discord.js";
import Economy from "../systems/economy";

export default (oldPresence: Presence | null, newPresence: Presence) => {
    Economy.CheckWumpus(newPresence.member);
}