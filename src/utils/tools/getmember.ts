import { GuildMember, Message } from "discord.js";

/**
 * @param message discord message
 * @param args message.content in an array without the command
 * @param me If is this true and everyother option fails its going to return the message.member as a target.
 * @returns a discord guild member or nothing if me is false and everyother options fails
 */
export default function GetMember(message: Message, args = new Array<string>(), me = true): GuildMember | null {
  if (!args[0]) args = [];
  const joinedArgs = args.join(" ").toLowerCase();
  let target = message.mentions.members.first() || message.guild.members.resolve(args[0]);
  if (!target) {
    target = message.guild.members.cache.find(
      (member) =>
        joinedArgs == member.user.tag.toLowerCase() ||
        joinedArgs == member.user.username.toLowerCase() ||
        joinedArgs == member.displayName.toLowerCase()
    );
  }
  if (!target) {
    target = message.guild.members.cache.find(
      (member) =>
        joinedArgs.includes(member.user.tag.toLowerCase()) ||
        joinedArgs.includes(member.user.username.toLowerCase()) ||
        joinedArgs.includes(member.displayName.toLowerCase())
    );
  }
  if (!target && me) target = message.member;
  return target; // give back a guildmember
}
