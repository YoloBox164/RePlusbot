const DatabaseTableSchema = require('./database.json');

const sqlite = require('better-sqlite3');
const Database = new sqlite('./database/database.sqlite');

const colors = require('colors/safe');

const Functions = require('./functions.js');

var currencyTableArr = [];
var currencyTableString = [];
var wumpusTableArr = [];
var wumpusTableString = [];

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

    GetCurrencyData: function(id) {
        var currencyData = Database.prepare("SELECT * FROM currency WHERE id = ? ;").get(id);
        if(!currencyData) currencyData = this.GetCurrencyObjectTemplate(id);
        this.SetCurrencyData(currencyData);
        return currencyData;
    },

    SetCurrencyData: function(data) {
        return Database.prepare(`INSERT OR REPLACE INTO currency (${Functions.GetObjectValueFromArray(currencyTableArr, "name").join(', ')}) VALUES (@${Functions.GetObjectValueFromArray(currencyTableArr, "name").join(', @')});`).run(data);
    },

    DeleteCurrencyData: function(id) {
        return Database.prepare("delete FROM currency WHERE id = ? ;").run(id);
    },

    GetCurrencyObjectTemplate: function(id) {
        return currenyData = {
            id: `${id}`,
            bits: 0,
            claimTime: 0
        }
    },

    PrepareWumpusTable: function() {
        wumpusTableArr = DatabaseTableSchema["wumpusRole"];
    
        for(let i = 0; i < currencyTableArr.length; i++) {
            wumpusTableString.push(`${wumpusTableArr[i].name} ${wumpusTableArr[i].type}`);
        }

        const WumpusTable = Database.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'wumpus';").get();
        if(!WumpusTable['count(*)']) {
            Database.prepare(`CREATE TABLE wumpus (${wumpusTableString.join(', ')});`).run();
            Database.pragma("synchronous = 1");
            Database.pragma("journal_mode = wal");
        };
        console.log(colors.cyan("DB: Wumpus Table is Ready!"))
        return WumpusTable;
    },

    GetWumpusData: function(id) {
        var wumpusData = Database.prepare("SELECT * FROM wumpus WHERE id = ? ;").get(id);
        if(!wumpusData) wumpusData = this.GetWumpusObjectTemplate(id);
        this.SetWumpusData(wumpusData);
        return wumpusData;
    },

    SetWumpusData: function(data) {
        return Database.prepare(`INSERT OR REPLACE INTO wumpus (${Functions.GetObjectValueFromArray(wumpusTableArr, "name").join(', ')}) VALUES (@${Functions.GetObjectValueFromArray(wumpusTableArr, "name").join(', @')});`).run(data);
    },

    DeleteWumpusData: function(id) {
        return Database.prepare("delete FROM wumpus WHERE id = ? ;").run(id);
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
    WumpusRoleCost: 5500,
    WumpusRoleId: '611682394185138176',
    DayInMilliSeconds: 86400000
}