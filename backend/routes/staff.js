import express from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
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
    const { name, email, password, role, department, phone, avatar, status, hireDate } = req.body;
    
    if (!name || !email || !password || !role || !department || !hireDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, password, role, department, and hireDate are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if email already exists in users table
    const [existingUsers] = await dbPool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Start transaction
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create user account
      const userId = randomUUID();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await connection.query(
        `INSERT INTO users (id, email, name, password, role, phone, avatar) 
         VALUES (?, ?, ?, ?, 'staff', ?, ?)`,
        [userId, email, name, hashedPassword, phone || null, avatar || null]
      );
      
      // Create staff member record
      const staffId = randomUUID();
      await connection.query(
        `INSERT INTO staff_members (id, user_id, name, email, role, department, phone, avatar, status, hire_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [staffId, userId, name, email, role, department, phone || null, avatar || null, status || 'active', hireDate]
      );
      
      await connection.commit();
      
      // Get created staff member
      const [staff] = await dbPool.query(
        'SELECT * FROM staff_members WHERE id = ?',
        [staffId]
      );
      
      res.status(201).json({
        success: true,
        message: 'Staff member created successfully with login credentials',
        data: { 
          staffMember: staff[0],
          loginCredentials: {
            email: email,
            password: password // Return password only on creation
          }
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
    const { name, email, password, role, department, phone, avatar, status, hireDate } = req.body;
    
    // Get staff member to find user_id
    const [staff] = await dbPool.query(
      'SELECT user_id FROM staff_members WHERE id = ?',
      [id]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    const userId = staff[0].user_id;
    
    // Start transaction
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update staff_members table
      const staffUpdates = {};
      if (name !== undefined) staffUpdates.name = name;
      if (email !== undefined) staffUpdates.email = email;
      if (role !== undefined) staffUpdates.role = role;
      if (department !== undefined) staffUpdates.department = department;
      if (phone !== undefined) staffUpdates.phone = phone;
      if (avatar !== undefined) staffUpdates.avatar = avatar;
      if (status !== undefined) staffUpdates.status = status;
      if (hireDate !== undefined) staffUpdates.hire_date = hireDate;
      
      if (Object.keys(staffUpdates).length > 0) {
        const setClause = Object.keys(staffUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(staffUpdates);
        values.push(id);
        
        await connection.query(
          `UPDATE staff_members SET ${setClause} WHERE id = ?`,
          values
        );
      }
      
      // Update users table
      const userUpdates = {};
      if (name !== undefined) userUpdates.name = name;
      if (email !== undefined) userUpdates.email = email;
      if (phone !== undefined) userUpdates.phone = phone;
      if (avatar !== undefined) userUpdates.avatar = avatar;
      
      // Update password if provided
      if (password !== undefined) {
        if (password.length < 6) {
          await connection.rollback();
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
          });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        userUpdates.password = hashedPassword;
      }
      
      if (Object.keys(userUpdates).length > 0) {
        const setClause = Object.keys(userUpdates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(userUpdates);
        values.push(userId);
        
        await connection.query(
          `UPDATE users SET ${setClause} WHERE id = ?`,
          values
        );
      }
      
      await connection.commit();
      
      // Get updated staff member
      const [updatedStaff] = await dbPool.query(
        'SELECT * FROM staff_members WHERE id = ?',
        [id]
      );
      
      res.json({
        success: true,
        message: 'Staff member updated successfully',
        data: { staffMember: updatedStaff[0] }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

// Delete staff member
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get staff member to find user_id
    const [staff] = await dbPool.query(
      'SELECT user_id FROM staff_members WHERE id = ?',
      [id]
    );
    
    if (staff.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    const userId = staff[0].user_id;
    
    // Start transaction
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete staff member
      await connection.query('DELETE FROM staff_members WHERE id = ?', [id]);
      
      // Delete user account if exists
      if (userId) {
        await connection.query('DELETE FROM users WHERE id = ?', [userId]);
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Staff member and associated account deleted successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
});

export default router;

