import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';

const router = express.Router();

// Food Items Routes
router.get('/items', async (req, res, next) => {
  try {
    const { category, available } = req.query;
    
    let query = 'SELECT * FROM food_items WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (available !== undefined) {
      query += ' AND available = ?';
      params.push(available === 'true');
    }
    
    query += ' ORDER BY category, name';
    
    const [items] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { items }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [items] = await dbPool.query(
      'SELECT * FROM food_items WHERE id = ?',
      [id]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    res.json({
      success: true,
      data: { item: items[0] }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/items', async (req, res, next) => {
  try {
    const { name, description, price, category, image, available, preparationTime } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const itemId = randomUUID();
    
    await dbPool.query(
      `INSERT INTO food_items (id, name, description, price, category, image, available, preparation_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [itemId, name, description, price, category, image, available !== false, preparationTime || 0]
    );
    
    const [items] = await dbPool.query(
      'SELECT * FROM food_items WHERE id = ?',
      [itemId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      data: { item: items[0] }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image, available, preparationTime } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (image !== undefined) updates.image = image;
    if (available !== undefined) updates.available = available;
    if (preparationTime !== undefined) updates.preparation_time = preparationTime;
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);
    
    await dbPool.query(
      `UPDATE food_items SET ${setClause} WHERE id = ?`,
      values
    );
    
    const [items] = await dbPool.query(
      'SELECT * FROM food_items WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Food item updated successfully',
      data: { item: items[0] }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await dbPool.query('DELETE FROM food_items WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Food item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Food Orders Routes
router.get('/orders', async (req, res, next) => {
  try {
    let query = `
      SELECT fo.*, u.name as user_name, u.email as user_email
      FROM food_orders fo
      LEFT JOIN users u ON fo.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (req.query.status) {
      query += ' AND fo.status = ?';
      params.push(req.query.status);
    }
    
    query += ' ORDER BY fo.created_at DESC';
    
    const [orders] = await dbPool.query(query, params);
    
    // Get order items for each order
    for (const order of orders) {
      const [items] = await dbPool.query(
        `SELECT foi.*, fi.name, fi.image, fi.category
         FROM food_order_items foi
         JOIN food_items fi ON foi.food_item_id = fi.id
         WHERE foi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [orders] = await dbPool.query(
      `SELECT fo.*, u.name as user_name, u.email as user_email
       FROM food_orders fo
       LEFT JOIN users u ON fo.user_id = u.id
       WHERE fo.id = ?`,
      [id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    const [items] = await dbPool.query(
      `SELECT foi.*, fi.name, fi.image, fi.category
       FROM food_order_items foi
       JOIN food_items fi ON foi.food_item_id = fi.id
       WHERE foi.order_id = ?`,
      [id]
    );
    order.items = items;
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/orders', async (req, res, next) => {
  try {
    const { items, roomNumber, userId } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const [foodItems] = await dbPool.query(
        'SELECT * FROM food_items WHERE id = ? AND available = TRUE',
        [item.foodItemId]
      );
      
      if (foodItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Food item ${item.foodItemId} not found or unavailable`
        });
      }
      
      const foodItem = foodItems[0];
      const itemTotal = foodItem.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: foodItem.price
      });
    }
    
    // Generate order ID
    const orderId = randomUUID();
    
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
    
    // Create order
    await dbPool.query(
      `INSERT INTO food_orders (id, user_id, status, total_amount, room_number)
       VALUES (?, ?, 'pending', ?, ?)`,
      [orderId, finalUserId, totalAmount, roomNumber || null]
    );
    
    // Create order items
    for (const item of orderItems) {
      const orderItemId = randomUUID();
      await dbPool.query(
        `INSERT INTO food_order_items (id, order_id, food_item_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderItemId, orderId, item.foodItemId, item.quantity, item.price]
      );
    }
    
    // Get created order
    const [orders] = await dbPool.query(
      'SELECT * FROM food_orders WHERE id = ?',
      [orderId]
    );
    const order = orders[0];
    
    const [orderItemsData] = await dbPool.query(
      `SELECT foi.*, fi.name, fi.image, fi.category
       FROM food_order_items foi
       JOIN food_items fi ON foi.food_item_id = fi.id
       WHERE foi.order_id = ?`,
      [orderId]
    );
    order.items = orderItemsData;
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/status', async (req, res, next) => {
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
      'UPDATE food_orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    const [orders] = await dbPool.query(
      'SELECT * FROM food_orders WHERE id = ?',
      [id]
    );
    
    const [items] = await dbPool.query(
      `SELECT foi.*, fi.name, fi.image, fi.category
       FROM food_order_items foi
       JOIN food_items fi ON foi.food_item_id = fi.id
       WHERE foi.order_id = ?`,
      [id]
    );
    orders[0].items = items;
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: orders[0] }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

