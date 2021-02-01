import { Client, Message } from "discord.js";
import QuickChart from "quickchart-js";
import { Top10ChartOptions } from "..";
import Database, { Users } from "../../../../systems/database";
import GetSuggestedMax from "../GetSuggestedMax";
import Tools from "../../../../utils/tools";

export default async function(bot: Client, message: Message, options: Top10ChartOptions): Promise<QuickChart> {
    try {
        const { BarBgColor, BarBorderColor, ChartFontColor, ChartBgColor, ChartWidth, ChartHeight } = options;
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