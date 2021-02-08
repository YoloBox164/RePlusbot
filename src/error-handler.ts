import { Client } from "discord.js";
import Database from "./systems/database";
import AnalyticSys from "./systems/analytic";
import EmbedTemplates from "./utils/embed-templates";
import { Clean } from "./utils/tools";

class ErrorHandler {
    private static client: Client;

    public static Init(client: Client) {
        this.client = client;
    }

    public static Log(error: Error|any, ...optionalParams: any[]) {
        console.error(error, ...optionalParams);
        const embed = EmbedTemplates.Error(`\`\`\`xl\n${Clean(error)}\n\`\`\``);
        if(this.client.logChannel) this.client.logChannel.send({ embed: embed }).catch(console.error);
    }

    public static async Handle(error: Error | any, msg: string, toShutdown = false) {
        try {
            console.error(error);
            let logMsg = `\`${msg}\`\n\`\`\`xl\n${Clean(error)}\n\`\`\``;
            if(toShutdown) logMsg += `\n\`SHUTTING DOWN\` | \`${this.client.logDate()}\``;
            const embed = EmbedTemplates.Error(logMsg);
            if(this.client.logChannel) await this.client.logChannel.send({ embed: embed }).catch(console.error);
            if(toShutdown) {
                await Database.Connection.end().then(() => console.log("Database shutdown"));
                await AnalyticSys.Shut().then(() => console.log("Analytic Sys Shut"));
                this.client.setTimeout(() => { this.client.destroy(); process.exit(1); }, 2000);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

export default ErrorHandler;

process.on("uncaughtException", err => { ErrorHandler.Handle(err, "Uncaught Exception", true); });

process.on("unhandledRejection", err => { ErrorHandler.Handle(err, "Unhandled Rejection", false); });