import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT) || 3306,
  multipleStatements: true,
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to create database if it doesn't exist
export async function createDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.end();
    console.log(`✓ Database '${process.env.DB_NAME}' is ready`);
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

// Function to get connection to the specific database
export async function getConnection() {
  try {
    const connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME,
    });
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
}

// Export pool with database specified
const dbPool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default dbPool;

