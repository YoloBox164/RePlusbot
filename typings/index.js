/**
 * @interface cmd
 * @typedef {Object} cmd
 * @property {(bot: Discord.Client, message: Discord.Message, args: Array<string>)=>void} run
 * @property {Object} help
 * @property {string} help.cmd
 * @property {Array<string>} help.alias
 * @property {string} help.name
 * @property {string} help.desc
 * @property {string} help.usage
*/