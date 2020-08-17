const Discord = require("discord.js");

const Tools = require("../../utils/tools");
const Database = require("../../database");
const QuickChart = require("quickchart-js");

const ChartBgColor = "#2C2F33";
const ChartFontColor = "#99AAB5";
const BarBgColor = "rgba(114, 137, 218, 0.5)";
const BarBorderColor = "rgb(114, 137, 218)";
const ChartWidth = 800;
const ChartHeight = 400;


module.exports = {
    /**
     * @param {import("discord.js").Message} message Discord message.
     */
    execute: (message) => {
        message.channel.send("Készülödik...").then(async msg => {
            await GetVoiceTop10Chart(message.client, message).then(async chart => {
                const VoiceEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb időt volt a hangszobákban")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .setImage(await chart.getShortUrl());
                message.channel.send(VoiceEmbed);
            });

            await GetMsgTop10Chart(message.client, message).then(async chart => {
                const MsgEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb üzenetet elküldött emberek a szerveren")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .setImage(await chart.getShortUrl());
                message.channel.send(MsgEmbed);
            });

            await GetBitsTop10Chart(message.client, message).then(async chart => {
                const BitsEmbbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb bit birtokában lévő felhasználó")
                    .setColor(message.guild.member(message.client.user).displayHexColor)
                    .setImage(await chart.getShortUrl());
                message.channel.send(BitsEmbbed);

            });

            if(msg.deletable) msg.delete({ reason: "Finished waiting." });
        });
    },

    args: false,
    name: "top10",
    aliases: [],
    desc: "A top 10 legaktívabb felhasználók",
    usage: ">top"
};

/**
 * @async
 * @param {import("discord.js").Client} bot
 * @param {import("discord.js").Message} message
 * @returns {Promise<QuickChart>}
 */
async function GetVoiceTop10Chart(bot, message) {
    /** @type {Promise<QuickChart>}*/
    const promise = new Promise((resolve, reject) => {
        Database.Connection.query("SELECT * FROM Users ORDER BY allTime DESC LIMIT 10").then(function(/** @type {import("../../database").Users[]} */ userDatas) {
            /** @type {string[]} */
            const UserNames = [];
            /** @type {number[]} */
            const UserTimes = [];

            userDatas.forEach((userData) => {
                const gm = message.guild.member(userData.id);
                const user = bot.users.resolve(userData.id);
                if(gm) UserNames.push(gm.displayName);
                else if(user) UserNames.push(user.tag);
                else if(userData.tag) UserNames.push(userData.tag);
                else UserNames.push(userData.id);
                UserTimes.push(userData.allTime);
            });

            const Chart = new QuickChart();
            resolve(Chart.setConfig({
                type: "horizontalBar",
                data: {
                    labels: UserNames,
                    datasets: [{
                        label: "Eltöltött idő a hangszobákban",
                        backgroundColor: BarBgColor,
                        borderColor: BarBorderColor,
                        borderWidth: 1,
                        data: UserTimes
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: "top",
                        labels: {
                            fontColor: ChartFontColor
                        }
                    },
                    title: {
                        display: true,
                        text: "Top 10 legtöbb időt volt a hangszobákban",
                        fontColor: ChartFontColor
                    },
                    plugins: {
                        datalabels: {
                            display: true,
                            anchor: "end",
                            align: "right",
                            color: ChartFontColor,
                            font: {
                                weight: "bold"
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
            }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight));
        }).catch(err => reject(err));
    });
    return promise;
}

/**
 * @async
 * @param {import("discord.js").Client} bot
 * @param {import("discord.js").Message} message
 * @returns {Promise<QuickChart>}
 */
async function GetMsgTop10Chart(bot, message) {
    /** @type {Promise<QuickChart>}*/
    const promise = new Promise((resolve, reject) => {
        Database.Connection.query("SELECT * FROM Users ORDER BY messages DESC LIMIT 10").then(function(/** @type {import("../../database").Users[]} */ userDatas) {
            /** @type {string[]} */
            const UserNames = [];
            /** @type {number[]} */
            const UserMsgCounts = [];

            userDatas.forEach((userData) => {
                const gm = message.guild.member(userData.id);
                const user = bot.users.resolve(userData.id);
                if(gm) UserNames.push(gm.displayName);
                else if(user) UserNames.push(user.tag);
                else if(userData.tag) UserNames.push(userData.tag);
                else UserNames.push(userData.id);
                UserMsgCounts.push(userData.messages);
            });

            const Chart = new QuickChart();
            resolve(Chart.setConfig({
                type: "horizontalBar",
                data: {
                    labels: UserNames,
                    datasets: [{
                        label: "Küldött üzenetek száma",
                        backgroundColor: BarBgColor,
                        borderColor: BarBorderColor,
                        borderWidth: 1,
                        data: UserMsgCounts
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: "top",
                        labels: {
                            fontColor: ChartFontColor
                        }
                    },
                    title: {
                        display: true,
                        text: "Top 10 legtöbb üzenetet elküldött emberek a szerveren",
                        fontColor: ChartFontColor
                    },
                    plugins: {
                        datalabels: {
                            display: true,
                            anchor: "end",
                            align: "right",
                            color: ChartFontColor,
                            font: {
                                weight: "bold"
                            },
                            clamp: true
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
                }
            }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight));
        }).catch(err => reject(err));
    });
    return promise;
}

/**
 * @async
 * @param {import("discord.js").Client} bot
 * @param {import("discord.js").Message} message
 * @returns {Promise<QuickChart>}
 */
async function GetBitsTop10Chart(bot, message) {
    /** @type {Promise<QuickChart>}*/
    const promise = new Promise((resolve, reject) => {
        Database.Connection.query("SELECT * FROM Currency ORDER BY bits DESC LIMIT 10").then(function(/** @type {import("../../database").Currency[]} */ userDatas) {
            /** @type {string[]} */
            const UserNames = [];
            /** @type {number[]} */
            const UserBits = [];
            userDatas.forEach(userData => {
                const gm = message.guild.member(userData.id);
                const user = bot.users.resolve(userData.id);
                if(gm) UserNames.push(gm.displayName);
                else if(user) UserNames.push(user.tag);
                else if(userData.tag) UserNames.push(userData.tag);
                else UserNames.push(userData.id);
                UserBits.push(userData.bits);
            });

            const Chart = new QuickChart();
            resolve(Chart.setConfig({
                type: "horizontalBar",
                data: {
                    labels: UserNames,
                    datasets: [{
                        label: "Bitek",
                        backgroundColor: BarBgColor,
                        borderColor: BarBorderColor,
                        borderWidth: 1,
                        data: UserBits
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: "top",
                        labels: {
                            fontColor: ChartFontColor
                        }
                    },
                    title: {
                        display: true,
                        text: "Top 10 legtöbb bit birtokában lévő felhasználó",
                        fontColor: ChartFontColor
                    },
                    plugins: {
                        datalabels: {
                            display: true,
                            anchor: "end",
                            align: "right",
                            color: ChartFontColor,
                            font: {
                                weight: "bold"
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
            }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight));
        }).catch(err => reject(err));
    });
    return promise;
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