import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all staff members
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { department, status } = req.query;
    
    let query = 'SELECT * FROM staff_members WHERE 1=1';
    const params = [];
    
    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [staff] = await dbPool.query(query, params);
    
    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    next(error);
  }
});

// Get staff member by ID
router.get('/:id', authenticate, authorize('admin', 'staff'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [staff] = await dbPool.query(
      'SELECT * FROM staff_members WHERE id = ?',
      [id]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    res.json({
      success: true,
      data: { staffMember: staff[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Create staff member
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, role, department, phone, avatar, status, hireDate } = req.body;
    
    if (!name || !email || !role || !department || !hireDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const staffId = randomUUID();
    
    await dbPool.query(
      `INSERT INTO staff_members (id, name, email, role, department, phone, avatar, status, hire_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffId, name, email, role, department, phone || null, avatar || null, status || 'active', hireDate]
    );
    
    const [staff] = await dbPool.query(
      'SELECT * FROM staff_members WHERE id = ?',
      [staffId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: { staffMember: staff[0] }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    next(error);
  }
});

// Update staff member
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, phone, avatar, status, hireDate } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (department !== undefined) updates.department = department;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;
    if (status !== undefined) updates.status = status;
    if (hireDate !== undefined) updates.hire_date = hireDate;
    
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
      `UPDATE staff_members SET ${setClause} WHERE id = ?`,
      values
    );
    
    const [staff] = await dbPool.query(
      'SELECT * FROM staff_members WHERE id = ?',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: { staffMember: staff[0] }
    });
  } catch (error) {
    next(error);
  }
});

// Delete staff member
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await dbPool.query('DELETE FROM staff_members WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

