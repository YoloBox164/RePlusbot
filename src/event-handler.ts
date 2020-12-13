import { Client, Collection } from "discord.js";

import fs from "fs";
import colors from "colors";

const pathToHandlers = `${module.path}/event-handlers`; // Relative to client.ts

const handlers = new Collection<string, (...args: any[]) => any>();

class EventHandler {
    public isEventsLoaded: boolean;

    private client: Client;

    constructor(client: Client) {
        this.isEventsLoaded = false;
        this.client = client;
        this.loadHandlers();
    }

    public loadHandlers() {
        console.log(colors.cyan("Loading event handlers!"));
        const files = fs.readdirSync(pathToHandlers).filter(f => f.split(".").pop() == "js" && !f.startsWith("_"));
        for(const file of files) {
            const handlerName = file.split(".").shift();
            if(this.isEventsLoaded) this.client.removeListener(handlerName, handlers.get(handlerName));

            const handler = loadHandler(`${pathToHandlers}/${file}`);

            this.client.on(handlerName, handler);
        }
        console.log(colors.green.bold(`Successfully loaded all event handlers!\n`));
        this.isEventsLoaded = true;
    }

    public get handlers(): Promise<typeof handlers> {
        if(!this.isEventsLoaded) return Promise.reject(new Error("Event handlers must be loaded at least once!"));
        return Promise.resolve(handlers);
    }
}

export default EventHandler;

function loadHandler(path: string): (...args: any[]) => any {
    delete require.cache[require.resolve(path)];

    // example 
    // [0]/     [1]      /  [2]
    //   ./event-handlers/message.ts
    const file = path.split("/").pop();

    const handlerName = file.split(".").shift();
    const handler = require(path).default;

    console.log(colors.white(`${handlerName} handler loaded!`));

    handlers.set(handlerName, handler);
    return handler;
}