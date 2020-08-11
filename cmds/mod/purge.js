const colors = require("colors/safe");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: async (message, args) => {
        if(message.member == message.guild.member(message.client.devId) || message.member.hasPermission("MANAGE_MESSAGES", { checkAdmin: true, checkOwner: true })) {
            const deleteCount = parseInt(args[0], 10);
            if(!deleteCount || (deleteCount < 1 || deleteCount > 100)) {
                message.reply("Kérlek adj meg egy számot 1 és 99 között.");
                return;
            }
            message.channel.bulkDelete(deleteCount + 1).catch(error => {
                message.channel.send(`Nem tudtam törölni. Hiba: ${error}`);
                return;
            });

            const logMsg = `${message.member.displayName} deleted ${deleteCount} messages in ${message.channel}`;

            if(message.guild == message.client.mainGuild) message.client.logChannel.send(logMsg);
            else message.client.devLogChannel.send(logMsg);
            console.log(colors.yellow(`LOG: Deleted messages: ${deleteCount}`));
        } else {
            message.channel.send("Nincs jogod hasznélni ezt a parancsot.");
            return;
        }
    },
    args: true,
    name: "purge",
    aliases: ["clear"],
    desc: "Törölj üzeneteket 1 és 100 között.",
    usage: ">purge [1 - 100]"
};