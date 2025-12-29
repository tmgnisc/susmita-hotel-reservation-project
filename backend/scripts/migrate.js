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
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove single-line comments
    schema = schema.replace(/--.*$/gm, '');
    
    // Split by semicolon and filter out empty statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.match(/^\s*$/));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          // Add semicolon back if not present
          const sql = statement.endsWith(';') ? statement : statement + ';';
          await connection.query(sql);
          successCount++;
        } catch (error) {
          // Ignore "table already exists" errors
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
              error.code === 'ER_DUP_TABLE_NAME' ||
              error.message.includes('already exists')) {
            // Table already exists, that's okay
            successCount++;
            continue;
          } else {
            console.error(`\n❌ Error executing statement ${i + 1}/${statements.length}`);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('SQL:', statement.substring(0, 200));
            throw error;
          }
        }
      }
    }
    
    console.log(`✓ Successfully executed ${successCount}/${statements.length} statements`);
    
    // Verify tables were created
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [process.env.DB_NAME]
    );
    
    console.log(`✓ Found ${tables.length} tables in database`);
    if (tables.length > 0) {
      console.log('  Tables:', tables.map(t => t.TABLE_NAME).join(', '));
    }
    
    if (tables.length === 0) {
      throw new Error('No tables were created. Please check the SQL schema file.');
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
    // Wait a bit to ensure tables are fully created
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if users table exists and if superadmin user exists
    try {
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@gmail.com']);
      
      if (users[0].count === 0) {
        // Create superadmin user (password: admin@123)
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash('admin@123', 10);
        
        const { randomUUID } = await import('crypto');
        const adminId = randomUUID();
        
        await connection.query(
          `INSERT INTO users (id, email, name, password, role, phone, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [adminId, 'admin@gmail.com', 'Super Admin', hashedPassword, 'admin', '+1234567890']
        );
        
        console.log('✓ Superadmin user created successfully');
        console.log('  Email: admin@gmail.com');
        console.log('  Password: admin@123');
        console.log('  Role: admin');
      } else {
        console.log('✓ Superadmin user already exists');
      }
    } catch (tableError) {
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        console.error('⚠ Users table not found. Tables may not have been created properly.');
        throw tableError;
      }
      throw tableError;
    }
  } catch (error) {
    console.error('Error seeding initial data:', error.message);
    throw error;
  }
}

runMigrations();

