import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, roomNumber } = req.query;

    let sql = `
      SELECT 
        ht.id,
        ht.room_number AS "roomNumber",
        ht.priority,
        ht.assigned_to AS "assignedTo",
        ht.status,
        TO_CHAR(ht.start_time, 'Mon DD, HH12:MI AM') AS "startTime",
        TO_CHAR(ht.completion_time, 'Mon DD, HH12:MI AM') AS "completionTime",
        ht.notes,
        TO_CHAR(ht.created_at, 'Mon DD, HH12:MI AM') AS "createdAt",
        r.type AS "roomType",
        r.floor,
        r.occupancy_status AS "occupancyStatus",
        r.maintenance_status AS "maintenanceStatus"
      FROM housekeeping_tasks ht
      LEFT JOIN rooms r ON ht.room_number = r.room_number
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status.toUpperCase());
      sql += ` AND ht.status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND ht.room_number = $${params.length}`;
    }

    sql += ` ORDER BY (ht.status != 'CLEAN') DESC, ht.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      tasks: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { roomNumber, priority = 'NORMAL', assignedTo, notes } = req.body;

    if (!roomNumber) {
      return res.status(400).json({ success: false, message: 'roomNumber is required.' });
    }

    const taskId = `HKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO housekeeping_tasks (id, room_number, priority, assigned_to, status, notes)
       VALUES ($1, $2, $3, $4, 'DIRTY', $5)
       RETURNING 
        id,
        room_number AS "roomNumber",
        priority,
        assigned_to AS "assignedTo",
        status,
        notes,
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "createdAt"`,
      [taskId, roomNumber, priority.toUpperCase(), assignedTo || null, notes || 'Turnover task']
    );

    // Ensure room is marked dirty
    await query(
      `UPDATE rooms 
       SET 
        housekeeping_status = 'DIRTY', 
        cleanliness = 'Dirty',
        dirty_reason = COALESCE($1, dirty_reason) 
       WHERE room_number = $2`,
      [notes, roomNumber]
    );

    emitPmsEvent('PMS_HK_TASK_CREATED', result.rows[0]);

    return res.status(201).json({
      success: true,
      message: `Housekeeping task created for Room ${roomNumber}.`,
      task: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    const valid = ['DIRTY', 'CLEANING', 'INSPECTION', 'CLEAN'];
    if (!status || !valid.includes(status.toUpperCase())) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${valid.join(', ')}`,
      });
    }

    const normStatus = status.toUpperCase();
    const attendant = assignedTo || req.user?.name || 'Housekeeping Staff';

    const existingRes = await client.query('SELECT * FROM housekeeping_tasks WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Housekeeping task not found.' });
    }
    const task = existingRes.rows[0];

    // Determine start/completion timestamps
    let startSql = 'start_time';
    let endSql = 'completion_time';

    if (normStatus === 'CLEANING' && !task.start_time) {
      startSql = 'CURRENT_TIMESTAMP';
    }
    if (normStatus === 'CLEAN') {
      endSql = 'CURRENT_TIMESTAMP';
    }

    const taskUpdate = await client.query(
      `UPDATE housekeeping_tasks 
       SET 
        status = $1,
        assigned_to = COALESCE($2, assigned_to),
        notes = COALESCE($3, notes),
        start_time = ${startSql},
        completion_time = ${endSql},
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING 
        id,
        room_number AS "roomNumber",
        priority,
        assigned_to AS "assignedTo",
        status,
        TO_CHAR(start_time, 'Mon DD, HH12:MI AM') AS "startTime",
        TO_CHAR(completion_time, 'Mon DD, HH12:MI AM') AS "completionTime",
        notes`,
      [normStatus, assignedTo || null, notes || null, id]
    );

    // Sync room housekeeping status
    const legacyClean = normStatus === 'DIRTY' ? 'Dirty'
      : normStatus === 'CLEANING' ? 'Cleaning'
      : normStatus === 'INSPECTION' ? 'Inspected'
      : 'Clean';

    const roomUpdate = await client.query(
      `UPDATE rooms 
       SET 
        housekeeping_status = $1::varchar,
        cleanliness = $2,
        dirty_reason = CASE WHEN $1::text = 'CLEAN' THEN NULL ELSE dirty_reason END,
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
        maintenance_status AS "maintenanceStatus"`,
      [normStatus, legacyClean, task.room_number]
    );

    // If marked CLEAN, add to audit history
    if (normStatus === 'CLEAN') {
      const histId = `HK-${Math.floor(100 + Math.random() * 900)}`;
      await client.query(
        `INSERT INTO housekeeping_history (id, room_number, type, cleaner_name, action, duration, inspected_by, status)
         VALUES ($1, $2, $3, $4, 'Turnover Completed: Certified Clean', '20 mins', 'Lead Housekeeper', 'Passed Inspection')`,
        [histId, task.room_number, roomUpdate.rows[0]?.type || 'Suite', attendant]
      );
    }

    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Housekeeping', $2, 'Housekeeping')`,
      [
        `Room ${task.room_number} Housekeeping: ${normStatus}`,
        `Task #${id} moved to ${normStatus} by ${attendant}.`,
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_HK_TASK_UPDATED', taskUpdate.rows[0]);
    emitPmsEvent('PMS_ROOM_CLEANLINESS_UPDATED', roomUpdate.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Task #${id} status updated to ${normStatus}.`,
      task: taskUpdate.rows[0],
      room: roomUpdate.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

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

    // Mark room Clean
    const updatedRoom = await client.query(
      `UPDATE rooms 
       SET 
        housekeeping_status = 'CLEAN',
        cleanliness = 'Clean', 
        dirty_reason = NULL, 
        updated_at = CURRENT_TIMESTAMP 
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
        occupancy_status AS "occupancyStatus",
        housekeeping_status AS "housekeepingStatus",
        maintenance_status AS "maintenanceStatus",
        guest_id AS "guestId"`,
      [roomNumber]
    );

    // Complete any active tasks for this room
    await client.query(
      `UPDATE housekeeping_tasks 
       SET status = 'CLEAN', completion_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE room_number = $1 AND status != 'CLEAN'`,
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

    emitPmsEvent('PMS_ROOM_CLEANLINESS_UPDATED', updatedRoom.rows[0]);

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
  getTasks,
  createTask,
  updateTaskStatus,
  getHistory,
  certifyClean,
};
