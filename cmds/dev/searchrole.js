const Discord = require("discord.js");

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    var guild = bot.guilds.resolve(args[1]);
    if(!guild) guild = message.guild;

    var role = guild.roles.resolve(args[0]);

    if(role) {
        var embed = new Discord.MessageEmbed()
            .setTitle("Role")
            .addField(role.name, `Name: ${role}\nID: ${role.id}\nUserCount: ${role.members.size}`);
        message.channel.send({embed: embed})
    } else {
        var roles = guild.roles.cache.array();
        var desc = [];
        for(let i in roles) {
            desc.push({
                name: roles[i].name,
                pos: roles[i].position
            });
        }
        /**
         * @param {*} array 
         * @param {*} key 
         * @returns {Array}
         */
        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        var sortedDesc = sortByKey(desc, 'pos');

        sortedDesc = sortedDesc.reverse();
        sortedDesc[sortedDesc.length - 1].name = "everyone" 
        var msg = [];
        for(let i in sortedDesc) {
            msg.push(sortedDesc[i].name/*+ " | Pos: " + sortedDesc[i].pos*/);
        }

        msg.join("\n");
        message.channel.send(msg, { split: [{char: '\n'}] })
    }
}

module.exports.help = {
    cmd: "searchrole"
}