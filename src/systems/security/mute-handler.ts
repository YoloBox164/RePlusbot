import fs from "fs";
import Settings from "../../settings.json";
import MutedUsers from "./muted-users.json";
import EmbedTemplates from "../../utils/embed-templates";
import { Guild, GuildMember, TextChannel } from "discord.js";

class MuteHandler {

    /** Relative to bot.js */
    private static MuteJsonPath = `${module.path}\\muted-users.json`;

    public static MutedUsers: { [id: string]: number } = MutedUsers;

    public static Restart(guild: Guild) {
        for(const userId in this.MutedUsers) {
            if(this.MutedUsers[userId]) {
                const time = this.MutedUsers[userId];
                if(time > Date.now()) this.Remove(guild.member(userId));
                else setTimeout(this.Remove.bind(MuteHandler, null, guild.member(userId)), time - Date.now());
            }
        }
    }

    public static Add(member: GuildMember, time: number) {
        const muteRole = member.guild.roles.resolve(Settings.Roles.MuteId);
        if(member.roles.highest.position < member.guild.member(member.client.user).roles.highest.position) {
            this.MutedUsers[`${member.id}`] = Date.now() + time;
            member.roles.add(muteRole).catch(console.error);
            setTimeout(this.Remove.bind(MuteHandler, null, member), time);
            fs.writeFile(this.MuteJsonPath, JSON.stringify(this.MutedUsers, null, 4), err => { if(err) throw err; });
        } else {
            const logChannel = member.client.channels.resolve(Settings.Channels.modLogId);
            (<TextChannel>logChannel).send(EmbedTemplates.Error(`Nem tudom hozzá adni a ${member} felhasználóhoz a ${muteRole} rangot!`));
        }
    }

    public static Remove(member: GuildMember) {
        delete this.MutedUsers[`${member.id}`];
        if(member.roles.cache.has(Settings.Roles.MuteId)) {
            member.roles.remove(Settings.Roles.MuteId).catch(console.error);
        }
        fs.writeFile(this.MuteJsonPath, JSON.stringify(this.MutedUsers, null, 4), err => { if(err) throw err; });
    }
}

export default MuteHandler;