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
        COALESCE(occupancy_status, CASE WHEN occupancy = 'Occupied' THEN 'OCCUPIED' ELSE 'VACANT' END) AS "occupancyStatus",
        COALESCE(housekeeping_status, CASE 
          WHEN cleanliness ILIKE 'Dirty' THEN 'DIRTY' 
          WHEN cleanliness ILIKE 'Cleaning' THEN 'CLEANING' 
          WHEN cleanliness ILIKE 'Inspected' OR cleanliness ILIKE 'Inspection' THEN 'INSPECTION' 
          ELSE 'CLEAN' 
        END) AS "housekeepingStatus",
        COALESCE(maintenance_status, 'AVAILABLE') AS "maintenanceStatus",
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
        COALESCE(occupancy_status, CASE WHEN occupancy = 'Occupied' THEN 'OCCUPIED' ELSE 'VACANT' END) AS "occupancyStatus",
        COALESCE(housekeeping_status, CASE 
          WHEN cleanliness ILIKE 'Dirty' THEN 'DIRTY' 
          WHEN cleanliness ILIKE 'Cleaning' THEN 'CLEANING' 
          WHEN cleanliness ILIKE 'Inspected' OR cleanliness ILIKE 'Inspection' THEN 'INSPECTION' 
          ELSE 'CLEAN' 
        END) AS "housekeepingStatus",
        COALESCE(maintenance_status, 'AVAILABLE') AS "maintenanceStatus",
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
    const { 
      roomNumber, 
      type, 
      floor, 
      capacity, 
      rate, 
      features, 
      occupancyStatus = 'VACANT', 
      housekeepingStatus = 'CLEAN', 
      maintenanceStatus = 'AVAILABLE' 
    } = req.body;

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

    const legacyClean = housekeepingStatus === 'DIRTY' ? 'Dirty' : housekeepingStatus === 'CLEANING' ? 'Cleaning' : housekeepingStatus === 'INSPECTION' ? 'Inspected' : 'Clean';
    const legacyOcc = occupancyStatus === 'OCCUPIED' ? 'Occupied' : 'Available';

    const result = await query(
      `INSERT INTO rooms (
        room_number, type, floor, capacity, rate, features, 
        cleanliness, occupancy, occupancy_status, housekeeping_status, maintenance_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        occupancy_status AS "occupancyStatus",
        housekeeping_status AS "housekeepingStatus",
        maintenance_status AS "maintenanceStatus",
        guest_id AS "guestId"`,
      [
        roomNumber.trim(),
        type.trim(),
        floor.trim(),
        capacity.trim(),
        parseFloat(rate),
        features || '',
        legacyClean,
        legacyOcc,
        occupancyStatus,
        housekeepingStatus,
        maintenanceStatus,
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
    const { 
      type, 
      floor, 
      capacity, 
      rate, 
      features, 
      occupancyStatus, 
      housekeepingStatus, 
      maintenanceStatus, 
      dirtyReason 
    } = req.body;

    const legacyClean = housekeepingStatus 
      ? (housekeepingStatus === 'DIRTY' ? 'Dirty' : housekeepingStatus === 'CLEANING' ? 'Cleaning' : housekeepingStatus === 'INSPECTION' ? 'Inspected' : 'Clean') 
      : null;
    const legacyOcc = occupancyStatus 
      ? (occupancyStatus === 'OCCUPIED' ? 'Occupied' : 'Available') 
      : null;

    const result = await query(
      `UPDATE rooms 
       SET 
        type = COALESCE($1, type),
        floor = COALESCE($2, floor),
        capacity = COALESCE($3, capacity),
        rate = COALESCE($4, rate),
        features = COALESCE($5, features),
        occupancy_status = COALESCE($6, occupancy_status),
        housekeeping_status = COALESCE($7, housekeeping_status),
        maintenance_status = COALESCE($8, maintenance_status),
        dirty_reason = COALESCE($9, dirty_reason),
        cleanliness = COALESCE($10, cleanliness),
        occupancy = COALESCE($11, occupancy),
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $12
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
        occupancy_status AS "occupancyStatus",
        housekeeping_status AS "housekeepingStatus",
        maintenance_status AS "maintenanceStatus",
        guest_id AS "guestId"`,
      [
        type,
        floor,
        capacity,
        rate !== undefined ? parseFloat(rate) : null,
        features,
        occupancyStatus,
        housekeepingStatus,
        maintenanceStatus,
        dirtyReason,
        legacyClean,
        legacyOcc,
        roomNumber,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    emitPmsEvent('PMS_ROOM_STATUS_UPDATED', result.rows[0]);

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
    let { cleanliness, housekeepingStatus, dirtyReason } = req.body;

    const statusVal = housekeepingStatus || cleanliness;
    if (!statusVal) {
      return res.status(400).json({
        success: false,
        message: 'Housekeeping status is required.',
      });
    }

    const normalizedHk = statusVal.toUpperCase() === 'DIRTY' ? 'DIRTY'
      : statusVal.toUpperCase() === 'CLEANING' ? 'CLEANING'
      : (statusVal.toUpperCase() === 'INSPECTED' || statusVal.toUpperCase() === 'INSPECTION') ? 'INSPECTION'
      : 'CLEAN';

    const legacyClean = normalizedHk === 'DIRTY' ? 'Dirty'
      : normalizedHk === 'CLEANING' ? 'Cleaning'
      : normalizedHk === 'INSPECTION' ? 'Inspected'
      : 'Clean';

    const clearReason = normalizedHk === 'CLEAN' || normalizedHk === 'INSPECTION';

    const result = await query(
      `UPDATE rooms 
       SET 
        housekeeping_status = $1,
        cleanliness = $2,
        dirty_reason = $3,
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $4
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
        occupancy_status AS "occupancyStatus",
        housekeeping_status AS "housekeepingStatus",
        maintenance_status AS "maintenanceStatus",
        guest_id AS "guestId"`,
      [normalizedHk, legacyClean, clearReason ? null : dirtyReason || null, roomNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    // Log event
    const userName = req.user?.name || 'Housekeeping Staff';
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Housekeeping', $2, 'Housekeeping')`,
      [
        `Room ${roomNumber} Marked ${normalizedHk}`,
        `${userName} updated Room ${roomNumber} housekeeping status to ${normalizedHk}.`,
      ]
    );

    // Broadcast real-time room cleanliness update to all terminals
    emitPmsEvent('PMS_ROOM_CLEANLINESS_UPDATED', result.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} housekeeping status updated to ${normalizedHk}.`,
      room: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;
    const { maintenanceStatus, status, reason, defectNote } = req.body;
    const statusVal = maintenanceStatus || status;

    const valid = ['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'];
    if (!statusVal || !valid.includes(statusVal.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid maintenance status. Must be one of: ${valid.join(', ')}`,
      });
    }

    const normStatus = statusVal.toUpperCase();

    const result = await query(
      `UPDATE rooms 
       SET 
        maintenance_status = $1,
        dirty_reason = CASE WHEN $1 != 'AVAILABLE' THEN COALESCE($2, dirty_reason) ELSE dirty_reason END,
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
        occupancy_status AS "occupancyStatus",
        housekeeping_status AS "housekeepingStatus",
        maintenance_status AS "maintenanceStatus",
        guest_id AS "guestId"`,
      [normStatus, reason || null, roomNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    emitPmsEvent('PMS_ROOM_STATUS_UPDATED', result.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} maintenance status updated to ${normStatus}.`,
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
        r.occupancy,
        COALESCE(r.occupancy_status, 'VACANT') AS "occupancyStatus",
        COALESCE(r.housekeeping_status, 'CLEAN') AS "housekeepingStatus",
        COALESCE(r.maintenance_status, 'AVAILABLE') AS "maintenanceStatus"
      FROM rooms r
      WHERE COALESCE(r.maintenance_status, 'AVAILABLE') = 'AVAILABLE'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_number = r.room_number
          AND b.status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out')
          AND b.check_in < $2::date
          AND b.check_out > $1::date
      )
      AND NOT EXISTS (
        SELECT 1 FROM maintenance_tickets m
        WHERE m.room_number = r.room_number
          AND m.status IN ('REPORTED', 'IN_PROGRESS')
          AND m.inventory_impact IN ('OUT_OF_ORDER', 'OUT_OF_SERVICE')
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

// ROOM CATEGORIES
export const getRoomCategories = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        id, 
        name, 
        base_rate::FLOAT AS "baseRate", 
        capacity, 
        description, 
        features, 
        image_url AS "imageUrl"
      FROM room_categories 
      ORDER BY base_rate ASC`
    );
    return res.status(200).json({
      success: true,
      count: result.rowCount,
      categories: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoomCategory = async (req, res, next) => {
  try {
    const { name, baseRate, capacity, description, features, imageUrl } = req.body;
    if (!name || baseRate === undefined || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Name, baseRate, and capacity are required for a room category.',
      });
    }

    const result = await query(
      `INSERT INTO room_categories (name, base_rate, capacity, description, features, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, base_rate::FLOAT AS "baseRate", capacity, description, features, image_url AS "imageUrl"`,
      [name.trim(), parseFloat(baseRate), capacity.trim(), description || '', features || '', imageUrl || '']
    );

    return res.status(201).json({
      success: true,
      message: `Room category "${name}" created.`,
      category: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoomCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, baseRate, capacity, description, features, imageUrl } = req.body;

    const result = await query(
      `UPDATE room_categories 
       SET 
        name = COALESCE($1, name),
        base_rate = COALESCE($2, base_rate),
        capacity = COALESCE($3, capacity),
        description = COALESCE($4, description),
        features = COALESCE($5, features),
        image_url = COALESCE($6, image_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, base_rate::FLOAT AS "baseRate", capacity, description, features, image_url AS "imageUrl"`,
      [name, baseRate !== undefined ? parseFloat(baseRate) : null, capacity, description, features, imageUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Room category updated.',
      category: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM room_categories WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room category not found.' });
    }
    return res.status(200).json({ success: true, message: `Category "${result.rows[0].name}" removed.` });
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
  updateMaintenanceStatus,
  deleteRoom,
  getRoomCategories,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
};

