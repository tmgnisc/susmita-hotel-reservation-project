import express from 'express';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import dbPool from '../config/database.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-intent', async (req, res, next) => {
  try {
    const { amount, currency = 'usd', reservationId, orderId, userId, metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Generate payment ID
    const paymentId = randomUUID();
    
    // Get userId from reservation or order, or use provided userId, or create guest user
    let finalUserId = userId;
    
    if (!finalUserId && reservationId) {
      // Get userId from reservation
      const [reservations] = await dbPool.query(
        'SELECT user_id FROM table_reservations WHERE id = ?',
        [reservationId]
      );
      if (reservations.length > 0) {
        finalUserId = reservations[0].user_id;
      }
    }
    
    if (!finalUserId && orderId) {
      // Get userId from order
      const [orders] = await dbPool.query(
        'SELECT user_id FROM food_orders WHERE id = ?',
        [orderId]
      );
      if (orders.length > 0) {
        finalUserId = orders[0].user_id;
      }
    }
    
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
    
    // Create payment record
    await dbPool.query(
      `INSERT INTO payments (id, reservation_id, order_id, user_id, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [paymentId, reservationId || null, orderId || null, finalUserId, amount, currency]
    );
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        paymentId: paymentId,
        userId: finalUserId || '',
        reservationId: reservationId || '',
        orderId: orderId || '',
        ...metadata
      }
    });
    
    // Update payment record with Stripe payment intent ID
    await dbPool.query(
      'UPDATE payments SET stripe_payment_intent_id = ? WHERE id = ?',
      [paymentIntent.id, paymentId]
    );
    
    res.json({
      success: true,
      data: {
        paymentIntent: {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id
        },
        paymentId
      }
    });
  } catch (error) {
    next(error);
  }
});

// Confirm payment
router.post('/confirm', async (req, res, next) => {
  try {
    const { paymentIntentId, paymentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update payment record
      await dbPool.query(
        'UPDATE payments SET status = ? WHERE stripe_payment_intent_id = ?',
        ['completed', paymentIntentId]
      );
      
      // If it's a reservation payment, update reservation status
      if (paymentIntent.metadata.reservationId) {
        await dbPool.query(
          'UPDATE table_reservations SET status = ? WHERE id = ?',
          ['confirmed', paymentIntent.metadata.reservationId]
        );
      }
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else {
      await dbPool.query(
        'UPDATE payments SET status = ? WHERE stripe_payment_intent_id = ?',
        ['failed', paymentIntentId]
      );
      
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get payment by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [payments] = await dbPool.query(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    const payment = payments[0];
    
    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Get all payments
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM payments WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [payments] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

