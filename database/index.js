const Config = require("../config.json");
const mariadb = require("mariadb");
const Tools = require("../utils/tools");
const Colors = require("colors/safe");

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////

/**
 * @typedef {Object} Currency
 * @property {string} id
 * @property {number} bits
 * @property {number} claimTime
 * @property {number} streak
*/

// /////////////////////////////////

/**
 * @typedef {Object} Users
 * @property {string} id
 * @property {string} tag
 * @property {number} exp
 * @property {number} level
 * @property {number} spams
 * @property {number} blLinks
 * @property {number} kicks
 * @property {number} bans
 * @property {number} warns
 * @property {number} allTime
 * @property {number} messages
 * @property {number} commandUses
*/

// /////////////////////////////////

/**
 * @typedef {Object} Wumpus
 * @property {string} id
 * @property {boolean} perma
 * @property {boolean} hasRole
 * @property {number} roleTime
 * @property {boolean} hasCustomEmoji
*/

// /////////////////////////////////

/**
 * @typedef {Object} Warnings
 * @property {number} id
 * @property {string} userId
 * @property {string} warning
 * @property {number} time
*/

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////

/** @typedef {(Currency|Users|Wumpus|Warnings)} databaseObject */

/** @typedef {('Currency'|'Users'|'Wumpus'|'Warnings')} tableName */

/** @typedef GetDataFunc
 *  @type {{
        (table: 'Currency', id: string): Promise<Currency>;
        (table: 'Users', id: string):  Promise<Users>;
        (table: 'Wumpus', id: string):  Promise<Wumpus>;
        (table: 'Warnings', id: string):  Promise<Warnings>;
    }}
*/

/** @typedef SetDataFunc
 *  @type {{
        (table: 'Currency', data: Currency): Promise<any>;
        (table: 'Users', data: Users): Promise<any>;
        (table: 'Wumpus', data: Wumpus): Promise<any>;
        (table: 'Warnings', data: Warnings): Promise<any>;
    }}
*/

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////

module.exports = {
    Connect: async function() {
        /** @type {Promise<import("mariadb").Connection>} */
        const promise = new Promise((resolve, reject) => {
            mariadb.createConnection(Config.mariaDb).then((conn) => {
                console.log(Colors.green(`Connected to database! (Connection: Normal) (id: ${conn.threadId})`));
                conn.on("error", async (err) => {
                    if(err.code === "ER_SOCKET_UNEXPECTED_CLOSE") {
                        console.log(`Caught ER_SOCKET_UNEXPECTED_CLOSE (Connection: Normal) (id: ${conn.threadId})`);
                        module.exports.Connection = await module.exports.Connect();
                    } else {
                        throw err;
                    }
                });
                module.exports.Connection = conn;
                resolve(conn);
            }).catch((err) => { reject(err); });
        });
        return promise;
    },

    /**
     * @async
     * @type {GetDataFunc}
     * @param {tableName} tableName The name of the table.
     * @param {string} id The searched id.
     */
    GetData: async function(tableName, id) {
        if(!module.exports.Connection) return;
        tableName = Tools.FirstCharUpperCase(tableName);
        const promise = new Promise((resolve, reject) => {
            module.exports.Connection.query(`SELECT * FROM ${tableName} WHERE id = ${id};`).then(rows => {
                resolve(rows[0]);
            }).catch(reject);
        });
        return promise;
    },

    /**
     * @async
     * @type {SetDataFunc}
     * @param {tableName} tableName The name of the table.
     * @param {databaseObject} data Data that will be inserted into the table.
     * @returns {Promise<any>}
     */
    SetData: async function(tableName, data) {
        if(!module.exports.Connection) throw new Error("There is not any connection to the database.");
        if(typeof data !== "object") throw new Error("Data must be an object!");
        if(!data.id && !data.userId) throw new Error("Data must have a valid id or a userId property that is not null or undefined!");
        tableName = Tools.FirstCharUpperCase(tableName);
        const columnNames = [];
        const columnDatas = [];

        /** @type {Array<{
                Field: string,
                Type: string,
                Null: "YES"|"NO",
                Key: "PRI"|"",
                Default: any,
                Extra: any
            }>}
        */
        const columnDefs = await module.exports.Connection.query(`DESCRIBE ${tableName}`);
        for(const name in data) {
            if(data[name]) {
                columnNames.push(name);
                const columnDef = columnDefs.find(cdef => cdef.Field == name);
                if(columnDef.Type === "text") columnDatas.push(`'${(data[name])}'`);
                else columnDatas.push((data[name]));
            }
        }
        const promise = new Promise((resolve, reject) => {
            this.GetData(tableName, data.id).then(userData => {
                if(userData) {
                    const columnSets = [];
                    for (let i = 0; i < columnNames.length; i++) {
                        columnSets.push(`${columnNames[i]} = ${columnDatas[i]}`);
                    }
                    module.exports.Connection.query(
                        `UPDATE ${tableName} SET ${columnSets.join(", ")} WHERE id = ${data.id};`
                    ).then(resolve).catch(reject);
                } else {
                    module.exports.Connection.query(
                        `INSERT INTO ${tableName} (${columnNames.join(", ")}) VALUES (${columnDatas.join(", ")});`
                    ).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
        return promise;
    },

    /**
     * @async
     * @param {tableName} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     * @returns {Promise<any>}
     */
    DeleteData: async function(tableName, id) {
        if(!module.exports.Connection) return;
        tableName = Tools.FirstCharUpperCase(tableName);
        return module.exports.Connection.query(`DELETE FROM ${tableName} WHERE id = ${id};`);
    }
};

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    CustomEmojiCost: 2500,
    WumpusRoleId: "611682394185138176",
    DayInMilliSeconds: 86400000
};