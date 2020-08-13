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
*/

// /////////////////////////////////

/**
 * @typedef {Object} Warnings
 * @property {number} id
 * @property {string} userid
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
    async Connect() {
        const promise = new Promise((resolve, reject) => {
            mariadb.createConnection({
                host: Config.mariaDb.host,
                user: Config.mariaDb.user,
                password: Config.mariaDb.password,
                database: Config.mariaDb.database,
                bigNumberStrings: true
            }).then((conn) => {
                console.log(Colors.green(`Connected to database! (Connection: Normal) (id: ${conn.threadId})`));
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
    async GetData(tableName, id) {
        if(!module.exports.Connection) return;
        tableName = Tools.FirstCharUpperCase(tableName);
        const promise = new Promise((resolve, reject) => {
            module.exports.Connection.query(`SELECT * FROM ${tableName} WHERE id = ${id};`).then(rows => {
                resolve(rows[0]);
            }).catch(err => reject(err));
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
    async SetData(tableName, data) {
        if(!module.exports.Connection) return;
        tableName = Tools.FirstCharUpperCase(tableName);
        const columnNames = [];
        const columnDatas = [];
        for(const name in data) {
            if(data[name]) {
                columnNames.push(name);
                if(name == "tag") columnDatas.push(`'${(data[name])}'`);
                else columnDatas.push((data[name]));
            }
        }

        const promise = new Promise((resolve, reject) => {
            this.GetData(tableName, data.id).then(userData => {
                if(data && data.id && userData) {
                    columnNames.forEach((name, i, array) => {
                        if(name == "tag") array[i] = `${name} = '${data[name]}'`;
                        else array[i] = `${name} = ${data[name]}`;
                    });
                    resolve(module.exports.Connection.query(
                        `UPDATE ${tableName} SET ${columnNames.join(", ")} WHERE id = ?`,
                        [data.id]
                    ));
                } else {
                    resolve(module.exports.Connection.query(
                        `INSERT INTO ${tableName} (${columnNames.join(", ")}) VALUES (${columnDatas.join(", ")});`
                    ));
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
    async DeleteData(tableName, id) {
        if(!module.exports.Connection) return;
        tableName = Tools.FirstCharUpperCase(tableName);
        return module.exports.Connection.query(`DELETE FROM ${tableName} WHERE id = ${id};`);
    }
};

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    WumpusRoleId: "611682394185138176",
    DayInMilliSeconds: 86400000
};