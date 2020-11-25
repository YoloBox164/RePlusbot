import Discord, { Client, Message } from "discord.js";
import Tools from "../../utils/tools";
import Database, { Users } from "../../systems/database";
import QuickChart from "quickchart-js";
import BaseCommand from "../../structures/base-command";

const ChartBgColor = "#2C2F33";
const ChartFontColor = "#99AAB5";
const BarBgColor = "rgba(114, 137, 218, 0.5)";
const BarBorderColor = "rgb(114, 137, 218)";
const ChartWidth = 800;
const ChartHeight = 400;

class Top implements BaseCommand {
    pathToCmd: string;

    mustHaveArgs = false;
    isDev = false;

    name = "top10";
    aliases = [];
    desc = "A top 10 legaktívabb felhasználók";
    usage = "top10";

    public async execute(message: Message) {
        try {
            const msg = await message.channel.send("Adatok gyüjtése, rendezése..");

            await GetVoiceTop10Chart(message.client, message).then(async chart => {
                const VoiceEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb időt volt a hangszobákban")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(VoiceEmbed);
            });

            await GetMsgTop10Chart(message.client, message).then(async chart => {
                const MsgEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb üzenetet elküldött emberek a szerveren")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(MsgEmbed);
            });

            await GetBitsTop10Chart(message.client, message).then(async chart => {
                const BitsEmbbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb bit birtokában lévő felhasználó")
                    .setColor("#78b159")
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(BitsEmbbed);
            });

            if(msg.deletable) msg.delete({ reason: "Finished waiting." });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

export default new Top();

async function GetVoiceTop10Chart(bot: Client, message: Message): Promise<QuickChart> {
    try {
        const userDatas: Users[] = await Database.Connection.query("SELECT * FROM Users ORDER BY allTime DESC LIMIT 10;");
        const UserNames: string[] = [];
        const UserTimes: number[] = [];

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
        Chart.setConfig({
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
        }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight);

        return Promise.resolve(Chart);
        
    } catch (error) {
        return Promise.reject(error);
    }
}

async function GetMsgTop10Chart(bot: Client, message: Message): Promise<QuickChart> {
    try {
        const userDatas: Users[] = await Database.Connection.query("SELECT * FROM Users ORDER BY messages DESC LIMIT 10;");
        const UserNames: string[] = [];
        const UserMsgCounts: number[] = [];

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
        Chart.setConfig({
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
        }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight);
        return Promise.resolve(Chart);
    } catch (error) {
        return Promise.reject(error);
    }
    
}

async function GetBitsTop10Chart(bot: Client, message: Message): Promise<QuickChart> {
    try {
        const userDatas: {
            id: string,
            tag: string,
            bits: number
        }[] = await Database.Connection.query(
            `SELECT Users.id, tag, bits
            FROM Currency, Users
            WHERE Currency.id = Users.id
            ORDER BY bits DESC LIMIT 10;`
        );

        const UserNames: string[] = [];
        const UserBits: number[] = [];
        
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
        Chart.setConfig({
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
        }).setBackgroundColor(ChartBgColor).setWidth(ChartWidth).setHeight(ChartHeight);
        return Promise.resolve(Chart);
    } catch (error) {
        return Promise.reject(error);
    }
}

function GetSuggestedMax(number: number): number {
    return number + parseInt("1" + "0".repeat((number.toString().length - 2)));
}