const sqlite3 = require("sqlite3");

const initializeDB = async () => {
  const db = new sqlite3.Database("./miniTwitterDB.db");
  return db;
};

const queryDB = (db, query) => {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = { initializeDB, queryDB };
