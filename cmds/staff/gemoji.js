const Discord = require("discord.js");
const RegexpPatterns = require("../../utils/regexp-patterns");

module.exports = {
    /**
     * @param {Discord.Client} bot The bot itself.
     * @param {Discord.Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: (message, args) => {
        if(!message.member.permissions.has("MANAGE_EMOJIS", true)) {
            message.channel.send("Nincsen emotikon kezelési jogusultságod.");
            return;
        }

        const emojiString = args[0];
        if(!emojiString) {
            message.channel.send("Nincs emoji megadva!");
            return;
        }
        const matches = RegexpPatterns.GuildEmojiId.exec(emojiString);
        if(!matches && !matches[1]) return;

        const emoji = message.client.emojis.resolve(`${matches[1]}`);
        if(emoji) {
            const roles = [];
            const matches2 = message.content.match(Discord.MessageMentions.ROLES_PATTERN);
            if(matches2 && matches2.length > 0) for(const role of matches2) roles.push(role.replace(/[<@&>]/g, ""));
            emoji.roles.set(roles);
        }
    },
    args: true,
    name: "gemoji",
    aliases: [],
    desc: "Társíts guild emojikat egy vagy több ranghoz! Ha nem adsz meg semilyen rangot akkor azt mindenki használhatja úgyan úgy.",
    usage: ">gemoji [emoji] <Roles>"
};