const Discord = require("discord.js");

const QuickChart = require('quickchart-js');

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */

module.exports.run = async (bot, message, args) => {
    const myChart = new QuickChart();
    myChart.setConfig({
        type: 'bar',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                    label: 'Dataset 1',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1,
                    data: [
                        [-66, -49],
                        [55, 12],
                        [47, -44],
                        [-50, 31],
                        [-93, 33],
                        [-12, -9],
                        [-58, -1],
                    ],
                },
                {
                    label: 'Dataset 2',
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    data: [
                        [92, -37],
                        [-51, 91],
                        [-23, -79],
                        [74, 69],
                        [-2, -77],
                        [-79, 63],
                        [-79, 18],
                    ],
                },
            ],
        },
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    }).setBackgroundColor('white').setWidth(800).setHeight(400);

    const embed = new Discord.MessageEmbed()
        .attachFiles([{attachment: myChart.getUrl(), name: "chart.png"}]);

    message.channel.send({ embed: embed });
}

module.exports.help = {
    cmd: "chart",
    alias: [],
    name: "",
    desc: "",
    usage: "",
    category: ""
}