export default interface BaseAutoRole {
    roleId: string,
    emoji: string,
    reactMessage: {
        id: string,
        channelId: string
    }
}