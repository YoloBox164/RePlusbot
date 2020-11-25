import { Invite } from "discord.js";
import inviteLogHandler from "../systems/invite";

export default (invite: Invite) => {
    inviteLogHandler(invite, "Deleted");
}