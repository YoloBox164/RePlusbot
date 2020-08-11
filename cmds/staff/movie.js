const Settings = require("../../settings.json");
const RegexpPatterns = require("../../utils/regexp-patterns");

const MoiveSys = require("../../movie-sys");
const Tools = require("../../utils/tools");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: (message, args) => {
        if(!Tools.MemberHasOneOfTheRoles(message.member, Settings.StaffIds)) {
            message.channel.send("Nincs jogosultságod ezt a parancsot használni.");
            return;
        }
        if(!args[0]) {
            message.channel.send("Nem találtam megfelelő Discord Üzenet Linket!");
            return;
        }
        const match = RegexpPatterns.DiscordMsgURL.exec(args[0]);
        if(!match || !match.groups) {
            message.channel.send("Nem találtam megfelelő Discord Üzenet Linket!");
            return;
        }
        if(match.groups.guildId != message.guild.id) return;
        /** @type {Discord.TextChannel} */
        const movieMsgChannel = message.client.channels.resolve(match.groups.channelId);
        if(!movieMsgChannel) return;
        movieMsgChannel.messages.fetch(match.groups.messageId, true).then(movieMsg => {
            const MovieMessages = MoiveSys.GetJSON();
            MovieMessages[`${movieMsg.id}`] = {
                AuthorId: movieMsg.author.id,
                ChannelId: movieMsgChannel.id
            };
            MoiveSys.AddToJSON(MovieMessages);
            movieMsg.react(Settings.emojis.ticket);
            message.channel.send("Sikeresen létrehoztál egy jegy vásárlói üzenetet. Az üzenet törlésével tudod megállítani a jegyek vásárlását.");
        }).catch(console.error);
    },
    name: "movie",
    aliases: ["film"],
    desc: "Ezzel a parancsal tudsz üzeneteket jegy vásárlói üzeneté tenni. Egészen addig érvényes egy ilyen üzenet amíg az nem kerül törlésre.",
    usage: ">movie [Discord Üzenet Link]"
};