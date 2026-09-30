import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getRequests = async (req, res, next) => {
  try {
    const { department, status, roomNumber } = req.query;

    let sql = `
      SELECT 
        sr.id,
        sr.room_number AS "roomNumber",
        sr.booking_id AS "bookingId",
        sr.guest_name AS "guestName",
        sr.service_type AS "serviceType",
        sr.details,
        sr.priority,
        sr.status,
        sr.department,
        sr.assigned_to AS "assignedTo",
        sr.charge_amount::FLOAT AS "chargeAmount",
        TO_CHAR(sr.created_at, 'Mon DD, HH12:MI AM') AS "createdAt",
        TO_CHAR(sr.updated_at, 'Mon DD, HH12:MI AM') AS "updatedAt"
      FROM service_requests sr
      WHERE 1=1
    `;
    const params = [];

    if (department && department !== 'All') {
      params.push(department);
      sql += ` AND sr.department ILIKE $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status.toUpperCase());
      sql += ` AND sr.status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND sr.room_number = $${params.length}`;
    }

    sql += ` ORDER BY (sr.status != 'COMPLETED') DESC, sr.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      requests: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const { roomNumber, guestName, serviceType, details, priority = 'NORMAL', department = 'Front Desk', chargeAmount = 0 } = req.body;

    if (!roomNumber || !serviceType) {
      return res.status(400).json({
        success: false,
        message: 'roomNumber and serviceType are required.',
      });
    }

    let finalGuestName = guestName;
    let bookingId = null;

    const activeBooking = await query(
      `SELECT id, guest_name FROM bookings 
       WHERE room_number = $1 AND status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out') 
       LIMIT 1`,
      [roomNumber]
    );

    if (activeBooking.rows.length > 0) {
      bookingId = activeBooking.rows[0].id;
      if (!finalGuestName) finalGuestName = activeBooking.rows[0].guest_name;
    } else if (!finalGuestName) {
      finalGuestName = `Guest in Room ${roomNumber}`;
    }

    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await query(
      `INSERT INTO service_requests (
        id, room_number, booking_id, guest_name, service_type, details, priority, status, department, charge_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'REQUESTED', $8, $9)
      RETURNING 
        id,
        room_number AS "roomNumber",
        booking_id AS "bookingId",
        guest_name AS "guestName",
        service_type AS "serviceType",
        details,
        priority,
        status,
        department,
        assigned_to AS "assignedTo",
        charge_amount::FLOAT AS "chargeAmount",
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "createdAt"`,
      [
        reqId,
        roomNumber,
        bookingId,
        finalGuestName,
        serviceType,
        details || null,
        priority.toUpperCase(),
        department,
        parseFloat(chargeAmount) || 0,
      ]
    );

    // Audit log
    await query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Concierge', $2, 'Service Request')`,
      [
        `Concierge Request: ${serviceType}`,
        `Room ${roomNumber} requested "${serviceType}" dispatched to ${department}.`,
      ]
    );

    emitPmsEvent('PMS_SERVICE_REQUEST_CREATED', result.rows[0]);

    return res.status(201).json({
      success: true,
      message: 'Service request dispatched to department.',
      request: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const valid = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!status || !valid.includes(status.toUpperCase())) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${valid.join(', ')}`,
      });
    }

    const normStatus = status.toUpperCase();

    const existingRes = await client.query('SELECT * FROM service_requests WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }
    const existing = existingRes.rows[0];

    const result = await client.query(
      `UPDATE service_requests 
       SET 
        status = $1,
        assigned_to = COALESCE($2, assigned_to),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING 
        id,
        room_number AS "roomNumber",
        booking_id AS "bookingId",
        guest_name AS "guestName",
        service_type AS "serviceType",
        details,
        priority,
        status,
        department,
        assigned_to AS "assignedTo",
        charge_amount::FLOAT AS "chargeAmount",
        TO_CHAR(updated_at, 'Mon DD, HH12:MI AM') AS "updatedAt"`,
      [normStatus, assignedTo || null, id]
    );

    const updated = result.rows[0];

    // If completed and has charge, add to folio
    if (normStatus === 'COMPLETED' && parseFloat(existing.charge_amount) > 0) {
      const charge = parseFloat(existing.charge_amount);
      const tax = Number((charge * 0.12).toFixed(2));
      const grand = Number((charge + tax).toFixed(2));

      if (existing.booking_id) {
        const folioRes = await client.query(
          `SELECT id FROM folios WHERE booking_id = $1 LIMIT 1`,
          [existing.booking_id]
        );
        if (folioRes.rows.length > 0) {
          const folioId = folioRes.rows[0].id;
          await client.query(
            `INSERT INTO folio_transactions (folio_id, transaction_type, department, description, amount, tax_amount, reference_id)
             VALUES ($1, 'CHARGE', 'SPA', $2, $3, $4, $5)`,
            [folioId, `Concierge Service: ${existing.service_type}`, charge, tax, id]
          );
          await client.query(
            `UPDATE folios SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
            [grand, folioId]
          );
          emitPmsEvent('PMS_FOLIO_UPDATED', { roomNumber: existing.room_number, folioId });
        }
      }
    }

    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Concierge', $2, 'Service Request')`,
      [
        `Service #${id} Status: ${normStatus}`,
        `Request for Room ${existing.room_number} (${existing.service_type}) marked as ${normStatus}.`,
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_SERVICE_REQUEST_UPDATED', updated);

    return res.status(200).json({
      success: true,
      message: `Service request status updated to ${normStatus}.`,
      request: updated,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getRequests,
  createRequest,
  updateRequestStatus,
};
