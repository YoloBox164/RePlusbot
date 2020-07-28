const DatabaseTableSchema = require('./database.json');

const SQLiteConst = require('better-sqlite3');
const Database = new SQLiteConst('./database/database.sqlite'); // Path relative to bot.js

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
 * @typedef {Object} wumpus
 * @property {string} id
 * @property {boolean} perma
 * @property {boolean} hasRole
 * @property {number} roleTime
*/

///////////////////////////////////

/**
 * @typedef {Object} warnedUsers
 * @property {string} id
 * @property {number} count
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

/** @typedef {(currency|wumpus|warnedUsers|warnings)} databaseObject */

/** @typedef {('currency'|'wumpus'|'warnedUsers'|'warnings')} tableName */

//////////////////////////////////////////////////////
//////////////////////////////////////////////////////

module.exports = {

    SQLiteDB: Database,

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

        console.log(colors.cyan(`DB: ${Tools.FirstCharUpperCase(tableName)} Table is Ready!`));
        return Table;
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id The searched id.
     * @returns {databaseObject} Table Data.
     */

    GetData: function(tableName, id) {
        var tableData = Database.prepare(`SELECT * FROM ${tableName} WHERE id = ? ;`).get(id);
        if(!tableData) tableData = this.GetObjectTemplate(tableName, id);
        this.SetData(tableName, tableData);
        return tableData;
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {databaseObject} data Data that will be inserted into the table.
     * @returns {sqlite.Statement}
     */
    
    SetData: function(tableName, data) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var names = Tools.GetObjectValueFromArray(tableArr, "name");
        return Database.prepare(`INSERT OR REPLACE INTO ${tableName} (${names.join(', ')}) VALUES (@${names.join(', @')});`).run(data);
    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     * @returns {sqlite.Statement}
     */
    
    DeleteData: function(tableName, id) {
        return Database.prepare(`delete FROM ${tableName} WHERE id = ? ;`).run(id);
    },
    
    /**
     * @param {tableName} tableName The name of the table.
     * @param {string | number}  id The id which repsresent the primary key.
     * @returns {databaseObject}
     */

    GetObjectTemplate: function(tableName, id) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var obj = {};
        var start = 0;
        if(tableName == "warnings") {
            obj = {id: GetLastAvaiableId(), userid: `${id}`};
            start = 2;
        } else {
            obj = {id: `${id}`};
            start = 1;
        }
        for(let i = start; i < tableArr.length; i++) {
            if(tableArr[i].type.includes("BOOLEAN") || tableArr[i].type.includes("INTEGER")) {
                obj[tableArr[i].name] = 0;
            } else if(tableArr[i].type.includes("TEXT")) {
                obj[tableArr[i].name] = "None";
            } else {
                obj[tableArr[i].name] = null;
            }
        }

        return obj;
    }
}

/** 
 * @param {tableName} tableName
 * @returns {number}
*/

function GetLastAvaiableId() {
    var statement = Database.prepare("SELECT count(*) FROM warnings;").get();
    return statement['count(*)'] + 1;
}

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    WumpusRoleId: '611682394185138176',
    DayInMilliSeconds: 86400000
}