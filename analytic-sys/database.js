const Config = require("../config.json");
const mariadb = require("mariadb");
const Colors = require("colors/safe");

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
        /** @type {Promise<import("mariadb").Connection>} */
        const promise = new Promise((resolve, reject) => {
            mariadb.createConnection(Config.mariaDb).then((conn) => {
                console.log(Colors.green(`Connected to database! (Connection: Analytic) (id: ${conn.threadId})`));
                conn.on("error", async (err) => {
                    if(err.code === "ER_SOCKET_UNEXPECTED_CLOSE") {
                        console.log(`Caught ER_SOCKET_UNEXPECTED_CLOSE (Connection: Analytic) (id: ${conn.threadId})`);
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
     * @param {string} userId The searched userId.
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
        if(!module.exports.Connection) return;
        const { userId, channelId, timestampt } = data;
        module.exports.Connection.query("INSERT INTO VoiceLogs (userId, channelId, timestampt) VALUES (?, ?, ?);", [userId, channelId, timestampt]);
        return;

    },

    /**
     * @desc Removes all data from VoiceLogs table
     * @returns {void}
     */
    DeleteData() {
        if(!module.exports.Connection) return;
        module.exports.Connection.query("TRUNCATE TABLE VoiceLogs;").catch(console.error);
        return;
    }
};