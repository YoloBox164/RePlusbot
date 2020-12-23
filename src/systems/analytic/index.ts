import { Client, Collection, GuildMember, User, VoiceChannel, VoiceState } from "discord.js";
import Database, { Users } from "../database";
import LevelSystem from "../level";
import CounterHandler from "./counters";

/*
 * ╔══════════════╦══════════════╦═══════╗
 * ║ oldChannelId ║ newChannelId ║ state ║
 * ╠══════════════╬══════════════╬═══════╣
 * ║ undefined    ║ string       ║ join  ║
 * ║ string       ║ null         ║ leave ║
 * ╚══════════════╩══════════════╩═══════╝
*/

/*
 ! If only one user is in the channel their activity timer stops

Channel {
    User1: Online / Muted / Deafend / Away
}*/

/*
 ! If only one user is active then all of their activity timers stops

Channel {
    User1: Muted / Deafend / Away
    User2: Online
}*/

/*
 ! If two or more user is active at the same time then their timers
 ! run and only the muted / deafend / away users' timers stops

Channel {
    User1: Muted / Deafend / Away
    User2: Online
    User3: Online
}*/

class AnalyticSystem {

    public static counterHandler: CounterHandler;
    
    public static Init(client: Client) {
        this.counterHandler = new CounterHandler();
        //Only runs if one or more were inside the save json
        for(const userId in this.counterHandler.counters) {
            const member = client.mainGuild.members.resolve(userId);
            if(!member) continue;
            this.CalcVoiceTime(member).catch(console.error);
            this.counterHandler.ResetSaveJSON();
        }

        for(const [, channel ] of client.channels.cache.filter(c => c.type === "voice")) {
            const groups = this.GroupUsers(<VoiceChannel>channel);
            this.CheckGroups(groups, Date.now());
        }
    }

    public static async Shut() {
        for(const userId in this.counterHandler.counters) {
            this.counterHandler.Stop(userId, Date.now());
        }
        try {
            await this.counterHandler.SaveToJSON();
            return Promise.resolve("DONE");
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Logic Order
     * 1. Get basic data
     * 2. Check groups where the user joined if there is one
     * 3. Check groups where the user left if there is one
     */
    public static Logic(oldState: VoiceState, newState: VoiceState) {
        const now = Date.now();
        const userAction = this.GetUserAction(oldState, newState);
        const member = newState.member;

        if(userAction === UserAction.LEAVE) {
            const oldGroups = this.GroupUsers(oldState.channel);
            this.CheckGroups(oldGroups, now);

            if(this.counterHandler.Has(member.id)) {
                this.counterHandler.Stop(member.id, now);
                this.CalcVoiceTime(member).catch(console.error);
            }
        } else if(userAction === UserAction.CHANGE) {
            const oldGroups = this.GroupUsers(oldState.channel);
            this.CheckGroups(oldGroups, now);

            const newGroups = this.GroupUsers(newState.channel);
            this.CheckGroups(newGroups, now);
        } else if(userAction === UserAction.JOIN || userAction === UserAction.UPDATE) {
            const newGroups = this.GroupUsers(newState.channel);
            this.CheckGroups(newGroups, now);
        }
    }

    private static CheckGroups(groups: Groups, timestampt: number) {
        if(groups["ON"].size === 0 && groups["OFF"].size === 0) return;

        // Start counting when 2 or more users are active
        if(groups["ON"].size > 1) {
            for(const [ id ] of groups["ON"]) {
                this.counterHandler.Start(id, timestampt);
            }
        } else {
            // Stop the counter for the only active user if there is one
            for(const [ id, member ] of groups["ON"]) {
                if(this.counterHandler.Has(id)) {
                    this.counterHandler.Stop(id, timestampt);
                    this.CalcVoiceTime(member).catch(console.error);
                }
            }
        }

        // Stop the counters for every unactive user
        for(const [ id, member ] of groups["OFF"]) {
            if(this.counterHandler.Has(id)) {
                this.counterHandler.Stop(id, timestampt);
                this.CalcVoiceTime(member).catch(console.error);
            }
        }
    }
 
    private static GroupUsers(channel: VoiceChannel) {
        const groups = {
            "OFF": new Collection<string, GuildMember>(),
            "ON": new Collection<string, GuildMember>(),
        }

        channel.members.forEach((member, id) => {
            if(!member.user.bot) {
                if(member.voice.mute || member.presence.status === "idle") {
                    groups["OFF"].set(id, member);
                } else {
                    groups["ON"].set(id, member);
                }
            }
        });
        return groups;
    }

    private static GetUserAction(oldState: VoiceState, newState: VoiceState) {
        if(!oldState.channelID && newState.channelID) return UserAction.JOIN;
        if(oldState.channelID && !newState.channelID) return UserAction.LEAVE;
        if(oldState.channelID === newState.channelID) return UserAction.UPDATE;
        if(oldState.channelID && newState.channelID && oldState.channelID !== newState.channelID) {
            return UserAction.CHANGE;
        }
        return null;
    }

    private static async CalcVoiceTime(member: GuildMember) {
        try {
            const userData = await Database.GetData("Users", member.id);
            if(!this.counterHandler.Has(member.id)) return Promise.reject(new Error("User not found in counters!"));
            const counter = this.counterHandler.counters[member.id];
            const pastTime = counter.end - counter.start;

            let allTime = pastTime;
            if(userData) allTime += userData.allTime;
            if(allTime < 0) allTime = 0;

            this.counterHandler.Remove(member.id);

            return Database.SetData("Users", {
                id: member.id,
                tag: member.user.tag,
                allTime: allTime
            }).then((results) => {
                LevelSystem.GiveExpVoice(member, <Users>{id: member.id, tag: member.user.tag, allTime: allTime}, pastTime);
                return results;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    
}

export default AnalyticSystem;

interface Groups {
    "OFF": Collection<string, GuildMember>;
    "ON": Collection<string, GuildMember>;
}

enum UserAction {
    "JOIN",
    "LEAVE",
    "CHANGE",
    "UPDATE"
}