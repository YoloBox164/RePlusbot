const Discord = require("discord.js");

const QuickChart = require("quickchart-js");

const AnalyticSys = require('../../analytic-sys');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
*/
module.exports.run = async (bot, message, args) => {
    AnalyticSys.GetAllUserData().then(allUserData => {
        const sortedCollection = allUserData.sort((a, b) => b.stats.messages - a.stats.messages);
        /** @type {Discord.Collection<string, import("../../analytic-sys").userData} */
        const top10UserData = new Discord.Collection();
        let counter = 0;
        sortedCollection.forEach((userData, userId) => {
            if(counter < 10) {
                counter++;
                top10UserData.set(userId, userData);
            }
        });

        const top10UserNames = [];
        const top10UserMsgCounts = [];
        top10UserData.forEach((userData, userId) => {
            top10UserNames.push(message.guild.member(userId).displayName);
            top10UserMsgCounts.push(userData.stats.messages);
        });

        const myChart = new QuickChart();
        myChart.setConfig({
            type: 'horizontalBar',
            data: {
                labels: top10UserNames,
                datasets: [{
                        label: 'Küldött üzenetek száma',
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1,
                        data: top10UserMsgCounts
                    }
                ]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Legtöbb üzenetet elküldött emberek a szerveren',
                },
                plugins: {
                    datalabels: {
                        display: true,
                        align: 'right',
                        backgroundColor: '#ccc',
                        borderRadius: 3
                    },
                }
            },
        }).setBackgroundColor('white').setWidth(800).setHeight(400);

        const embed = new Discord.MessageEmbed()
            .attachFiles([{attachment: myChart.getUrl(), name: "chart.png"}]);

        message.channel.send({ embed: embed });
    });
}

module.exports.help = {
    cmd: "users",
    alias: [],
    name: "",
    desc: "",
    usage: ""
}