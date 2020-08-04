const Discord = require("discord.js");

const AnalyticSys = require('../../analytic-sys');
const Tools = require('../../utils/tools');
const Database = require('../../database');
const QuickChart = require("quickchart-js");

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
    message.channel.send("Készülödik...").then(async msg => {
        const allUserData = await AnalyticSys.GetAllUserData();
        const VoiceEmbed = new Discord.MessageEmbed()
            .setTitle("Top 10 legtöbb időt volt a hangszobákban")
            .setColor(Discord.Constants.Colors.BLURPLE)
            .setImage(await (GetVoiceTop10Chart(allUserData, bot, message).getShortUrl()));

        const MsgEmbed = new Discord.MessageEmbed()
            .setTitle("Top 10 legtöbb üzenetet elküldött emberek a szerveren")
            .setColor(Discord.Constants.Colors.BLURPLE)
            .setImage(await (GetMsgTop10Chart(allUserData, bot, message).getShortUrl()));

        const BitsEmbbed = new Discord.MessageEmbed()
            .setTitle("Top 10 legtöbb bit birtokában lévő felhasználó")
            .setColor(message.guild.member(bot.user).displayHexColor)
            .setImage(await (GetBitsTop10Chart(bot, message).getShortUrl()));

        message.channel.send(VoiceEmbed);
        message.channel.send(MsgEmbed);
        message.channel.send(BitsEmbbed);

        if(msg.deletable) msg.delete({reason: "Finished waiting."});
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
 * 
 * @param {Discord.Collection<string, import("../../analytic-sys").userData>} allUserData
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @returns {QuickChart}
 */
function GetVoiceTop10Chart(allUserData, bot, message) {
    const sortedCollection = allUserData.sort((a, b) => b.stats.allTime - a.stats.allTime);
    /** @type {Discord.Collection<string, import("../../analytic-sys").userData} */
    const UserData = new Discord.Collection();
    counter = 0;
    sortedCollection.forEach((userData, userId) => {
        if (counter < 10) {
            counter++;
            UserData.set(userId, userData);
        }
    });

    const UserNames = [];
    const UserTimes = [];

    UserData.forEach((userData, userId) => {
        let gm = message.guild.member(userId);
        let user = bot.users.resolve(userId);
        if(gm) UserNames.push(gm.displayName);
        else if(user) UserNames.push(user.tag);
        else if(userData.tag) UserNames.push(userData.tag);
        else UserNames.push(userId);
        UserTimes.push(userData.stats.allTime);
    });

    const Chart = new QuickChart();
    Chart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: UserNames,
            datasets: [{
                label: 'Eltöltött idő a hangszobákban',
                backgroundColor: BarBgColor,
                borderColor: BarBorderColor,
                borderWidth: 1,
                data: UserTimes
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
                    formatter: Tools.RedableTime
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
                        suggestedMax: GetSuggestedMax(Math.max(...UserTimes))
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

    return Chart;
}

/**
 * 
 * @param {Discord.Collection<string, import("../../analytic-sys").userData>} allUserData
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @returns {QuickChart}
 */
function GetMsgTop10Chart(allUserData, bot, message) {
    const sortedCollection = allUserData.sort((a, b) => b.stats.messages - a.stats.messages);
    /** @type {Discord.Collection<string, import("../../analytic-sys").userData} */
    const UserData = new Discord.Collection();
    let counter = 0;
    sortedCollection.forEach((userData, userId) => {
        if (counter < 10) {
            counter++;
            UserData.set(userId, userData);
        }
    });

    const UserNames = [];
    const UserMsgCounts = [];

    UserData.forEach((userData, userId) => {
        let gm = message.guild.member(userId);
        let user = bot.users.resolve(userId);
        if(gm) UserNames.push(gm.displayName);
        else if(user) UserNames.push(user.tag);
        else if(userData.tag) UserNames.push(userData.tag);
        else UserNames.push(userId);
        UserMsgCounts.push(userData.stats.messages);
    });

    const Chart = new QuickChart();
    Chart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: UserNames,
            datasets: [{
                label: 'Küldött üzenetek száma',
                backgroundColor: BarBgColor,
                borderColor: BarBorderColor,
                borderWidth: 1,
                data: UserMsgCounts
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
                        fontColor: ChartFontColor,
                        suggestedMax: GetSuggestedMax(Math.max(...UserMsgCounts))
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

    return Chart;
}

/**
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @returns {QuickChart}
 */
function GetBitsTop10Chart(bot, message) {
    /** @type {string[]} */
    const UserNames = [];
    /** @type {number[]} */
    const UserBits = [];

    /** @type {import("../../database").currency[]} */
    const UserDatas = Database.SQLiteDB.prepare("SELECT * FROM currency ORDER BY bits DESC LIMIT 10").all();

    UserDatas.forEach(userData => {
        let gm = message.guild.member(userData.id);
        let user = bot.users.resolve(userData.id);
        if(gm) UserNames.push(gm.displayName);
        else if(user) UserNames.push(user.tag);
        else if(userData.tag) UserNames.push(userData.tag);
        else UserNames.push(userData.id);
        UserBits.push(userData.bits);
    });

    const Chart = new QuickChart();
    Chart.setConfig({
        type: 'horizontalBar',
        data: {
            labels: UserNames,
            datasets: [{
                label: 'Bitek',
                backgroundColor: BarBgColor,
                borderColor: BarBorderColor,
                borderWidth: 1,
                data: UserBits
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
                text: 'Top 10 legtöbb bit birtokában lévő felhasználó',
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
                    clamp: true
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: ChartFontColor,
                        suggestedMax: GetSuggestedMax(Math.max(...UserBits))
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

    return Chart;
}

/**
 * @param {number} number 
 * @returns {number}
 */
function GetSuggestedMax(number) {
    return number + parseInt("1" + "0".repeat((number.toString().length - 2)));
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