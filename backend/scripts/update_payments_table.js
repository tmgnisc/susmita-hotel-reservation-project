import dbPool from '../config/database.js';

async function updatePaymentsTable() {
  try {
    console.log('Updating payments table...');
    
    // Check if booking_id column exists
    const [columns] = await dbPool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hotel_sus' 
      AND TABLE_NAME = 'payments' 
      AND COLUMN_NAME = 'booking_id'
    `);
    
    if (columns.length > 0) {
      // Check if reservation_id already exists
      const [reservationCol] = await dbPool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'hotel_sus' 
        AND TABLE_NAME = 'payments' 
        AND COLUMN_NAME = 'reservation_id'
      `);
      
      if (reservationCol.length === 0) {
        // Add reservation_id column
        await dbPool.query(`
          ALTER TABLE payments 
          ADD COLUMN reservation_id VARCHAR(36) NULL AFTER booking_id
        `);
        console.log('✓ Added reservation_id column');
        
        // Migrate data from booking_id to reservation_id (if any)
        // Note: This assumes bookings and reservations are separate, so we'll just add the column
        console.log('✓ Column added (no data migration needed)');
      } else {
        console.log('✓ reservation_id column already exists');
      }
      
      // Optionally drop booking_id if you want to remove it
      // For now, we'll keep both columns for backward compatibility
    } else {
      // Check if reservation_id exists
      const [reservationCol] = await dbPool.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'hotel_sus' 
        AND TABLE_NAME = 'payments' 
        AND COLUMN_NAME = 'reservation_id'
      `);
      
      if (reservationCol.length === 0) {
        // Add reservation_id column
        await dbPool.query(`
          ALTER TABLE payments 
          ADD COLUMN reservation_id VARCHAR(36) NULL,
          ADD INDEX idx_reservation_id (reservation_id)
        `);
        console.log('✓ Added reservation_id column');
      } else {
        console.log('✓ reservation_id column already exists');
      }
    }
    
    console.log('✓ Payments table updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating payments table:', error);
    process.exit(1);
  }
}

updatePaymentsTable();






