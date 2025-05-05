require('dotenv').config();
const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: "iit-db-instance.cn4s2qass7tx.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "ServerDB114#",
    database: "iitdatabase",
    waitForConnections: true,
    connectionLimit: 100,  
    queueLimit: 0,
   
    
});

db.getConnection()
  .then(async connection => {
    console.log("Connected to MySQL DB");
    await connection.query('SELECT 1');
    // console.log("Database is responsive");
    connection.release(); // ✅ Release the connection after test
  })
  .catch(err => {
    console.error("Error connecting to DB:", err);
  });

module.exports = db;
