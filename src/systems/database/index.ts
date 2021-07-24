import mariadb, { Connection } from "mariadb";
import colors from "colors/safe";
import logger from "../../logger";

let connection: Connection;

export async function Connect(): Promise<Connection> {
  try {
    if (connection.isValid()) connection.end();
    connection = await mariadb.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      bigNumberStrings: true,
    });

    logger.info(colors.green(`Connected to database! (id: ${this.Connection.threadId})`));

    connection.on("error", (err) => {
      if (err.code === "ER_SOCKET_UNEXPECTED_CLOSE") {
        logger.warn(`Caught ER_SOCKET_UNEXPECTED_CLOSE! (id: ${this.Connection.threadId})`);
      }
    });

    return Promise.resolve(connection);
  } catch (error) {
    return Promise.reject(error);
  }
}
