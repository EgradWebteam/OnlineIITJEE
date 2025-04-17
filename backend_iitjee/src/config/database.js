require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 100,  
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    },
});

db.getConnection()
  .then(async connection => {
    console.log("Connected to MySQL DB");
    await connection.query('SELECT 1');
    console.log("Database is responsive");
    connection.release(); // ✅ Release the connection after test
  })
  .catch(err => {
    console.error("Error connecting to DB:", err);
  });

module.exports = db;
