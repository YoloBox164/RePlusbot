export default {
    GuildEmojiId: /<:\w{2,}:(\d+)>/g,
    DiscordMsgURL: /https:\/\/discordapp\.com\/channels\/(?<guildId>\d+)\/(?<channelId>\d+)\/(?<messageId>\d+)/g,
    LinkFinder: /\b(?<!@)(?:(?!\d+)(?:(?<Protocol>\w+):\/\/)?(?<FullDomain>(?:(?:(?<www>w{0,3})\.)?(?<Domain>[\w-.]+)\.(?!\d+)(?<TLD>\w{2,3}))|(?:(?:\d{1,3})\.(?:\d{1,3})\.(?:\d{1,3})\.(?:\d{1,3})(?::?\d{1,6})))){1,68}(?<AfterString>\/[\w./-]*)?\b/gi
};