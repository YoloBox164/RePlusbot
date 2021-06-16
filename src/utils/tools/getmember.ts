import { GuildMember, Message } from "discord.js";

/**
 * @param message discord message
 * @param args message.content in an array without the command
 * @param me If is this true and everyother option fails its going to return the message.member as a target.
 * @returns a discord guild member or nothing if me is false and everyother options fails
 */
export default function GetMember(message: Message, args = new Array<string>(), me = true): (GuildMember | null) {
  if(!args[0]) args = [];
  const joinedArgs = args.join(" ").toLowerCase();
  let target = message.mentions.members.first() || message.guild.members.resolve(args[0]);
  if(!target) {
    target = message.guild.members.cache.find(m => joinedArgs == m.user.tag.toLowerCase()
      || joinedArgs == m.user.username.toLowerCase()
      || joinedArgs == m.displayName.toLowerCase()
    );
  }
  if(!target) {
    target = message.guild.members.cache.find(m => joinedArgs.includes(m.user.tag.toLowerCase())
      || joinedArgs.includes(m.user.username.toLowerCase())
      || joinedArgs.includes(m.displayName.toLowerCase())
    );
  }
  if(!target && me) target = message.member;
  return target; // give back a guildmember
}