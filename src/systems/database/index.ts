import Config from "../../config.json";
import mariadb from "mariadb";
import { FirstCharUpperCase } from "../../utils/tools";
import colors from "colors/safe";

class Database {

    public static Connection: mariadb.Connection;

    public static async Connect() {
        try {
            if(this.Connection?.isValid()) this.Connection.end();
            this.Connection = await mariadb.createConnection(Config.mariaDb);
            console.log(colors.green(`Connected to database! (id: ${this.Connection.threadId})`));
            this.Connection.on("error", (err) => {
                if(err.code === "ER_SOCKET_UNEXPECTED_CLOSE") {
                    console.log(`Caught ER_SOCKET_UNEXPECTED_CLOSE! (id: ${this.Connection.threadId})`);
                    this.Connect().catch(console.error);
                } 
                else if(err.fatal) throw err;
                else console.error(err);
            });

            return Promise.resolve(this.Connection);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @param tableName The name of the table.
     * @param id The searched id.
     */
    public static async GetData(tableName: "Currency", id: string): Promise<Currency>;
    public static async GetData(tableName: "Users", id: string): Promise<Users>;
    public static async GetData(tableName: "Wumpus", id: string): Promise<Wumpus>;
    public static async GetData(tableName: "Warnings", id: string): Promise<Warnings>;
    public static async GetData(tableName: string, id: string): Promise<any> {
        if(!this.Connection) return Promise.reject(new Error("No connection to database"));
        tableName = FirstCharUpperCase(tableName);
        try {
            const rows: Array<any> = await this.Connection.query(`SELECT * FROM ${tableName} WHERE id = ${id};`);
            return Promise.resolve(rows[0]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @param tableName The name of the table.
     * @param data Data that will be inserted into the table.
     */
    public static async SetData(tableName: "Currency", data: Currency): Promise<any>;
    public static async SetData(tableName: "Users", data: Users): Promise<any>;
    public static async SetData(tableName: "Wumpus", data: Wumpus): Promise<any>;
    public static async SetData(tableName: "Warnings", data: Warnings): Promise<any>;
    public static async SetData(tableName: any, data: any): Promise<any> {
        if(!this.Connection) return Promise.reject(new Error("No connection to database"));
        if(typeof data !== "object") return Promise.reject(new Error("Data must be an object!"));
        if(!data.id && !data.userId) return Promise.reject(
            new Error("Data must have a valid id or a userId property that is not null or undefined!")
        );

        tableName = FirstCharUpperCase(tableName);
        const columnNames: string[] = [];
        const columnDatas = [];

        try {
            const columnDefs: Array<{
                Field: string;
                Type: string;
                Null: "YES" | "NO";
                Key: "PRI" | "";
                Default: any;
                Extra: any;
            }> = await this.Connection.query(`DESCRIBE ${tableName}`);
            for(const name in data) {
                if(data[name]) {
                    columnNames.push(name);
                    const columnDef = columnDefs.find(cdef => cdef.Field == name);
                    if(columnDef.Type === "text") columnDatas.push(`'${(data[name])}'`);
                    else columnDatas.push((data[name]));
                }
            }
        
            const userData = await this.GetData(tableName, data.id || data.userId);
            if(userData) {
                const columnSets: string[] = [];
                for (let i = 0; i < columnNames.length; i++) {
                    columnSets.push(`${columnNames[i]} = ${columnDatas[i]}`);
                }
                return this.Connection.query(`UPDATE ${tableName} SET ${columnSets.join(", ")} WHERE id = ${data.id};`);
            } else {
                return this.Connection.query(`INSERT INTO ${tableName} (${columnNames.join(", ")}) VALUES (${columnDatas.join(", ")});`);
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @param tableName The name of the table.
     * @param id Based on this id, the database will delete that data.
     */
    public static async DeleteData(tableName: "Currency", id: string): Promise<any>;
    public static async DeleteData(tableName: "Users", id: string): Promise<any>;
    public static async DeleteData(tableName: "Wumpus", id: string): Promise<any>;
    public static async DeleteData(tableName: "Warnings", id: string): Promise<any>;
    public static async DeleteData(tableName: string, id: any): Promise<any> {
        if(!this.Connection) return Promise.reject(new Error("No connection to database"));
        tableName = FirstCharUpperCase(tableName);
        return this.Connection.query(`DELETE FROM ${tableName} WHERE id = ${id};`);
    }
}

export default Database;

export interface Currency {
    id: string;
    bits?: number;
    claimTime?: number;
    streak?: number;
}

export interface Users {
    id: string;
    tag?: string;
    exp?: number;
    level?: number;
    spams?: number;
    blLinks?: number;
    kicks?: number;
    bans?: number;
    warns?: number;
    allTime?: number;
    messages?: number;
    commandUses?: number;
}

export interface Wumpus {
    id: string;
    perma?: boolean;
    hasRole?: boolean;
    roleTime?: number;
    hasCustomEmoji?: boolean;
}

export interface Warnings {
    id?: number;
    userId: string;
    warning: string;
    time: number;
}