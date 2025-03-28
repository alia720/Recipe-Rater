// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST, // e.g., 127.0.0.1
  port: process.env.DB_PORT, // e.g., 3306
  user: process.env.DB_USER, // root
  password: process.env.DB_PASSWORD, // ingredient
  database: process.env.DB_DATABASE, // recipe
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
