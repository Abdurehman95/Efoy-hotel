import { pool, query } from '../config/db.js';

export const getHistory = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        id,
        room_number AS "roomNumber",
        type,
        cleaner_name AS "cleanerName",
        action,
        TO_CHAR(completed_at, 'Mon DD, HH12:MI AM') AS "completedAt",
        duration,
        inspected_by AS "inspectedBy",
        status
      FROM housekeeping_history
      ORDER BY completed_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      history: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const certifyClean = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { roomNumber, cleanerName, duration, inspectedBy, action } = req.body;

    if (!roomNumber) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'roomNumber is required.',
      });
    }

    const roomRes = await client.query('SELECT * FROM rooms WHERE room_number = $1', [roomNumber]);
    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Room ${roomNumber} not found.` });
    }
    const room = roomRes.rows[0];

    // Mark room Clean and remove dirtyReason
    const updatedRoom = await client.query(
      `UPDATE rooms 
       SET cleanliness = 'Clean', dirty_reason = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE room_number = $1
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
      [roomNumber]
    );

    // Insert history record
    const randomNum = Math.floor(100 + Math.random() * 900);
    const historyId = `HK-${randomNum}`;
    const attendant = cleanerName || req.user?.name || 'Maria Santos';

    const historyRes = await client.query(
      `INSERT INTO housekeeping_history (
        id, room_number, type, cleaner_name, action, completed_at, duration, inspected_by, status
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, 'Passed Inspection')
      RETURNING 
        id,
        room_number AS "roomNumber",
        type,
        cleaner_name AS "cleanerName",
        action,
        TO_CHAR(completed_at, 'Mon DD, HH12:MI AM') AS "completedAt",
        duration,
        inspected_by AS "inspectedBy",
        status`,
      [
        historyId,
        roomNumber,
        room.type,
        attendant,
        action || 'Turnover & Sanitization Certified',
        duration || '20 mins',
        inspectedBy || 'Elena Vance (Lead HK)',
      ]
    );

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Housekeeping', $2, 'Housekeeping')`,
      [
        `Room ${roomNumber} Cleaned & Inspected`,
        `${attendant} certified Room ${roomNumber} turnover. Ready for Front Desk guest check-in.`,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} certified clean and ready for guest occupancy.`,
      room: updatedRoom.rows[0],
      history: historyRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getHistory,
  certifyClean,
};
