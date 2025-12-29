import express from 'express';
import { randomUUID } from 'crypto';
import dbPool from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res, next) => {
  try {
    const { type, status, minPrice, maxPrice } = req.query;
    
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rooms] = await dbPool.query(query, params);
    
    // Get amenities and images for each room
    for (const room of rooms) {
      const [amenities] = await dbPool.query(
        'SELECT amenity FROM room_amenities WHERE room_id = ?',
        [room.id]
      );
      room.amenities = amenities.map(a => a.amenity);
      
      const [images] = await dbPool.query(
        'SELECT image_url FROM room_images WHERE room_id = ? ORDER BY display_order',
        [room.id]
      );
      room.images = images.map(img => img.image_url);
    }
    
    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    next(error);
  }
});

// Get room by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [rooms] = await dbPool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [id]
    );
    
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const room = rooms[0];
    
    // Get amenities
    const [amenities] = await dbPool.query(
      'SELECT amenity FROM room_amenities WHERE room_id = ?',
      [id]
    );
    room.amenities = amenities.map(a => a.amenity);
    
    // Get images
    const [images] = await dbPool.query(
      'SELECT image_url FROM room_images WHERE room_id = ? ORDER BY display_order',
      [id]
    );
    room.images = images.map(img => img.image_url);
    
    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    next(error);
  }
});

// Create room (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { name, type, price, capacity, status, description, floor, roomNumber, amenities, images } = req.body;
    
    if (!name || !type || !price || !capacity || !floor || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const roomId = randomUUID();
    
    await dbPool.query(
      `INSERT INTO rooms (id, name, type, price, capacity, status, description, floor, room_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [roomId, name, type, price, capacity, status || 'available', description, floor, roomNumber]
    );
    
    // Insert amenities
    if (amenities && Array.isArray(amenities)) {
      for (const amenity of amenities) {
        const amenityId = randomUUID();
        await dbPool.query(
          'INSERT INTO room_amenities (id, room_id, amenity) VALUES (?, ?, ?)',
          [amenityId, roomId, amenity]
        );
      }
    }
    
    // Insert images
    if (images && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const imageId = randomUUID();
        await dbPool.query(
          'INSERT INTO room_images (id, room_id, image_url, display_order) VALUES (?, ?, ?, ?)',
          [imageId, roomId, images[i], i]
        );
      }
    }
    
    // Get created room
    const [rooms] = await dbPool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    const room = rooms[0];
    
    room.amenities = amenities || [];
    room.images = images || [];
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists'
      });
    }
    next(error);
  }
});

// Update room (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, price, capacity, status, description, floor, roomNumber, amenities, images } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type;
    if (price !== undefined) updates.price = price;
    if (capacity !== undefined) updates.capacity = capacity;
    if (status !== undefined) updates.status = status;
    if (description !== undefined) updates.description = description;
    if (floor !== undefined) updates.floor = floor;
    if (roomNumber !== undefined) updates.room_number = roomNumber;
    
    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      
      await dbPool.query(
        `UPDATE rooms SET ${setClause} WHERE id = ?`,
        values
      );
    }
    
    // Update amenities
    if (amenities !== undefined) {
      await dbPool.query('DELETE FROM room_amenities WHERE room_id = ?', [id]);
      if (Array.isArray(amenities)) {
        for (const amenity of amenities) {
          const amenityId = randomUUID();
          await dbPool.query(
            'INSERT INTO room_amenities (id, room_id, amenity) VALUES (?, ?, ?)',
            [amenityId, id, amenity]
          );
        }
      }
    }
    
    // Update images
    if (images !== undefined) {
      await dbPool.query('DELETE FROM room_images WHERE room_id = ?', [id]);
      if (Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const imageId = randomUUID();
          await dbPool.query(
            'INSERT INTO room_images (id, room_id, image_url, display_order) VALUES (?, ?, ?, ?)',
            [imageId, id, images[i], i]
          );
        }
      }
    }
    
    // Get updated room
    const [rooms] = await dbPool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    const room = rooms[0];
    
    const [amenitiesList] = await dbPool.query(
      'SELECT amenity FROM room_amenities WHERE room_id = ?',
      [id]
    );
    room.amenities = amenitiesList.map(a => a.amenity);
    
    const [imagesList] = await dbPool.query(
      'SELECT image_url FROM room_images WHERE room_id = ? ORDER BY display_order',
      [id]
    );
    room.images = imagesList.map(img => img.image_url);
    
    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    next(error);
  }
});

// Delete room (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await dbPool.query('DELETE FROM rooms WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

