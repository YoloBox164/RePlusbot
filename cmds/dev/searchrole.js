const Discord = require("discord.js");

module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     * @param {Array<string>} args The message.content in an array without the command.
     */
    execute: async (message, args) => {
        let guild = message.client.guilds.resolve(args[1]);
        if(!guild) guild = message.guild;

        const role = guild.roles.resolve(args[0]);

        if(role) {
            const embed = new Discord.MessageEmbed()
                .setTitle("Role")
                .addField(role.name, `Name: ${role}\nID: ${role.id}\nUserCount: ${role.members.size}`);
            message.channel.send({ embed: embed });
        } else {
            const roles = guild.roles.cache.array();
            const desc = [];
            for(const i in roles) {
                desc.push({
                    name: roles[i].name,
                    pos: roles[i].position
                });
            }

            let sortedDesc = sortByKey(desc, "pos");

            sortedDesc = sortedDesc.reverse();
            sortedDesc[sortedDesc.length - 1].name = "everyone";
            const msg = [];
            for(const i in sortedDesc) {
                msg.push(sortedDesc[i].name/* + " | Pos: " + sortedDesc[i].pos*/);
            }

            msg.join("\n");
            message.channel.send(msg, { split: [{ char: "\n" }] });
        }
    },
    name: "searchrole",
    dev: true,
    args: true
};

/**
 * @param {*} array
 * @param {*} key
 * @returns {Array}
 */
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        const x = a[key]; const y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}