module.exports = {
    GetTargetForEmbed: function(message, args) {
        var joinedArgs = args.join(" ").toLowerCase();
        var target = message.mentions.users.first()
            || message.guild.members.find(member => joinedArgs.includes(member.displayName.toLowerCase()))
            || message.guild.members.get(args[0])
            || message.author;
        
        return target;
    }
}