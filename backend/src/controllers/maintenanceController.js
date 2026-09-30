import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getTickets = async (req, res, next) => {
  try {
    const { status, roomNumber } = req.query;

    let sql = `
      SELECT 
        m.id,
        m.room_number AS "roomNumber",
        m.severity,
        m.status,
        m.inventory_impact AS "inventoryImpact",
        m.issue_description AS "issueDescription",
        m.resolution_notes AS "resolutionNotes",
        m.reported_by AS "reportedBy",
        m.assigned_to AS "assignedTo",
        TO_CHAR(m.start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(m.end_date, 'YYYY-MM-DD') AS "endDate",
        m.estimated_cost::FLOAT AS "estimatedCost",
        m.actual_cost::FLOAT AS "actualCost",
        TO_CHAR(m.created_at, 'Mon DD, HH12:MI AM') AS "createdAt",
        r.type AS "roomType",
        r.floor
      FROM maintenance_tickets m
      LEFT JOIN rooms r ON m.room_number = r.room_number
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status.toUpperCase());
      sql += ` AND m.status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND m.room_number = $${params.length}`;
    }

    sql += ` ORDER BY (m.status IN ('REPORTED', 'IN_PROGRESS')) DESC, m.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      tickets: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      roomNumber,
      issueDescription,
      severity = 'MEDIUM',
      reportedBy,
      assignedTo,
      inventoryImpact = 'OUT_OF_SERVICE',
    } = req.body;

    if (!roomNumber || !issueDescription) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'roomNumber and issueDescription are required.',
      });
    }

    const ticketId = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
    const reporter = reportedBy || req.user?.name || 'Staff Attendant';

    const ticketRes = await client.query(
      `INSERT INTO maintenance_tickets (
        id, room_number, severity, status, inventory_impact, issue_description, reported_by, assigned_to
      ) VALUES ($1, $2, $3, 'REPORTED', $4, $5, $6, $7)
      RETURNING *`,
      [
        ticketId,
        roomNumber,
        severity.toUpperCase(),
        inventoryImpact.toUpperCase(),
        issueDescription,
        reporter,
        assignedTo || null,
      ]
    );

    // Update Room Maintenance Status to OUT_OF_SERVICE or MAINTENANCE (blocking new check-ins)
    const newMaintStatus = inventoryImpact === 'OUT_OF_SERVICE' ? 'OUT_OF_SERVICE' : 'MAINTENANCE';
    const roomRes = await client.query(
      `UPDATE rooms 
       SET 
        maintenance_status = $1, 
        dirty_reason = COALESCE(dirty_reason, $2),
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $3
       RETURNING *`,
      [newMaintStatus, `Maintenance: ${issueDescription}`, roomNumber]
    );

    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Maintenance', $2, 'Maintenance')`,
      [
        `Room ${roomNumber} Flagged Out of Service`,
        `Maintenance ticket #${ticketId} created (${issueDescription}). Room marked ${newMaintStatus} and blocked from check-ins.`,
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_MAINTENANCE_CREATED', ticketRes.rows[0]);
    emitPmsEvent('PMS_ROOM_STATUS_UPDATED', roomRes.rows[0]);

    return res.status(201).json({
      success: true,
      message: `Room ${roomNumber} maintenance ticket created. Room placed ${newMaintStatus}.`,
      ticket: ticketRes.rows[0],
      room: roomRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const updateTicket = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, resolutionNotes, assignedTo, actualCost } = req.body;

    const existingRes = await client.query('SELECT * FROM maintenance_tickets WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found.' });
    }
    const ticket = existingRes.rows[0];

    const normStatus = status ? status.toUpperCase() : ticket.status;

    let endSql = 'end_date';
    if (normStatus === 'RESOLVED') {
      endSql = 'CURRENT_DATE';
    }

    const updatedTicket = await client.query(
      `UPDATE maintenance_tickets 
       SET 
        status = $1,
        resolution_notes = COALESCE($2, resolution_notes),
        assigned_to = COALESCE($3, assigned_to),
        actual_cost = COALESCE($4, actual_cost),
        end_date = ${endSql},
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [normStatus, resolutionNotes || null, assignedTo || null, actualCost !== undefined ? parseFloat(actualCost) : null, id]
    );

    // If RESOLVED, check if other active maintenance tickets exist for this room
    let updatedRoom = null;
    if (normStatus === 'RESOLVED') {
      const otherTickets = await client.query(
        `SELECT id FROM maintenance_tickets 
         WHERE room_number = $1 AND id != $2 AND status IN ('REPORTED', 'IN_PROGRESS')`,
        [ticket.room_number, id]
      );

      if (otherTickets.rows.length === 0) {
        // Room returns to AVAILABLE
        const roomRes = await client.query(
          `UPDATE rooms 
           SET 
            maintenance_status = 'AVAILABLE',
            updated_at = CURRENT_TIMESTAMP
           WHERE room_number = $1
           RETURNING *`,
          [ticket.room_number]
        );
        updatedRoom = roomRes.rows[0];
      }
    }

    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Maintenance', $2, 'Maintenance')`,
      [
        `Ticket #${id} Resolved: Room ${ticket.room_number}`,
        `Maintenance issue marked ${normStatus}. Notes: ${resolutionNotes || 'Repairs completed successfully'}.`,
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_MAINTENANCE_UPDATED', updatedTicket.rows[0]);
    if (updatedRoom) {
      emitPmsEvent('PMS_ROOM_STATUS_UPDATED', updatedRoom);
    }

    return res.status(200).json({
      success: true,
      message: `Maintenance ticket #${id} updated to ${normStatus}.`,
      ticket: updatedTicket.rows[0],
      room: updatedRoom,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getTickets,
  createTicket,
  updateTicket,
};
