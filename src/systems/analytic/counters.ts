import fs from "fs";

const SaveJSONPath = `${module.path}/save.json`;

class CounterHandler {
    public readonly counters: CountersData;

    constructor() { this.counters = this.GetSaveJSON(); }

    public Has(userId: string) {
        return this.counters[userId] ? true : false;
    }

    public Start(userId: string, timestampt: number) {
        if(!this.counters[userId]) {
            this.counters[userId] = {
                start: timestampt,
                end: -1
            };
        }
    }

    public Stop(userId: string, timestampt: number) {
        if(this.counters[userId]) {
            this.counters[userId].end = timestampt;
        }
    }

    public Remove(userId: string) {
        delete this.counters[userId];
    }

    public GetSaveJSON(): CountersData {
        if(!fs.existsSync(SaveJSONPath)) {
            console.error("Save json is not exists! Creating new file!");
            fs.writeFileSync(SaveJSONPath, "{}");
            return {};
        }
    
        try {
            return JSON.parse(fs.readFileSync(SaveJSONPath, "utf-8"));
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    public async ResetSaveJSON() {
        try {
            fs.writeFileSync(SaveJSONPath, "{}");
        } catch (error) {
            throw error;
        }
    }
    
    public async SaveToJSON() {
        const JSON_Data = JSON.stringify(this.counters, null, 4);
        try {
            if(JSON_Data.length !== 0) {
                fs.writeFileSync(SaveJSONPath, JSON.stringify(this.counters, null, 4));
            } else {
                fs.writeFileSync(SaveJSONPath, "{}");
            }
        } catch (error) {
            throw error;
        }
    }
}

export default CounterHandler;

interface CountersData {
    [id: string]: { 
        /** Start of the offtime in milliseconds */
        start: number,
        /** End of the offtime in milliseconds */
        end: number
    } 
}