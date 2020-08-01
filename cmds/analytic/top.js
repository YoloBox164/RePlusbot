const Discord = require("discord.js");

const QuickChart = require("quickchart-js");

const AnalyticSys = require('../../analytic-sys');

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
            let user = bot.users.resolve(userId);
            if(gm) Msg_top10UserNames.push(gm.displayName);
            else if(user) Msg_top10UserNames.push(user.tag);
            else if(userData.tag) Msg_top10UserNames.push(userData.tag);
            else Msg_top10UserNames.push(userId);
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
            let user = bot.users.resolve(userId);
            if(gm) Voice_top10UserNames.push(gm.displayName);
            else if(user) Voice_top10UserNames.push(user.tag);
            else if(userData.tag) Voice_top10UserNames.push(userData.tag);
            else Voice_top10UserNames.push(userId);
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
                        formatter: RedableTime
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
 * @param {number} milliseconds
 * @returns {string} Readable time like: 01:34:11 or 12 nap | 01:34:11
*/
function RedableTime(milliseconds) {

    //Get hours from milliseconds
    let hours = milliseconds / (1000*60*60);

    let days = 0;
    let absoluteDays = 0;
    let d = null;

    if(hours >= 24) {
        days = hours / 24;
        absoluteDays = Math.floor(days);
        d = absoluteDays;

        hours = (days - absoluteDays) * 24;
    }

    let absoluteHours = Math.floor(hours);
    let h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

    //Get remainder from hours and convert to minutes
    let minutes = (hours - absoluteHours) * 60;
    let absoluteMinutes = Math.floor(minutes);
    let m = absoluteMinutes > 9 ? absoluteMinutes : '0' +  absoluteMinutes;

    //Get remainder from minutes and convert to seconds
    let seconds = (minutes - absoluteMinutes) * 60;
    let absoluteSeconds = Math.floor(seconds);
    let s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

    if(d !== null) return `${d} nap | ${h}:${m}:${s}`;
    else return `${h}:${m}:${s}`;

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