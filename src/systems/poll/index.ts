import { Collection, GuildMember, Message, Snowflake } from "discord.js";

class PollSystem {
    public static Polls = new Collection<Snowflake, Poll>();
}

export default PollSystem;

class Poll {
    public creator: GuildMember;
    public text: string;
    public votes: Collection<Snowflake, Vote>;
    public options: Collection<number, string>;
    public connectedMessage: Message;

    public constructor(message: Message) {
        this.creator = message.member;
        this.text = message.content;
        this.votes = new Collection<Snowflake, Vote>();
        this.options = new Collection<number, string>();
        this.connectedMessage = message;
    }
}

class Vote {
    public voter: GuildMember;
    public option: string;
    public timestampt: number;

    public constructor(voter: GuildMember, ) {
        this.voter = voter;
    }
}