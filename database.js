const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./database/database.sqlite');

const colors = require('colors/safe');

const Functions = require('./functions.js');

var currencyTableArr = [];
var currencyTableString = [];

module.exports = {
    PrepareCurrencyTable: function() {
        currencyTableArr = DatabaseTableSchema["currency"];
    
        for(let i = 0; i < currencyTableArr.length; i++) {
            currencyTableString.push(`${currencyTableArr[i].name} ${currencyTableArr[i].type}`);
        }

        const CurrencyTable = Database.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'currency';").get();
        if(!CurrencyTable['count(*)']) {
            Database.prepare(`CREATE TABLE currency (${currencyTableString.join(', ')});`).run();
            Database.pragma("synchronous = 1");
            Database.pragma("journal_mode = wal");
        };
        console.log(colors.cyan("DB: Currency Table is Ready!"))
        return CurrencyTable;
    },

    GetCurrencyData: function() {
        return Database.prepare("SELECT * FROM currency WHERE id = ? ;");
    },

    SetCurrencyData: function() {
        return Database.prepare(`INSERT OR REPLACE INTO currency (${Functions.GetObjectValueFromArray(currencyTableArr, "name").join(', ')}) VALUES (@${Functions.GetObjectValueFromArray(currencyTableArr, "name").join(', @')});`);
    },

    DeleteCurrencyData: function() {
        return Database.prepare("delete FROM currency WHERE id = ? ;");
    },

    GetCurrencyObjectTemplate: function(id) {
        return currenyData = {
            id: `${id}`,
            bits: 0,
            hasRole: 0,
            claimTime: 0
        }

    }
}

module.exports.config = {
    DayBits: 250,
    WumpusRoleCost: 5500,
    DayInMilliSeconds: 86400000
}