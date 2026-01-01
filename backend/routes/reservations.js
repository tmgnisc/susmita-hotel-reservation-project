import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';

const router = express.Router();

// Get all reservations
router.get('/', async (req, res, next) => {
  try {
    let query = `
      SELECT tr.*, t.table_number, t.capacity, t.location,
             u.name as user_name, u.email as user_email
      FROM table_reservations tr
      JOIN tables t ON tr.table_id = t.id
      JOIN users u ON tr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (req.query.status) {
      query += ' AND tr.status = ?';
      params.push(req.query.status);
    }
    
    if (req.query.date) {
      query += ' AND tr.reservation_date = ?';
      params.push(req.query.date);
    }
    
    query += ' ORDER BY tr.reservation_date DESC, tr.reservation_time DESC';
    
    const [reservations] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
});

// Get reservation by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [reservations] = await dbPool.query(
      `SELECT tr.*, t.table_number, t.capacity, t.location, t.status as table_status,
              u.name as user_name, u.email as user_email
       FROM table_reservations tr
       JOIN tables t ON tr.table_id = t.id
       JOIN users u ON tr.user_id = u.id
       WHERE tr.id = ?`,
      [id]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    const reservation = reservations[0];
    
    res.json({
      success: true,
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
});

// Create reservation
router.post('/', async (req, res, next) => {
  try {
    const { tableId, reservationDate, reservationTime, duration, guests, specialRequests, userId } = req.body;
    
    if (!tableId || !reservationDate || !reservationTime || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tableId, reservationDate, reservationTime, and guests'
      });
    }
    
    // Use provided userId or create a guest user
    let finalUserId = userId;
    if (!finalUserId) {
      // Create or get a guest user
      const [guestUsers] = await dbPool.query(
        "SELECT id FROM users WHERE email = 'guest@restaurant.com' LIMIT 1"
      );
      if (guestUsers.length > 0) {
        finalUserId = guestUsers[0].id;
      } else {
        // Create guest user
        const guestId = randomUUID();
        await dbPool.query(
          `INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)`,
          [guestId, 'guest@restaurant.com', 'Guest User', 'no-password', 'user']
        );
        finalUserId = guestId;
      }
    }
    
    // Check if table exists and is available
    const [tables] = await dbPool.query(
      'SELECT * FROM tables WHERE id = ?',
      [tableId]
    );
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    const table = tables[0];
    
    if (table.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Table is not available'
      });
    }
    
    if (guests > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Table capacity is ${table.capacity}, but ${guests} guests requested`
      });
    }
    
    // Check for overlapping reservations
    // Simplified: check if any active reservation exists for the same table and date
    // For now, we'll allow multiple reservations on the same date/time (you can enhance this later)
    const [overlapping] = await dbPool.query(
      `SELECT id FROM table_reservations 
       WHERE table_id = ? 
       AND reservation_date = ?
       AND reservation_time = ?
       AND status NOT IN ('cancelled', 'completed')`,
      [tableId, reservationDate, reservationTime]
    );
    
    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Table is already reserved for this time slot'
      });
    }
    
    // Generate reservation ID
    const reservationId = randomUUID();
    
    // Create reservation (total_amount can be 0 for now, or set a reservation fee)
    const totalAmount = 0; // No charge for table reservation, only food orders
    
    await dbPool.query(
      `INSERT INTO table_reservations (id, table_id, user_id, reservation_date, reservation_time, duration, status, total_amount, guests, special_requests)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [
        reservationId, 
        tableId, 
        finalUserId, 
        reservationDate, 
        reservationTime, 
        duration || 120,
        totalAmount, 
        guests, 
        specialRequests || null
      ]
    );
    
    // Get created reservation
    const [reservations] = await dbPool.query(
      `SELECT tr.*, t.table_number, t.capacity, t.location
       FROM table_reservations tr
       JOIN tables t ON tr.table_id = t.id
       WHERE tr.id = ?`,
      [reservationId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: { reservation: reservations[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Update reservation status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    await dbPool.query(
      'UPDATE table_reservations SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Update table status if needed
    if (status === 'seated') {
      const [reservations] = await dbPool.query('SELECT table_id FROM table_reservations WHERE id = ?', [id]);
      if (reservations.length > 0) {
        await dbPool.query('UPDATE tables SET status = ? WHERE id = ?', ['occupied', reservations[0].table_id]);
      }
    } else if (status === 'completed' || status === 'cancelled') {
      const [reservations] = await dbPool.query('SELECT table_id FROM table_reservations WHERE id = ?', [id]);
      if (reservations.length > 0) {
        await dbPool.query('UPDATE tables SET status = ? WHERE id = ?', ['available', reservations[0].table_id]);
      }
    }
    
    // Get updated reservation
    const [reservations] = await dbPool.query(
      `SELECT tr.*, t.table_number, t.capacity, t.location
       FROM table_reservations tr
       JOIN tables t ON tr.table_id = t.id
       WHERE tr.id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: { reservation: reservations[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel reservation
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if reservation exists
    const [reservations] = await dbPool.query(
      'SELECT * FROM table_reservations WHERE id = ?',
      [id]
    );
    
    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    const reservation = reservations[0];
    
    // Can only cancel if not already seated or completed
    if (['seated', 'completed'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel reservation that is already seated or completed'
      });
    }
    
    await dbPool.query(
      'UPDATE table_reservations SET status = ? WHERE id = ?',
      ['cancelled', id]
    );
    
    // Update table status back to available
    await dbPool.query('UPDATE tables SET status = ? WHERE id = ?', ['available', reservation.table_id]);
    
    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

