import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';

const router = express.Router();

// Get all tables
router.get('/', async (req, res, next) => {
  try {
    const { status, minCapacity, maxCapacity } = req.query;
    
    let query = 'SELECT * FROM tables WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (minCapacity) {
      query += ' AND capacity >= ?';
      params.push(minCapacity);
    }
    
    if (maxCapacity) {
      query += ' AND capacity <= ?';
      params.push(maxCapacity);
    }
    
    query += ' ORDER BY table_number ASC';
    
    const [tables] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { tables }
    });
  } catch (error) {
    next(error);
  }
});

// Get table by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [tables] = await dbPool.query(
      'SELECT * FROM tables WHERE id = ?',
      [id]
    );
    
    if (tables.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    const table = tables[0];
    
    res.json({
      success: true,
      data: { table }
    });
  } catch (error) {
    next(error);
  }
});

// Create table
router.post('/', async (req, res, next) => {
  try {
    const { tableNumber, capacity, status, description, location } = req.body;
    
    if (!tableNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tableNumber and capacity'
      });
    }
    
    const tableId = randomUUID();
    
    await dbPool.query(
      `INSERT INTO tables (id, table_number, capacity, status, description, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tableId, tableNumber, capacity, status || 'available', description || null, location || null]
    );
    
    // Get created table
    const [tables] = await dbPool.query('SELECT * FROM tables WHERE id = ?', [tableId]);
    const table = tables[0];
    
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: { table }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }
    next(error);
  }
});

// Update table
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, status, description, location } = req.body;
    
    const updates = {};
    if (tableNumber !== undefined) updates.table_number = tableNumber;
    if (capacity !== undefined) updates.capacity = capacity;
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    
    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      
      await dbPool.query(
        `UPDATE tables SET ${setClause} WHERE id = ?`,
        values
      );
    }
    
    // Get updated table
    const [tables] = await dbPool.query('SELECT * FROM tables WHERE id = ?', [id]);
    const table = tables[0];
    
    res.json({
      success: true,
      message: 'Table updated successfully',
      data: { table }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }
    next(error);
  }
});

// Delete table
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if table has active reservations
    const [reservations] = await dbPool.query(
      'SELECT COUNT(*) as count FROM table_reservations WHERE table_id = ? AND status IN ("pending", "confirmed", "seated")',
      [id]
    );
    
    if (reservations[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active reservations'
      });
    }
    
    await dbPool.query('DELETE FROM tables WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

