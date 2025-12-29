import dotenv from 'dotenv';
import { createDatabase, getConnection } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  let connection;
  
  try {
    console.log('Starting database migration...');
    
    // Create database if it doesn't exist
    await createDatabase();
    
    // Get connection to the database
    connection = await getConnection();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✓ All tables created successfully');
    
    // Insert initial data if needed
    await seedInitialData(connection);
    
    console.log('✓ Database migration completed successfully');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

async function seedInitialData(connection) {
  try {
    // Check if admin user exists
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
    
    if (users[0].count === 0) {
      // Create default admin user (password: admin123)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      const adminId = (await import('crypto')).randomUUID();
      await connection.query(
        `INSERT INTO users (id, email, name, password, role, phone, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [adminId, 'admin@hotelsus.com', 'Admin User', hashedPassword, 'admin', '+1234567890']
      );
      
      console.log('✓ Default admin user created (email: admin@hotelsus.com, password: admin123)');
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}

runMigrations();

