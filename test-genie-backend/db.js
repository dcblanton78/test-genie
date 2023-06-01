const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Iloveaugwood$4",
  database: "test_cases_db",
});

module.exports = pool.promise();
