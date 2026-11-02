import { query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const uploadRoomImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select an image file.',
      });
    }

    const imageUrl = `/uploads/rooms/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Room image uploaded successfully.',
      imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    let sql = `SELECT 
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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl",
        COUNT(*) OVER() AS total_count
      FROM rooms
      ORDER BY room_number ASC`;

    const params = [];
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = limit ? parseInt(limit, 10) : null;

    if (limitNum && limitNum > 0) {
      params.push(limitNum);
      sql += ` LIMIT $${params.length}`;
      params.push((pageNum - 1) * limitNum);
      sql += ` OFFSET $${params.length}`;
    }

    const result = await query(sql, params);
    const total = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0;
    const rooms = result.rows.map(({ total_count, ...r }) => r);

    return res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      page: pageNum,
      limit: limitNum || total,
      totalPages: limitNum ? Math.ceil(total / limitNum) : 1,
      rooms,
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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl"
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
      imageUrl,
      categoryId,
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

    const existing = await query('SELECT room_number FROM rooms WHERE room_number = $1', [roomNumber.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Room ${roomNumber} already exists in inventory.`,
      });
    }

    // Resolve categoryId if not provided
    let finalCategoryId = categoryId ? parseInt(categoryId, 10) : null;
    let finalImageUrl = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : null;

    if (!finalCategoryId) {
      const catLookup = await query(
        'SELECT id FROM room_categories WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [type.trim()]
      );
      if (catLookup.rows.length > 0) {
        finalCategoryId = catLookup.rows[0].id;
      }
    }

    const legacyClean = housekeepingStatus === 'DIRTY' ? 'Dirty' : housekeepingStatus === 'CLEANING' ? 'Cleaning' : housekeepingStatus === 'INSPECTION' ? 'Inspected' : 'Clean';
    const legacyOcc = occupancyStatus === 'OCCUPIED' ? 'Occupied' : 'Available';

    const result = await query(
      `INSERT INTO rooms (
        room_number, type, floor, capacity, rate, features, 
        cleanliness, occupancy, occupancy_status, housekeeping_status, maintenance_status,
        category_id, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl"`,
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
        finalCategoryId,
        finalImageUrl,
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

    emitPmsEvent('PMS_ROOM_CREATED', result.rows[0]);

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
      imageUrl,
      categoryId,
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

    let finalCategoryId = categoryId !== undefined ? (categoryId ? parseInt(categoryId, 10) : null) : null;
    if (type && finalCategoryId === null) {
      const catLookup = await query(
        'SELECT id FROM room_categories WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [type.trim()]
      );
      if (catLookup.rows.length > 0) {
        finalCategoryId = catLookup.rows[0].id;
      }
    }

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
        category_id = COALESCE($12, category_id),
        image_url = COALESCE($13, image_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $14
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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl"`,
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
        finalCategoryId,
        imageUrl,
        roomNumber,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    emitPmsEvent('PMS_ROOM_UPDATED', result.rows[0]);
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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl"`,
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
    emitPmsEvent('PMS_ROOM_UPDATED', result.rows[0]);

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
        guest_id AS "guestId",
        category_id AS "categoryId",
        image_url AS "imageUrl"`,
      [normStatus, reason || null, roomNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Room ${roomNumber} not found.`,
      });
    }

    emitPmsEvent('PMS_ROOM_STATUS_UPDATED', result.rows[0]);
    emitPmsEvent('PMS_ROOM_UPDATED', result.rows[0]);

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

    emitPmsEvent('PMS_ROOM_DELETED', { roomNumber });

    // Audit log
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Admin', $2, 'Inventory')`,
      [
        `Room Deleted: Room ${roomNumber}`,
        `Administrator permanently removed Room ${roomNumber} from property inventory.`,
      ]
    );

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
        COALESCE(r.maintenance_status, 'AVAILABLE') AS "maintenanceStatus",
        r.category_id AS "categoryId",
        r.image_url AS "imageUrl"
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
      AND NOT EXISTS (
        SELECT 1 FROM room_blocks rb
        WHERE rb.room_number = r.room_number
          AND rb.status = 'ACTIVE'
          AND rb.start_date < $2::date
          AND rb.end_date > $1::date
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

    emitPmsEvent('PMS_ROOM_CATEGORY_CREATED', result.rows[0]);

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

    emitPmsEvent('PMS_ROOM_CATEGORY_UPDATED', result.rows[0]);

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

    emitPmsEvent('PMS_ROOM_CATEGORY_DELETED', { id: parseInt(id, 10), name: result.rows[0].name });

    return res.status(200).json({ success: true, message: `Category "${result.rows[0].name}" removed.` });
  } catch (error) {
    next(error);
  }
};

export const getRoomBlocks = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT rb.id, rb.room_number AS "roomNumber", 
              TO_CHAR(rb.start_date, 'YYYY-MM-DD') AS "startDate",
              TO_CHAR(rb.end_date, 'YYYY-MM-DD') AS "endDate",
              rb.reason, rb.status, rb.created_by AS "createdBy", rb.created_at AS "createdAt",
              r.type AS "roomType"
       FROM room_blocks rb
       LEFT JOIN rooms r ON rb.room_number = r.room_number
       ORDER BY rb.start_date DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      roomBlocks: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createRoomBlock = async (req, res, next) => {
  try {
    const { roomNumber, startDate, endDate, reason } = req.body;

    if (!roomNumber || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'roomNumber, startDate, endDate, and reason are required to create a room block.',
      });
    }

    const result = await query(
      `INSERT INTO room_blocks (room_number, start_date, end_date, reason, status, created_by)
       VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
       RETURNING id, room_number AS "roomNumber", 
                 TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
                 TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate",
                 reason, status, created_at AS "createdAt"`,
      [roomNumber, startDate, endDate, reason, req.user?.id || null]
    );

    emitPmsEvent('PMS_ROOM_BLOCKED', result.rows[0]);

    return res.status(201).json({
      success: true,
      message: `Room ${roomNumber} has been blocked from ${startDate} to ${endDate}.`,
      roomBlock: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const releaseRoomBlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE room_blocks 
       SET status = 'RELEASED' 
       WHERE id = $1 
       RETURNING id, room_number AS "roomNumber", status`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room block not found.' });
    }

    emitPmsEvent('PMS_ROOM_BLOCK_RELEASED', result.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Room block #${id} released.`,
      roomBlock: result.rows[0],
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
  updateMaintenanceStatus,
  deleteRoom,
  getRoomCategories,
  createRoomCategory,
  updateRoomCategory,
  deleteRoomCategory,
  getRoomBlocks,
  createRoomBlock,
  releaseRoomBlock,
};

