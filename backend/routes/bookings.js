import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings
router.get('/', authenticate, async (req, res, next) => {
  try {
    let query = `
      SELECT b.*, r.name as room_name, r.type as room_type, r.room_number,
             u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    // Users can only see their own bookings unless admin/staff
    if (req.user.role === 'user') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    }
    
    if (req.query.status) {
      query += ' AND b.status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const [bookings] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [bookings] = await dbPool.query(
      `SELECT b.*, r.name as room_name, r.type as room_type, r.room_number, r.price,
              u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Check access
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
});

// Create booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests, specialRequests } = req.body;
    
    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if room is available
    const [rooms] = await dbPool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );
    
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const room = rooms[0];
    
    if (room.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Room is not available'
      });
    }
    
    // Check for overlapping bookings
    const [overlapping] = await dbPool.query(
      `SELECT id FROM bookings 
       WHERE room_id = ? 
       AND status NOT IN ('cancelled', 'checked_out')
       AND (
         (check_in <= ? AND check_out >= ?) OR
         (check_in <= ? AND check_out >= ?) OR
         (check_in >= ? AND check_out <= ?)
       )`,
      [roomId, checkIn, checkIn, checkOut, checkOut, checkIn, checkOut]
    );
    
    if (overlapping.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is already booked for these dates'
      });
    }
    
    // Calculate total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price * nights;
    
    // Generate booking ID
    const bookingId = randomUUID();
    
    // Create booking
    await dbPool.query(
      `INSERT INTO bookings (id, room_id, user_id, check_in, check_out, status, total_amount, guests, special_requests)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [bookingId, roomId, req.user.id, checkIn, checkOut, totalAmount, guests, specialRequests || null]
    );
    
    // Get created booking
    const [bookings] = await dbPool.query(
      `SELECT b.*, r.name as room_name, r.type as room_type, r.room_number
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [bookingId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking: bookings[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Update booking status (admin/staff only)
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
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
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Get updated booking
    const [bookings] = await dbPool.query(
      `SELECT b.*, r.name as room_name, r.type as room_type, r.room_number
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: bookings[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if booking exists and belongs to user
    const [bookings] = await dbPool.query(
      'SELECT * FROM bookings WHERE id = ?',
      [id]
    );
    
    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const booking = bookings[0];
    
    // Check access
    if (req.user.role === 'user' && booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Can only cancel if not already checked in or checked out
    if (['checked_in', 'checked_out'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking that is already checked in or out'
      });
    }
    
    await dbPool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', id]
    );
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

