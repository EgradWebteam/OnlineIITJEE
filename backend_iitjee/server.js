const express = require("express");
const cors = require("cors");

require("dotenv").config();
const db = require("./src/config/database.js"); // Ensure this path is correct
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req, res)=> {
    res.json({message: "Backend is working!"});
});
const adminLogin = require("./src/UserAuthentication/AdminLogin.js");
app.use("/admin", adminLogin);



const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));