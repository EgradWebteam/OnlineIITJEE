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
    .then(connection => {
        console.log("Connected to MySQL DB");
        return connection.query('SELECT 1');  
    })
    .then(() => {
        console.log("Database is responsive");
    })
    .catch(err => {
        console.error("Error connecting to DB:", err);
    });

module.exports = db;
