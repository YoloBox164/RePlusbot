const Discord = require("discord.js");

const QuickChart = require("quickchart-js");

const AnalyticSys = require('../../analytic-sys');
const Tools = require('../../utils/tools');

const ChartBgColor = '#2C2F33';
const ChartFontColor = '#99AAB5';
const BarBgColor = 'rgba(114, 137, 218, 0.5)';
const BarBorderColor = 'rgb(114, 137, 218)';
const ChartWidth = 800;
const ChartHeight = 400;

/**
 * @param {Discord.Client} bot The bot itself.
 * @param {Discord.Message} message Discord message.
 * @param {Array<string>} args The message.content in an array without the command.
 */
module.exports.run = async (bot, message, args) => {
    AnalyticSys.GetAllUserData().then(allUserData => {
        const Msg_sortedCollection = allUserData.sort((a, b) => b.stats.messages - a.stats.messages);
        /** @type {Discord.Collection<string, import("../../analytic-sys").userData} */
        const Msg_top10UserData = new Discord.Collection();
        let counter = 0;
        Msg_sortedCollection.forEach((userData, userId) => {
            if (counter < 10) {
                counter++;
                Msg_top10UserData.set(userId, userData);
            }
        });

        const Msg_top10UserNames = [];
        const Msg_top10UserMsgCounts = [];

        Msg_top10UserData.forEach((userData, userId) => {
            let gm = message.guild.member(userId);
            if (gm) Msg_top10UserNames.push(gm.displayName);
            else Msg_top10UserNames.push(gm.user.tag);
            Msg_top10UserMsgCounts.push(userData.stats.messages);
        });

        const Voice_sortedCollection = allUserData.sort((a, b) => b.stats.allTime - a.stats.allTime);
        /** @type {Discord.Collection<string, import("../../analytic-sys").userData} */
        const Voice_top10UserData = new Discord.Collection();
        counter = 0;
        Voice_sortedCollection.forEach((userData, userId) => {
            if (counter < 10) {
                counter++;
                Voice_top10UserData.set(userId, userData);
            }
        });

        const Voice_top10UserNames = [];
        const Voice_top10UserTimes = [];

        Voice_top10UserData.forEach((userData, userId) => {
            let gm = message.guild.member(userId);
            if (gm) Voice_top10UserNames.push(gm.displayName);
            else Voice_top10UserNames.push(gm.user.tag);
            Voice_top10UserTimes.push(userData.stats.allTime);
        });

        const Msg_Top10Chart = new QuickChart();
        Msg_Top10Chart.setConfig({
            type: 'horizontalBar',
            data: {
                labels: Msg_top10UserNames,
                datasets: [{
                    label: 'Küldött üzenetek száma',
                    backgroundColor: BarBgColor,
                    borderColor: BarBorderColor,
                    borderWidth: 1,
                    data: Msg_top10UserMsgCounts
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                    labels: {
                        fontColor: ChartFontColor
                    }
                },
                title: {
                    display: true,
                    text: 'Top 10 legtöbb üzenetet elküldött emberek a szerveren',
                    fontColor: ChartFontColor
                },
                plugins: {
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        color: ChartFontColor,
                        font: {
                            weight: 'bold'
                        },
                        clamp: true,
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            fontColor: ChartFontColor
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: ChartFontColor,
                            fontStyle: "bold"
                        }
                    }]
                }
            },
        }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight);

        const Voice_Top10Chart = new QuickChart();
        Voice_Top10Chart.setConfig({
            type: 'horizontalBar',
            data: {
                labels: Voice_top10UserNames,
                datasets: [{
                    label: 'Eltöltött idő a hangszobákban',
                    backgroundColor: BarBgColor,
                    borderColor: BarBorderColor,
                    borderWidth: 1,
                    data: Voice_top10UserTimes
                }]
            },
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                    labels: {
                        fontColor: ChartFontColor
                    }
                },
                title: {
                    display: true,
                    text: 'Top 10 legtöbb időt volt a hangszobákban',
                    fontColor: ChartFontColor
                },
                plugins: {
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'right',
                        color: ChartFontColor,
                        font: {
                            weight: 'bold'
                        },
                        clamp: true,
                        formatter: Tools.ParseMillisecondsIntoReadableTime
                    }
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Óra",
                            fontFamily: "Mono",
                            fontSize: 14,
                            fontColor: ChartFontColor,
                            fontStyle: "bold"
                        },
                        ticks: {
                            fontColor: ChartBgColor,
                        },
                        gridLines: {
                            display: false
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: ChartFontColor,
                            fontStyle: "bold"
                        }
                    }]
                }
            }
        }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight);

        message.channel.send({
            files: [{
                    attachment: Msg_Top10Chart.getUrl(),
                    name: "msg-top10-chart.png"
                },
                {
                    attachment: Voice_Top10Chart.getUrl(),
                    name: "voice-top10-chart.png"
                },
            ]
        });
    });
}

module.exports.help = {
    cmd: "top",
    alias: [],
    name: "Top 10",
    desc: "A top 10 legaktívabb felhasználók",
    usage: ">top"
}

/**
 * #>eval let ids = bot.mainGuild.members.cache;
    let analytic = require("../../analytic-sys");
    analytic.GetAllUserData().then(userDatas => {
        userDatas.forEach((userData, userId) => ids.delete(userId));
        let names = [];
        ids.forEach(gm => {
            let str = gm.displayName + " " + "(" + gm.user.tag + ")";
            names.push(str)
        });
        message.channel.send(names.join(" | "), {split: {char: " | "}});
    });
 */