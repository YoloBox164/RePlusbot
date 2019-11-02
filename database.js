const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./database/database.sqlite');

const colors = require('colors/safe');

const Functions = require('./functions.js');

module.exports = {

    Database: Database,

    /**
     * @param {string} tableName
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
     * @param {string} tableName The name of the table.
     * @param {string} id The searched id.
     * @returns {{id}} Table Data.
     */

    GetData: function(tableName, id) {
        var tableData = Database.prepare(`SELECT * FROM ${tableName} WHERE id = ? ;`).get(id);
        if(!tableData) tableData = this.GetObjectTemplate(tableName, id);
        this.SetData(tableName, tableData);
        return tableData;
    },

    /**
     * @param {string} tableName The name of the table.
     * @param {{}} data Data that will be inserted into the table.
     * @returns {sqlite.Statement}
     */
    
    SetData: function(tableName, data) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var names = Functions.GetObjectValueFromArray(tableArr, "name");
        return Database.prepare(`INSERT OR REPLACE INTO ${tableName} (${names.join(', ')}) VALUES (@${names.join(', @')});`).run(data);
    },

    /**
     * @param {string} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     * @returns {sqlite.Statement}
     */
    
    DeleteData: function(tableName, id) {
        return Database.prepare(`delete FROM ${tableName} WHERE id = ? ;`).run(id);
    },
    
    /**
     * @param {string} tableName The name of the table.
     * @param {string | number}  id The id which repsresent the primary key.
     */

    GetObjectTemplate: function(tableName, id) {
        var obj;
        switch(tableName) {
            case 'currency':
                obj = {
                    id: `${id}`,
                    bits: 0,
                    claimTime: 0,
                    streak: 0
                }
                break;
            case 'wumpus':
                obj = {
                    id: `${id}`,
                    perma: 0,
                    hasRole: 0,
                    roleTime: 0
                }
                break;
            case 'inviters':
                obj = {
                    id: `${id}`,
                    created: 0,
                    used: 0
                }
                break;
            case 'activeInvites':
                obj = {
                    id: `${id}`,
                    invite: "",
                    uses: 0
                }
                break;
            case 'warnedUsers':
                obj = {
                    id: `${id}`,
                    count: 0
                }
                break;
            case 'warnings':
                obj = {
                    id: GetLastAvaiableId(),
                    userid: `${id}`,
                    warning: "Not given.",
                    time: 0
                }
                break;
            default: 
                obj = {
                    id: `${id}`
                }
                break;
        }
        return obj;
    }
}

/** @returns {number} */

function GetLastAvaiableId() {
    var statement = database.Database.prepare("SELECT count(*) FROM warnings;").get();
    return statement['count(*)'] + 1;
}

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    WumpusRoleId: '611682394185138176',
    DayInMilliSeconds: 86400000
}