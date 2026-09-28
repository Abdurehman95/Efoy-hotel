import { query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getRooms = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        room_number AS "roomNumber",
        type,
        floor,
        capacity,
        rate::FLOAT AS rate,
        features,
        cleanliness,
        dirty_reason AS "dirtyReason",
        occupancy,
        guest_id AS "guestId"
      FROM rooms
      ORDER BY room_number ASC`
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      rooms: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomByNumber = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const result = await query(
      `SELECT 
        room_number AS "roomNumber",
        type,
        floor,
        capacity,
        rate::FLOAT AS rate,
        features,
        cleanliness,
        dirty_reason AS "dirtyReason",
        occupancy,
        guest_id AS "guestId"
      FROM rooms
      WHERE room_number = $1`,
      [roomNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      room: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, floor, capacity, rate, features, cleanliness, occupancy } = req.body;

    if (!roomNumber || !type || !floor || !capacity || rate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required room fields (roomNumber, type, floor, capacity, rate).',
      });
    }

    const existing = await query('SELECT room_number FROM rooms WHERE room_number = $1', [roomNumber]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Room ${roomNumber} already exists in inventory.`,
      });
    }

    const result = await query(
      `INSERT INTO rooms (room_number, type, floor, capacity, rate, features, cleanliness, occupancy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING 
        room_number AS "roomNumber",
        type,
        floor,
        capacity,
        rate::FLOAT AS rate,
        features,
        cleanliness,
        dirty_reason AS "dirtyReason",
        occupancy,
        guest_id AS "guestId"`,
      [
        roomNumber.trim(),
        type.trim(),
        floor.trim(),
        capacity.trim(),
        parseFloat(rate),
        features || '',
        cleanliness || 'Clean',
        occupancy || 'Available',
      ]
    );

    // Audit log
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Inventory')`,
      [
        `New Room Created: Room ${roomNumber}`,
        `Administrator added Room ${roomNumber} (${type}) with tariff $${rate}/night.`,
      ]
    );

    return res.status(201).json({
      success: true,
      message: `Room ${roomNumber} created successfully.`,
      room: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const { type, floor, capacity, rate, features, cleanliness, occupancy, dirtyReason } = req.body;

    const result = await query(
      `UPDATE rooms 
       SET 
        type = COALESCE($1, type),
        floor = COALESCE($2, floor),
        capacity = COALESCE($3, capacity),
        rate = COALESCE($4, rate),
        features = COALESCE($5, features),
        cleanliness = COALESCE($6, cleanliness),
        occupancy = COALESCE($7, occupancy),
        dirty_reason = COALESCE($8, dirty_reason),
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $9
       RETURNING 
        room_number AS "roomNumber",
        type,
        floor,
        capacity,
        rate::FLOAT AS rate,
        features,
        cleanliness,
        dirty_reason AS "dirtyReason",
        occupancy,
        guest_id AS "guestId"`,
      [
        type,
        floor,
        capacity,
        rate !== undefined ? parseFloat(rate) : null,
        features,
        cleanliness,
        occupancy,
        dirtyReason,
        roomNumber,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} updated successfully.`,
      room: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateCleanliness = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const { cleanliness, dirtyReason } = req.body;

    if (!cleanliness) {
      return res.status(400).json({
        success: false,
        message: 'Cleanliness status is required.',
      });
    }

    const clearReason = cleanliness === 'Clean' || cleanliness === 'Inspected';

    const result = await query(
      `UPDATE rooms 
       SET 
        cleanliness = $1,
        dirty_reason = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $3
       RETURNING 
        room_number AS "roomNumber",
        type,
        floor,
        capacity,
        rate::FLOAT AS rate,
        features,
        cleanliness,
        dirty_reason AS "dirtyReason",
        occupancy,
        guest_id AS "guestId"`,
      [cleanliness, clearReason ? null : dirtyReason || null, roomNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    // Log event
    const userName = req.user?.name || 'Staff';
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Housekeeping', $2, 'Housekeeping')`,
      [
        `Room ${roomNumber} Marked ${cleanliness}`,
        `${userName} updated Room ${roomNumber} cleanliness to ${cleanliness}.`,
      ]
    );

    // Broadcast real-time room cleanliness update to all terminals (Reception, HK, Admin)
    emitPmsEvent('PMS_ROOM_CLEANLINESS_UPDATED', result.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} cleanliness updated to ${cleanliness}.`,
      room: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const result = await query('DELETE FROM rooms WHERE room_number = $1 RETURNING room_number', [roomNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} removed from inventory.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, category, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Both checkIn and checkOut dates (YYYY-MM-DD) are required to query room availability.',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range. checkOut must be strictly after checkIn.',
      });
    }

    let sql = `
      SELECT 
        r.room_number AS "roomNumber",
        r.type,
        r.floor,
        r.capacity,
        r.rate::FLOAT AS rate,
        r.features,
        r.cleanliness,
        r.dirty_reason AS "dirtyReason",
        r.occupancy
      FROM rooms r
      WHERE r.occupancy != 'Out of Order'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_number = r.room_number
          AND b.status NOT IN ('Cancelled', 'Checked Out')
          AND b.check_in < $2::date
          AND b.check_out > $1::date
      )
      AND NOT EXISTS (
        SELECT 1 FROM maintenance_tickets m
        WHERE m.room_number = r.room_number
          AND m.status IN ('REPORTED', 'IN_PROGRESS')
          AND m.inventory_impact = 'OUT_OF_ORDER'
          AND m.start_date < $2::date
          AND COALESCE(m.end_date, CURRENT_DATE + INTERVAL '30 days') > $1::date
      )
    `;

    const params = [checkIn, checkOut];

    if (category && category !== 'All' && category !== 'All Suites') {
      params.push(`%${category}%`);
      sql += ` AND r.type ILIKE $${params.length}`;
    }

    if (guests) {
      params.push(`%${guests}%`);
      sql += ` AND r.capacity ILIKE $${params.length}`;
    }

    sql += ` ORDER BY r.rate ASC, r.room_number ASC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      checkIn,
      checkOut,
      count: result.rowCount,
      rooms: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getRooms,
  getAvailableRooms,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateCleanliness,
  deleteRoom,
};
