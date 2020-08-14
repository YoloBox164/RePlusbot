const Config = require("../config.json");
const mariadb = require("mariadb");
const Colors = require("colors/safe");

const MonthInMs = 2592000000;

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////

/**
 * @typedef {Object} VoiceLogs
 * @property {number} id
 * @property {string} userId
 * @property {(string|null)} channelId
 * @property {number} timestampt
*/

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////

/** @typedef {(VoiceLogs)} databaseObject */

/** @typedef {('VoiceLogs')} tableName */

// ////////////////////////////////////////////////////
// ////////////////////////////////////////////////////


module.exports = {
    async Connect() {
        const promise = new Promise((resolve, reject) => {
            mariadb.createConnection(Config.mariaDb).then((conn) => {
                console.log(Colors.green(`Connected to database! (Connection: Analytic) (id: ${conn.threadId})`));
                module.exports.Connection = conn;
                resolve(conn);
            }).catch((err) => { reject(err); });
        });
        return promise;
    },

    /**
     * @async
     * @param {string} userId The searched userid.
     * @returns {Promise<Array<databaseObject>>} Table Data.
     */
    async GetData(userId) {
        if(!module.exports.Connection) return;
        const promise = new Promise((resolve, reject) => {
            module.exports.Connection.query("SELECT * FROM VoiceLogs WHERE userId = ? ORDER BY id DESC LIMIT 2;", [userId]).then(rows => {
                resolve([rows[0], rows[1]]);
            }).catch(err => reject(err));
        });
        return promise;
    },

    /**
     * @param {databaseObject} data Data that will be inserted into the table.
     */
    AddData(data) {
        if(!this.Connection) return;
        const { userId, channelId, timestampt } = data;
        this.Connection.query("INSERT INTO VoiceLogs (userId, channelId, timestampt) VALUES (?, ?, ?);", [userId, channelId, timestampt]);
        return;

    },

    /**
     * @param {tableName} tableName The name of the table.
     * @param {string} id Based on this id, the database will delete that data.
     * @returns {void}
     */
    DeleteData() {
        if(!this.Connection) return;
        this.Connection.query(`DELETE FROM VoiceLogs WHERE timestampt <= ${Date.now() - MonthInMs};`).catch(err => {throw err;});
        return;
    }
};