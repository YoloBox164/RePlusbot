import { Client, Message } from "discord.js";
import QuickChart from "quickchart-js";
import { Top10ChartOptions } from "..";
import Database, { Users } from "../../../../systems/database";
import GetSuggestedMax from "../GetSuggestedMax";

export default async function(bot: Client, message: Message, options: Top10ChartOptions): Promise<QuickChart> {
    try {
        const { BarBgColor, BarBorderColor, ChartFontColor, ChartBgColor, ChartWidth, ChartHeight } = options;
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