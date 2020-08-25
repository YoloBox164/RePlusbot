// ! delete dev when ready
module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
    */
    execute: (message, args) => {
        return;
    },
    args: true,
    dev: true, // ! delete dev when ready
    name: "hangman",
    aliases: ["akasztofa", "akasztófa"],
    desc: "",
    usage: ">hangman"
};