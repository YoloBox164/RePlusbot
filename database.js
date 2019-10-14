const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./database/database.sqlite');

const colors = require('colors/safe');

const Functions = require('./functions.js');

module.exports = {
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

    GetData: function(tableName, id) {
        var tableData = Database.prepare(`SELECT * FROM ${tableName} WHERE id = ? ;`).get(id);
        if(!tableData) {
            if(tableName == 'wumpus') {
                tableData = this.GetWumpusObjectTemplate(id);
            } else if(tableName == 'currency') {
                tableData = this.GetCurrencyObjectTemplate(id);
            }
        }
        this.SetData(tableName, tableData);
        return tableData;
    },
    
    SetData: function(tableName, data) {
        var tableArr = DatabaseTableSchema[`${tableName}`];
        var names = Functions.GetObjectValueFromArray(tableArr, "name");
        return Database.prepare(`INSERT OR REPLACE INTO ${tableName} (${names.join(', ')}) VALUES (@${names.join(', @')});`).run(data);
    },
    
    DeleteData: function(tableName, id) {
        return Database.prepare(`delete FROM ${tableName} WHERE id = ? ;`).run(id);
    },

    GetCurrencyObjectTemplate: function(id) {
        return currenyData = {
            id: `${id}`,
            bits: 0,
            claimTime: 0,
            streak: 0
        }
    },

    GetWumpusObjectTemplate: function(id) {
        return wumpusData = {
            id: `${id}`,
            perma: 0,
            hasRole: 0,
            roleTime: 0
        }
    }
}

module.exports.config = {
    DayBits: 250,
    DayBitsStreakBonus: 750,
    WumpusRoleCost: 5500,
    WumpusRoleId: '611682394185138176',
    DayInMilliSeconds: 86400000
}