import dotenv from 'dotenv';
import { getConnection } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

dotenv.config();

async function createAdmin() {
  let connection;
  
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    // Parse arguments
    let email = 'admin@gmail.com';
    let password = 'admin@123';
    let name = 'Super Admin';
    let phone = '+1234567890';
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--email' && args[i + 1]) {
        email = args[i + 1];
        i++;
      } else if (args[i] === '--password' && args[i + 1]) {
        password = args[i + 1];
        i++;
      } else if (args[i] === '--name' && args[i + 1]) {
        name = args[i + 1];
        i++;
      } else if (args[i] === '--phone' && args[i + 1]) {
        phone = args[i + 1];
        i++;
      }
    }
    
    console.log('Creating superadmin user...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    
    // Get connection to the database
    connection = await getConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log(`\n⚠ User with email ${email} already exists!`);
      console.log(`  ID: ${existingUser.id}`);
      console.log(`  Role: ${existingUser.role}`);
      console.log('\nUpdating password and role to admin...');
      
      // Update password and role
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.query(
        'UPDATE users SET password = ?, role = ?, name = ?, phone = ? WHERE email = ?',
        [hashedPassword, 'admin', name, phone, email]
      );
      
      console.log('✓ Password updated successfully');
      console.log(`✓ User role updated to 'admin'`);
      console.log(`\nLogin credentials:`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      
      await connection.end();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate user ID
    const adminId = randomUUID();
    
    // Create admin user
    await connection.query(
      `INSERT INTO users (id, email, name, password, role, phone, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [adminId, email, name, hashedPassword, 'admin', phone]
    );
    
    console.log('\n✓ Superadmin user created successfully!');
    console.log('\nLogin credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: admin`);
    console.log(`  ID: ${adminId}`);
    
  } catch (error) {
    console.error('\n❌ Error creating superadmin:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

// Show usage if --help is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node scripts/create-admin.js [options]

Options:
  --email <email>      Admin email (default: admin@gmail.com)
  --password <pass>    Admin password (default: admin@123)
  --name <name>         Admin name (default: Super Admin)
  --phone <phone>      Admin phone (default: +1234567890)
  --help, -h           Show this help message

Examples:
  # Create admin with default credentials
  npm run create-admin

  # Create admin with custom credentials
  npm run create-admin -- --email admin@example.com --password MySecurePass123

  # Create admin with all custom fields
  npm run create-admin -- --email admin@example.com --password MySecurePass123 --name "John Admin" --phone "+1234567890"
`);
  process.exit(0);
}

createAdmin();

