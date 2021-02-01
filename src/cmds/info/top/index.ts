import Discord, { Message } from "discord.js";
import BaseCommand from "../../../structures/base-command";
import BitsChart from "./Charts/Bits";
import MessageChart from "./Charts/Message";
import VoiceChart from "./Charts/Voice";
import XpLevelChart from "./Charts/XpLevel";

const options: Top10ChartOptions = {
    BarBgColor: "rgba(114, 137, 218, 0.5)",
    BarBorderColor: "rgb(114, 137, 218)",
    ChartBgColor: "#2C2F33",
    ChartFontColor:  "#99AAB5",
    ChartHeight: 400,
    ChartWidth: 800
}

class Top implements BaseCommand {
    pathToCmd = module.path;

    mustHaveArgs = false;
    isDev = false;

    name = "top10";
    aliases = [];
    desc = "A top 10 legaktívabb felhasználók";
    usage = "top10";

    public async execute(message: Message) {
        try {
            const msg = await message.channel.send("Adatok gyüjtése, rendezése..");
            await VoiceChart(message.client, message, options).then(async chart => {
                const VoiceEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb időt volt a hangszobákban")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(VoiceEmbed);
            });

            await MessageChart(message.client, message, options).then(async chart => {
                const MsgEmbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb üzenetet elküldött emberek a szerveren")
                    .setColor(Discord.Constants.Colors.BLURPLE)
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(MsgEmbed);
            });

            await BitsChart(message.client, message, options).then(async chart => {
                const BitsEmbbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legtöbb bit birtokában lévő felhasználó")
                    .setColor("#78b159")
                    .attachFiles([{attachment: await chart.toBinary(), name: "chart.png"}])
                    .setImage("attachment://chart.png");
                message.channel.send(BitsEmbbed);
            });

            await XpLevelChart(message.client, message, options).then(async chart => {
                const BitsEmbbed = new Discord.MessageEmbed()
                    .setTitle("Top 10 legmagasabb szintű felhasználó")
                    .setColor(Discord.Constants.Colors.BLURPLE)
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

export interface Top10ChartOptions {
    /** Default: `rgba(114, 137, 218, 0.5)` */
    BarBgColor: string,
    /** Default: `rgb(114, 137, 218)` */
    BarBorderColor : string,
    /** Default: `#2C2F33` */
    ChartBgColor: string,
    /** Default: `#99AAB5` */
    ChartFontColor: string,
    /** Default: `400` */
    ChartHeight: number,
    /** Default: `800` */
    ChartWidth: number
}