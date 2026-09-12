import { query } from '../config/db.js';

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

export default {
  getRooms,
  getRoomByNumber,
  createRoom,
  updateRoom,
  updateCleanliness,
  deleteRoom,
};
