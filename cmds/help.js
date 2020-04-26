const Discord = require('discord.js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = (bot, message, args) => {
    var pageSystem = {
        currentPage: 1,
        pages: [],
        indexHelp: []
    }

    bot.commands.forEach(cmd => {
        pageSystem.pages.push(
            `**Név:** *${cmd.help.name}*
            **Leírás:** *${cmd.help.desc}*
            **Használat:** \`${cmd.help.usage}\`${cmd.help.alias[0] ? "\n**Álnevek:** \`>" + cmd.help.alias.join(" | >") + "\`" : ""}
            **Kategória:** *${cmd.help.category}*`
        );
        pageSystem.indexHelp.push(cmd.help.cmd);
    });

    if(args[0] && isNaN(args[0])) {
        var command = bot.commands.get(args[0].toLowerCase()) || bot.commands.get(bot.aliasCmds.get(args[0].toLowerCase()));
        if(command) pageSystem.currentPage = pageSystem.indexHelp.indexOf(command.help.cmd) + 1;
        else pageSystem.currentPage = 1;
        if(pageSystem.currentPage < 1 || pageSystem.currentPage > pageSystem.pages.length) {
            pageSystem.currentPage = 1;
        }
    } else if(!isNaN(args[0])) {
        pageSystem.currentPage = parseInt(args[0]);
        if(pageSystem.currentPage > pageSystem.pages.length) {
            pageSystem.currentPage = pageSystem.pages.length;
        }
    }

    const embed = new Discord.MessageEmbed()
        .setTitle("Parancs Lista")
        .setColor(message.guild.member(bot.user).displayHexColor)
        .addField("Szímbólumok jelentése:", "<opcionális> | [kötelező]")
        .setDescription(pageSystem.pages[pageSystem.currentPage - 1])
        .setFooter(`${pageSystem.currentPage}. oldal a ${pageSystem.pages.length} oldalból.`);

    message.channel.send({embed: embed}).then(msg => {
        msg.react('⏪').then(r => {
            msg.react('⏩').catch(console.error);

            const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id;
            const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id;

            const backwards = msg.createReactionCollector(backwardsFilter, { time: 120000});
            const forwards = msg.createReactionCollector(forwardsFilter, { time: 120000});

            backwards.on('collect', r => {
                if(pageSystem.currentPage === 1) return;
                pageSystem.currentPage--;
                embed.setDescription(pageSystem.pages[pageSystem.currentPage - 1]);
                embed.setFooter(`${pageSystem.currentPage}. oldal a ${pageSystem.pages.length} oldalból.`); 
                msg.edit({embed: embed}).catch(console.error);
            });

            forwards.on('collect', r => {
                if(pageSystem.currentPage === pageSystem.pages.length) return;
                pageSystem.currentPage++;
                embed.setDescription(pageSystem.pages[pageSystem.currentPage - 1]);
                embed.setFooter(`${pageSystem.currentPage}. oldal a ${pageSystem.pages.length} oldalból.`); 
                msg.edit({embed: embed}).catch(console.error);
            });
        }).catch(console.error);
    }).catch(console.error);
}

module.exports.help = {
    cmd: "help",
    alias: ["segitseg", "segítség"],
    name: "Segítség",
    desc: "Leírások a parancsokról",
    usage: ">help <oldal / parancs>",
    category: "felhasználói"

}