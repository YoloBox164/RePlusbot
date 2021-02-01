import { Client, Message } from "discord.js";
import QuickChart from "quickchart-js";
import { Top10ChartOptions } from "..";
import Database from "../../../../systems/database";
import GetSuggestedMax from "../GetSuggestedMax";

export default async function(bot: Client, message: Message, options: Top10ChartOptions): Promise<QuickChart> {
    try {
        const { BarBgColor, BarBorderColor, ChartFontColor, ChartBgColor, ChartWidth, ChartHeight } = options;
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
