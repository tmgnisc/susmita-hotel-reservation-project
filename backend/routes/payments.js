import express from 'express';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import dbPool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-intent', authenticate, async (req, res, next) => {
  try {
    const { amount, currency = 'usd', bookingId, orderId, metadata = {} } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Generate payment ID
    const paymentId = randomUUID();
    
    // Create payment record
    await dbPool.query(
      `INSERT INTO payments (id, booking_id, order_id, user_id, amount, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [paymentId, bookingId || null, orderId || null, req.user.id, amount, currency]
    );
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        paymentId: paymentId,
        userId: req.user.id,
        bookingId: bookingId || '',
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
router.post('/confirm', authenticate, async (req, res, next) => {
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
      
      // If it's a booking payment, update booking status
      if (paymentIntent.metadata.bookingId) {
        await dbPool.query(
          'UPDATE bookings SET status = ? WHERE id = ?',
          ['confirmed', paymentIntent.metadata.bookingId]
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
router.get('/:id', authenticate, async (req, res, next) => {
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
    
    // Check access
    if (req.user.role === 'user' && payment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Get all payments
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
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

