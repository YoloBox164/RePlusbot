const Discord = require('discord.js');

module.exports.run = (bot, message, args) => {
    var pageSystem = {
        currentPage: 1,
        pages: [],
        indexHelp: []
    }

    bot.commands.forEach(prop => {
        pageSystem.pages.push(
            `**Name:** *${prop.help.name}*
            ${prop.help.alias !== [] ? "**Aliases:** *" + prop.help.alias.join(", ") + "*\n" : ""}
            **Description:** *${prop.help.desc}*
            **Usage:** \`${prop.help.usage}\`
            **Category:** ${prop.help.category}*`
        );
        pageSystem.indexHelp.push(prop.help.cmd);
    });

    if(args[0] && isNaN(args[0])) {
        var command = bot.commands.get(args[0].toLowerCase()) || bot.commands.get(bot.aliasCmds.get(args[0].toLowerCase()));
        pageSystem.currentPage = pageSystem.indexHelp.indexOf(command.help.cmd) + 1;
        if(pageSystem.currentPage < 1 || pageSystem.currentPage > pageSystem.pages.length) {
            pageSystem.currentPage = 1;
        }
    } else if(!isNaN(args[0])) {
        pageSystem.currentPage = parseInt(args[0]);
        if(pageSystem.currentPage > pageSystem.pages.length) {
            pageSystem.currentPage = pageSystem.pages.length;
        }
    }

    const embed = new Discord.RichEmbed()
        .setTitle("Command List")
        .setColor(message.guild.member(bot.user).displayHexColor)
        .addField("Symbol meanings:", "<optional> | [must provide]")
        .setDescription(pageSystem.pages[pageSystem.currentPage - 1])
        .setFooter(`Page ${pageSystem.currentPage} of ${pageSystem.pages.length}`);

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
                embed.setFooter(`Page ${pageSystem.currentPage} of ${pageSystem.pages.length}`); 
                msg.edit({embed: embed}).catch(console.error);
            });

            forwards.on('collect', r => {
                if(pageSystem.currentPage === pageSystem.pages.length) return;
                pageSystem.currentPage++;
                embed.setDescription(pageSystem.pages[pageSystem.currentPage - 1]);
                embed.setFooter(`Page ${pageSystem.currentPage} of ${pageSystem.pages.length}`); 
                msg.edit({embed: embed}).catch(console.error);
            });
        }).catch(console.error);
    }).catch(console.error);
}

module.exports.help = {
    cmd: "help",
    alias: [],
    name: "Help",
    desc: "Some help amout the commands.",
    usage: ">help <page / command>",
    category: "user"

}