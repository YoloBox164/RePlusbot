const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./analytic-sys/database/voicelogs.sqlite');

const colors = require('colors/safe');

const Functions = require('../functions.js');

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

/**
 * @typedef {Object} logs
 * @property {string} userId
 * @property {(string|null)} channelId
 * @property {number} timestampt
*/

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

/** @typedef {(logs)} databaseObject */

/** @typedef {('logs')} tableName */

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports = {

    SQLiteDb: Database,

    /**
     * @param {tableName} tableName The name of the table to Prepare for use
     * @returns {sqlite.Statement} The table
     */
    Prepare: function(tableName) {
        var tableArrString = [];
        var tableArr = DatabaseTableSchema[`${tableName}`];
        for(var i = 0; i < tableArr.length; i++) {
            tableArrString.push(`${tableArr[i].name} ${tableArr[i].type}`);
        }

        const Table = Database.prepare(`SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = '${tableName}';`).get();

        if(!Table['count(*)']) {
            Database.prepare(`CREATE TABLE ${tableName} (${tableArrString.join(', ')});`).run();
            Database.pragma("synchronous = 1");
            Database.pragma("journal_mode = wal");
        }

        console.log(colors.cyan(`DB: ${Functions.FirstCharUpperCase(tableName)} Table is Ready!`));
        return Table;
    },

    /**
     * @param {string} userid The searched userid.
     * @returns {Array<databaseObject>} Table Data.
     */

    GetData: function(userId) {
        var tableData = Database.prepare("SELECT * FROM logs WHERE userId = ? ;").all(userId);
        if(!tableData) tableData = [];
        return tableData;
    },

    /**
     * @param {databaseObject} data Data that will be inserted into the table.
     * @returns {sqlite.Statement}
     */

    AddData: function(data) {
        return Database.prepare("INSERT INTO logs (userId, channelId, timestampt) VALUES (@userId, @channelId, @timestampt);").run(data);
    }
}