const Discord = require("discord.js");
const RegexpPatterns = require("../../utils/regexp-patterns");

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */
module.exports.run = (bot, message, args) => {
    if(!message.member.permissions.has("MANAGE_EMOJIS", true)) {
        message.channel.send("Nincsen emotikon kezelési jogusultságod.");
        return;
    }

    let emojiString = args[0];
    if(!emojiString) {
        message.channel.send("Nincs emoji megadva!");
        return;
    }
    let matches = RegexpPatterns.GuildEmojiId.exec(emojiString);
    if(!matches && !matches[1]) return;

    let emoji = bot.emojis.resolve(`${matches[1]}`);
    if(emoji) {
        let roles = [];
        let matches = message.content.match(Discord.MessageMentions.ROLES_PATTERN);
        if(matches && matches.length > 0) for(const role of matches) roles.push(role.replace(/[<@&>]/g, ''));
        emoji.roles.set(roles);
    }
}

module.exports.help = {
    cmd: "gemoji",
    alias: [],
    name: "Guild Emoji",
    desc: "Társíts guild emojikat egy vagy több ranghoz! Ha nem adsz meg semilyen rangot akkor azt mindenki használhatja úgyan úgy.",
    usage: ">gemoji [emoji] <Roles>",
    category: "staff"
}