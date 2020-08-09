/** @type {Object<string, Object<string, string>>} */
const DatabaseTableSchema = require('./database.json');

const SQLite = require('better-sqlite3');
const Database = new SQLite('./database/database.sqlite'); // Path relative to bot.js

const colors = require('colors/safe');

const Tools = require('../utils/tools');

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

/**
 * @typedef {Object} currency
 * @property {string} id
 * @property {number} bits
 * @property {number} claimTime
 * @property {number} streak
*/

///////////////////////////////////

/**
 * @typedef {Object} users
 * @property {string} id
 * @property {number} spams
 * @property {number} kicks
 * @property {number} bans
 * @property {number} warns
*/

///////////////////////////////////

/**
 * @typedef {Object} wumpus
 * @property {string} id
 * @property {boolean} perma
 * @property {boolean} hasRole
 * @property {number} roleTime
*/

///////////////////////////////////

/**
 * @typedef {Object} warnings
 * @property {number} id
 * @property {string} userid
 * @property {string} warning
 * @property {number} time
*/

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

/** @typedef {(currency|users|wumpus|warnings)} databaseObject */

/** @typedef {('currency'|'users'|'wumpus'|'warnings')} tableName */

/** @typedef GetDataFunc
 *  @type {{
        (table: 'currency', id: string): currency;
        (table: 'users', id: string): users;
        (table: 'wumpus', id: string): wumpus;
        (table: 'warnings', id: string): warnings;
    }}
*/

/** @typedef SetDataFunc
 *  @type {{
        (table: 'currency', data: Object<currency>): void;
        (table: 'users', data: Object<users>): void;
        (table: 'wumpus', data: Object<wumpus>): void;
        (table: 'warnings', data: Object<warnings>): void;
    }}
*/

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports = {

    SQLiteDB: Database,

    /**
     * @param {tableName} tableName The name of the table to Prepare for use
     * @returns {sqlite.Statement} The table
     */
    Prepare: function(tableName) {
        const tableArrString = [];
        const tableColumns = DatabaseTableSchema[`${tableName}`];
        for(const name in tableColumns) {
            if (tableColumns.hasOwnProperty(name)) {
                const type = tableColumns[name];
                tableArrString.push(`${name} ${type}`);
            }
        }

        const Table = Database.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = '${tableName}';`).get();

        if(!Table['count(*)']) {
            Database.prepare(`CREATE TABLE ${tableName} (${tableArrString.join(', ')});`).run();
            Database.pragma("synchronous = 1");
            Database.pragma("journal_mode = wal");
        }

        console.log(colors.cyan(`DB: ${Tools.FirstCharUpperCase(tableName)} Table is Ready!`));
        return Table;
    },

    /**
     * @type {GetDataFunc}
     * @param {tableName} tableName The name of the table.
     * @param {string} id The searched id.
     * @returns {databaseObject} Table Data.
     */
    GetData: function(tableName, id) { return Database.prepare(`SELECT * FROM ${tableName} WHERE id = ? ;`).get(id); },

    /**
     * @type {SetDataFunc}
     * @param {tableName} tableName The name of the table.
     * @param {databaseObject} data Data that will be inserted into the table.
     */
    SetData: function(tableName, data) {
        const columnNames = [];
        for(const name in data) columnNames.push(name);

        const userData = this.GetData(tableName, data.id);
        if(data && data.id && userData) {
            columnNames.forEach((name, i, array) => {
                array[i] = `${name} = ${data[name]}`;
            });
            Database.prepare(`UPDATE ${tableName} SET ${columnNames.join(', ')} WHERE id = ?`).run(data.id);
            return;
        }

        Database.prepare(`INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (@${columnNames.join(', @')});`).run(data);
        return;
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     */
    DeleteData: function(tableName, id) { return Database.prepare(`DELETE FROM ${tableName} WHERE id = ? ;`).run(id); }
}

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    WumpusRoleId: '611682394185138176',
    DayInMilliSeconds: 86400000
}