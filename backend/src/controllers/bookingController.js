import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getBookings = async (req, res, next) => {
  try {
    const { status, search, roomNumber } = req.query;

    let sql = `
      SELECT 
        b.id,
        b.guest_name AS "guestName",
        b.email,
        b.phone,
        b.room_number AS "roomNumber",
        b.room_type AS "roomType",
        TO_CHAR(b.check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(b.check_out, 'YYYY-MM-DD') AS "checkOut",
        b.nights,
        b.room_rate::FLOAT AS "roomRate",
        b.status,
        b.notes,
        b.paid,
        b.payment_method AS "paymentMethod",
        b.created_at AS "createdAt",
        s.id AS "stayId",
        s.digital_key_code AS "digitalKeyCode"
      FROM bookings b
      LEFT JOIN stays s ON b.id = s.booking_id AND s.status = 'ACTIVE'
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND b.room_number = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (b.guest_name ILIKE $${params.length} OR b.id ILIKE $${params.length} OR b.email ILIKE $${params.length})`;
    }

    sql += ` ORDER BY b.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        b.id,
        b.guest_name AS "guestName",
        b.email,
        b.phone,
        b.room_number AS "roomNumber",
        b.room_type AS "roomType",
        TO_CHAR(b.check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(b.check_out, 'YYYY-MM-DD') AS "checkOut",
        b.nights,
        b.room_rate::FLOAT AS "roomRate",
        b.status,
        b.notes,
        b.paid,
        b.payment_method AS "paymentMethod",
        b.created_at AS "createdAt",
        s.id AS "stayId",
        s.digital_key_code AS "digitalKeyCode"
      FROM bookings b
      LEFT JOIN stays s ON b.id = s.booking_id AND s.status = 'ACTIVE'
      WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      guestName,
      email,
      phone,
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      roomRate,
      status,
      notes,
      paid,
      paymentMethod,
    } = req.body;

    if (!guestName || !email || !phone || !roomType || !checkIn || !checkOut || !roomRate) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing required reservation fields (guestName, email, phone, roomType, checkIn, checkOut, roomRate).',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid date range: checkOut must be strictly after checkIn.',
      });
    }

    // Double-Booking Collision Prevention (Date-Range Overlap Check against non-cancelled/checked-out bookings)
    if (roomNumber) {
      const collisionCheck = await client.query(
        `SELECT id, guest_name, TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn", TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut"
         FROM bookings 
         WHERE room_number = $1
           AND status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out')
           AND check_in < $3::date
           AND check_out > $2::date
         LIMIT 1`,
        [roomNumber, checkIn, checkOut]
      );

      if (collisionCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        const c = collisionCheck.rows[0];
        return res.status(409).json({
          success: false,
          isCollision: true,
          message: `Room ${roomNumber} is already reserved from ${c.checkIn} to ${c.checkOut} by ${c.guest_name}. Date conflict prevented by PMS.`,
        });
      }

      // Check Maintenance Out-of-Order collision
      const maintenanceCheck = await client.query(
        `SELECT id, issue_description 
         FROM maintenance_tickets 
         WHERE room_number = $1 
           AND status IN ('REPORTED', 'IN_PROGRESS')
           AND inventory_impact IN ('OUT_OF_ORDER', 'OUT_OF_SERVICE')
           AND start_date < $3::date
           AND COALESCE(end_date, CURRENT_DATE + INTERVAL '30 days') > $2::date
         LIMIT 1`,
        [roomNumber, checkIn, checkOut]
      );

      if (maintenanceCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          isMaintenanceBlocked: true,
          message: `Room ${roomNumber} is currently designated Out-of-Order for maintenance (${maintenanceCheck.rows[0].issue_description}). Cannot assign arriving guest.`,
        });
      }
    }

    // Generate Booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = req.body.id || `BK-${randomSuffix}`;
    const bookingStatus = status || 'CONFIRMED';
    const computedNights = nights || Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));

    const bookingRes = await client.query(
      `INSERT INTO bookings (
        id, guest_name, email, phone, room_number, room_type, 
        check_in, check_out, nights, room_rate, status, notes, paid, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING 
        id,
        guest_name AS "guestName",
        email,
        phone,
        room_number AS "roomNumber",
        room_type AS "roomType",
        TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        notes,
        paid,
        payment_method AS "paymentMethod"`,
      [
        bookingId,
        guestName.trim(),
        email.trim(),
        phone.trim(),
        roomNumber || null,
        roomType.trim(),
        checkIn,
        checkOut,
        parseInt(computedNights, 10),
        parseFloat(roomRate),
        bookingStatus,
        notes || null,
        paid === true,
        paymentMethod || null,
      ]
    );

    // Initialize Immutable Financial Folio
    const folioId = `FOL-${bookingId.replace(/[^a-zA-Z0-9]/g, '')}`;
    const totalRoomCost = parseFloat(roomRate) * parseInt(computedNights, 10);
    const taxAmount = Number((totalRoomCost * 0.12).toFixed(2));
    const grandInitial = Number((totalRoomCost + taxAmount).toFixed(2));

    await client.query(
      `INSERT INTO folios (id, booking_id, room_number, folio_type, status, balance)
       VALUES ($1, $2, $3, 'GUEST', $4, $5)
       ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance`,
      [folioId, bookingId, roomNumber || null, paid ? 'SETTLED' : 'OPEN', paid ? 0 : grandInitial]
    );

    // Record Immutable Room Charge Transaction
    await client.query(
      `INSERT INTO folio_transactions (folio_id, transaction_type, department, description, amount, tax_amount)
       VALUES ($1, 'CHARGE', 'ROOM', $2, $3, $4)`,
      [
        folioId,
        `Room Accommodation (${computedNights} night${computedNights > 1 ? 's' : ''} @ $${parseFloat(roomRate).toFixed(2)}/nt)`,
        totalRoomCost,
        taxAmount,
      ]
    );

    if (paid === true) {
      await client.query(
        `INSERT INTO folio_transactions (folio_id, transaction_type, department, description, amount, tax_amount)
         VALUES ($1, 'PAYMENT', 'PAYMENT', $2, $3, 0)`,
        [folioId, `Advance Payment Received (${paymentMethod || 'Credit Card On File'})`, -grandInitial]
      );
    }

    // If walk-in or checked in immediately
    let stayRecord = null;
    if (bookingStatus === 'CHECKED_IN' || bookingStatus === 'In-House') {
      const stayId = `STAY-${bookingId}`;
      const digitalKey = `AURA-${roomNumber || 'PENDING'}-${Math.floor(100 + Math.random() * 900)}`;
      const stayRes = await client.query(
        `INSERT INTO stays (id, booking_id, room_number, guest_name, status, digital_key_code)
         VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
         ON CONFLICT (id) DO UPDATE SET status = 'ACTIVE'
         RETURNING *`,
        [stayId, bookingId, roomNumber || null, guestName.trim(), digitalKey]
      );
      stayRecord = stayRes.rows[0];

      if (roomNumber) {
        await client.query(
          `UPDATE rooms 
           SET 
            occupancy = 'Occupied', 
            occupancy_status = 'OCCUPIED', 
            guest_id = $1 
           WHERE room_number = $2`,
          [bookingId, roomNumber]
        );
      }
    } else if (roomNumber) {
      // Just reserved
      await client.query(
        `UPDATE rooms SET occupancy = 'Reserved', guest_id = $1 WHERE room_number = $2`,
        [bookingId, roomNumber]
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Reservation')`,
      [
        `New Reservation: ${bookingId}`,
        `Booked for ${guestName} (${roomType}${roomNumber ? ` - Room ${roomNumber}` : ''}). Check-in: ${checkIn}. Folio #${folioId} created.`,
      ]
    );

    await client.query('COMMIT');

    const resultBooking = {
      ...bookingRes.rows[0],
      stayId: stayRecord?.id || null,
      digitalKeyCode: stayRecord?.digital_key_code || null,
    };

    // Broadcast new booking to Front Desk and Admin
    emitPmsEvent('PMS_BOOKING_CREATED', resultBooking);

    return res.status(201).json({
      success: true,
      message: 'Reservation and financial folio created successfully.',
      booking: resultBooking,
      folioId,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const updateBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { guestName, email, phone, roomNumber, checkIn, checkOut, nights, roomRate, status, notes } = req.body;

    const existingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const existing = existingRes.rows[0];

    const targetRoomNumber = roomNumber !== undefined ? roomNumber : existing.room_number;
    const targetCheckIn = checkIn || existing.check_in;
    const targetCheckOut = checkOut || existing.check_out;

    // If dates or room changed, check collisions
    if (targetRoomNumber && (checkIn || checkOut || roomNumber)) {
      const collisionCheck = await client.query(
        `SELECT id, guest_name, TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn", TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut"
         FROM bookings 
         WHERE room_number = $1
           AND id != $2
           AND status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out')
           AND check_in < $4::date
           AND check_out > $3::date
         LIMIT 1`,
        [targetRoomNumber, id, targetCheckIn, targetCheckOut]
      );

      if (collisionCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          isCollision: true,
          message: `Room ${targetRoomNumber} is already reserved for these dates by ${collisionCheck.rows[0].guest_name}.`,
        });
      }
    }

    const updatedRes = await client.query(
      `UPDATE bookings 
       SET 
        guest_name = COALESCE($1, guest_name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        room_number = COALESCE($4, room_number),
        check_in = COALESCE($5, check_in),
        check_out = COALESCE($6, check_out),
        nights = COALESCE($7, nights),
        room_rate = COALESCE($8, room_rate),
        status = COALESCE($9, status),
        notes = COALESCE($10, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING 
        id,
        guest_name AS "guestName",
        email,
        phone,
        room_number AS "roomNumber",
        room_type AS "roomType",
        TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        notes,
        paid,
        payment_method AS "paymentMethod"`,
      [
        guestName,
        email,
        phone,
        roomNumber,
        checkIn,
        checkOut,
        nights ? parseInt(nights, 10) : null,
        roomRate !== undefined ? parseFloat(roomRate) : null,
        status,
        notes,
        id,
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_BOOKING_UPDATED', updatedRes.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Reservation ${id} updated successfully.`,
      booking: updatedRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const checkInGuest = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { roomNumber, forceOverride } = req.body;

    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const booking = bookingRes.rows[0];

    const targetRoomNumber = roomNumber || booking.room_number;
    if (!targetRoomNumber) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'A target room number must be assigned to complete check-in.',
      });
    }

    const roomRes = await client.query('SELECT * FROM rooms WHERE room_number = $1', [targetRoomNumber]);
    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Room ${targetRoomNumber} does not exist.` });
    }
    const room = roomRes.rows[0];

    // Verification 1: Maintenance Status must be AVAILABLE
    const maintStatus = room.maintenance_status || 'AVAILABLE';
    if (maintStatus !== 'AVAILABLE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        isMaintenance: true,
        message: `Cannot check in to Room ${targetRoomNumber}: Room is currently marked ${maintStatus}.`,
      });
    }

    // Verification 2: Housekeeping Status must be CLEAN
    const hkStatus = room.housekeeping_status || (room.cleanliness === 'Dirty' ? 'DIRTY' : 'CLEAN');
    if (hkStatus !== 'CLEAN' && forceOverride !== true) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        warning: true,
        isDirty: true,
        room,
        message: `Room ${targetRoomNumber} is marked ${hkStatus} (${room.dirty_reason || 'Turnover required'}). Guests must only be checked into a CLEAN room.`,
      });
    }

    // Release old room if booking had a different one assigned
    if (booking.room_number && booking.room_number !== targetRoomNumber) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Available', occupancy_status = 'VACANT', guest_id = NULL WHERE room_number = $1`,
        [booking.room_number]
      );
    }

    // Set Room to OCCUPIED
    await client.query(
      `UPDATE rooms 
       SET 
        occupancy = 'Occupied', 
        occupancy_status = 'OCCUPIED', 
        guest_id = $1, 
        updated_at = CURRENT_TIMESTAMP 
       WHERE room_number = $2`,
      [id, targetRoomNumber]
    );

    // Update Booking Status to CHECKED_IN
    const updatedBooking = await client.query(
      `UPDATE bookings 
       SET 
        room_number = $1, 
        status = 'CHECKED_IN', 
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING 
        id,
        guest_name AS "guestName",
        email,
        phone,
        room_number AS "roomNumber",
        room_type AS "roomType",
        TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        notes,
        paid,
        payment_method AS "paymentMethod"`,
      [targetRoomNumber, id]
    );

    // Create / Activate Stay
    const stayId = `STAY-${id}`;
    const digitalKey = `AURA-${targetRoomNumber}-${Math.floor(100 + Math.random() * 900)}`;
    const stayRes = await client.query(
      `INSERT INTO stays (id, booking_id, room_number, guest_name, status, digital_key_code)
       VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
       ON CONFLICT (id) DO UPDATE 
        SET room_number = EXCLUDED.room_number, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [stayId, id, targetRoomNumber, booking.guest_name, digitalKey]
    );

    // Ensure Folio is linked to this room
    await client.query(
      `UPDATE folios SET room_number = $1, status = 'OPEN', updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2`,
      [targetRoomNumber, id]
    );

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Check-In')`,
      [
        `Guest Checked In: Room ${targetRoomNumber}`,
        `Front desk verified ID and checked in ${booking.guest_name} to Room ${targetRoomNumber}. Stay #${stayId} activated.`,
      ]
    );

    await client.query('COMMIT');

    const result = {
      ...updatedBooking.rows[0],
      stayId,
      digitalKeyCode: digitalKey,
    };

    emitPmsEvent('PMS_GUEST_CHECKED_IN', { booking: result, roomNumber: targetRoomNumber });

    return res.status(200).json({
      success: true,
      message: `Guest ${booking.guest_name} successfully checked into Room ${targetRoomNumber}.`,
      booking: result,
      stay: stayRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const assignRoom = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { roomNumber, forceOverride } = req.body;

    if (!roomNumber) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Target roomNumber is required for assignment.',
      });
    }

    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const booking = bookingRes.rows[0];

    const roomRes = await client.query('SELECT * FROM rooms WHERE room_number = $1', [roomNumber]);
    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Room ${roomNumber} does not exist.` });
    }
    const targetRoom = roomRes.rows[0];

    // Maintenance check
    if (targetRoom.maintenance_status && targetRoom.maintenance_status !== 'AVAILABLE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        isMaintenance: true,
        message: `Room ${roomNumber} cannot be assigned: Currently in ${targetRoom.maintenance_status}.`,
      });
    }

    // Cleanliness check
    const isDirty = targetRoom.housekeeping_status === 'DIRTY' || targetRoom.cleanliness === 'Dirty';
    if (isDirty && forceOverride !== true) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        warning: true,
        isDirty: true,
        message: `Room ${roomNumber} is currently Dirty. Assigning an uncleaned room violates 5-star protocol.`,
        dirtyReason: targetRoom.dirty_reason || 'Turnover required',
        room: targetRoom,
      });
    }

    // Release old room
    if (booking.room_number && booking.room_number !== roomNumber) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Available', occupancy_status = 'VACANT', guest_id = NULL WHERE room_number = $1`,
        [booking.room_number]
      );
    }

    // Assign new room
    await client.query(
      `UPDATE rooms 
       SET 
        occupancy = 'Occupied', 
        occupancy_status = 'OCCUPIED', 
        guest_id = $1, 
        updated_at = CURRENT_TIMESTAMP 
       WHERE room_number = $2`,
      [id, roomNumber]
    );

    const updatedBooking = await client.query(
      `UPDATE bookings 
       SET room_number = $1, status = 'CHECKED_IN', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING 
        id,
        guest_name AS "guestName",
        email,
        phone,
        room_number AS "roomNumber",
        room_type AS "roomType",
        TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        notes,
        paid,
        payment_method AS "paymentMethod"`,
      [roomNumber, id]
    );

    // Also ensure stay record exists
    const stayId = `STAY-${id}`;
    const digitalKey = `AURA-${roomNumber}-${Math.floor(100 + Math.random() * 900)}`;
    await client.query(
      `INSERT INTO stays (id, booking_id, room_number, guest_name, status, digital_key_code)
       VALUES ($1, $2, $3, $4, 'ACTIVE', $5)
       ON CONFLICT (id) DO UPDATE 
        SET room_number = EXCLUDED.room_number, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP`,
      [stayId, id, roomNumber, booking.guest_name, digitalKey]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_ROOM_ASSIGNED', { booking: updatedBooking.rows[0], roomNumber });

    return res.status(200).json({
      success: true,
      message: `Room ${roomNumber} successfully assigned to ${booking.guest_name}.`,
      booking: updatedBooking.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const cancelBooking = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const booking = bookingRes.rows[0];

    // Release room if assigned
    if (booking.room_number) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Available', occupancy_status = 'VACANT', guest_id = NULL WHERE room_number = $1`,
        [booking.room_number]
      );
    }

    const updatedRes = await client.query(
      `UPDATE bookings SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    // Cancel stay if any
    await client.query(`UPDATE stays SET status = 'CANCELLED' WHERE booking_id = $1`, [id]);

    await client.query('COMMIT');

    emitPmsEvent('PMS_BOOKING_UPDATED', updatedRes.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Reservation ${id} has been cancelled.`,
      booking: updatedRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const markNoShow = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const booking = bookingRes.rows[0];

    if (booking.room_number) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Available', occupancy_status = 'VACANT', guest_id = NULL WHERE room_number = $1`,
        [booking.room_number]
      );
    }

    const updatedRes = await client.query(
      `UPDATE bookings SET status = 'NO_SHOW', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_BOOKING_UPDATED', updatedRes.rows[0]);

    return res.status(200).json({
      success: true,
      message: `Reservation ${id} marked as No-Show.`,
      booking: updatedRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const getFolio = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;

    // Find active or most recent booking for this room
    const bookingRes = await query(
      `SELECT 
        id,
        guest_name AS "guestName",
        email,
        phone,
        room_number AS "roomNumber",
        room_type AS "roomType",
        TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
        TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        notes,
        paid,
        payment_method AS "paymentMethod"
      FROM bookings 
      WHERE room_number = $1 AND status NOT IN ('CANCELLED', 'Cancelled')
      ORDER BY (status IN ('CHECKED_IN', 'In-House', 'Departing Today')) DESC, created_at DESC 
      LIMIT 1`,
      [roomNumber]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active stay found for Room ${roomNumber}.`,
      });
    }

    const booking = bookingRes.rows[0];
    const roomTotal = Number((booking.roomRate * booking.nights).toFixed(2));

    // Get food orders
    const ordersRes = await query(
      `SELECT 
        id,
        room_number AS "roomNumber",
        guest_name AS "guestName",
        total::FLOAT AS total,
        status,
        TO_CHAR(created_at, 'HH12:MI AM') AS "createdAt",
        notes
      FROM orders
      WHERE room_number = $1 AND status != 'Cancelled'
      ORDER BY created_at DESC`,
      [roomNumber]
    );

    const foodTotal = Number(
      ordersRes.rows.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0).toFixed(2)
    );

    // Get service requests with charges
    const servicesRes = await query(
      `SELECT 
        id,
        service_type AS "serviceType",
        details,
        charge_amount::FLOAT AS "chargeAmount",
        status,
        TO_CHAR(created_at, 'Mon DD, HH12:MI AM') AS "createdAt"
      FROM service_requests
      WHERE room_number = $1 AND charge_amount > 0 AND status != 'CANCELLED'`,
      [roomNumber]
    );

    const serviceTotal = Number(
      servicesRes.rows.reduce((acc, curr) => acc + (parseFloat(curr.chargeAmount) || 0), 0).toFixed(2)
    );

    const subtotal = Number((roomTotal + foodTotal + serviceTotal).toFixed(2));
    const taxRate = 0.12; // 12% luxury tax & service charge
    const tax = Number((subtotal * taxRate).toFixed(2));
    const grandTotal = Number((subtotal + tax).toFixed(2));

    // Fetch ledger transactions if folio exists
    const folioRow = await query(
      `SELECT id, folio_type AS "folioType", status, balance::FLOAT AS balance 
       FROM folios WHERE booking_id = $1 LIMIT 1`,
      [booking.id]
    );

    let transactions = [];
    let paymentsTotal = 0;
    if (folioRow.rows.length > 0) {
      const transRes = await query(
        `SELECT 
          id,
          transaction_type AS "transactionType",
          department,
          description,
          amount::FLOAT AS amount,
          tax_amount::FLOAT AS "taxAmount",
          TO_CHAR(created_at, 'YYYY-MM-DD HH12:MI AM') AS "postedAt"
        FROM folio_transactions
        WHERE folio_id = $1
        ORDER BY created_at ASC`,
        [folioRow.rows[0].id]
      );
      transactions = transRes.rows;
      paymentsTotal = transactions
        .filter((t) => t.transactionType === 'PAYMENT')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    const remainingBalance = booking.paid ? 0 : Math.max(0, Number((grandTotal - paymentsTotal).toFixed(2)));
    const paymentStatus = booking.paid || remainingBalance <= 0 
      ? 'PAID' 
      : paymentsTotal > 0 
      ? 'PARTIALLY_PAID' 
      : 'PENDING';

    return res.status(200).json({
      success: true,
      folio: {
        roomNumber,
        booking,
        orders: ordersRes.rows,
        serviceRequests: servicesRes.rows,
        folioRecord: folioRow.rows[0] || null,
        transactions,
        breakdown: {
          nights: booking.nights,
          roomRate: booking.roomRate,
          roomTotal,
          foodTotal,
          serviceTotal,
          subtotal,
          taxRatePercent: 12,
          tax,
          grandTotal,
          paymentsTotal: Number(paymentsTotal.toFixed(2)),
          remainingBalance,
          paymentStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutGuest = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { roomNumber } = req.params;
    const { paymentMethod = 'Visa Signature •••• 4092' } = req.body;

    // Find active booking for this room
    const bookingRes = await client.query(
      `SELECT * FROM bookings 
       WHERE room_number = $1 AND status IN ('CHECKED_IN', 'In-House', 'Departing Today', 'CONFIRMED')
       ORDER BY created_at DESC LIMIT 1`,
      [roomNumber]
    );

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: `No active in-house guest found to check out in Room ${roomNumber}.`,
      });
    }

    const booking = bookingRes.rows[0];

    // Mark booking CHECKED_OUT and paid
    const updatedBooking = await client.query(
      `UPDATE bookings 
       SET 
        status = 'CHECKED_OUT',
        paid = TRUE,
        payment_method = $1,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING 
        id,
        guest_name AS "guestName",
        email,
        room_number AS "roomNumber",
        room_type AS "roomType",
        nights,
        room_rate::FLOAT AS "roomRate",
        status,
        paid,
        payment_method AS "paymentMethod"`,
      [paymentMethod, booking.id]
    );

    // Complete stay record
    await client.query(
      `UPDATE stays 
       SET status = 'COMPLETED', check_out_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE booking_id = $1`,
      [booking.id]
    );

    // Settle folio record
    const folioRes = await client.query(
      `SELECT id, balance::FLOAT AS balance FROM folios WHERE booking_id = $1 LIMIT 1`,
      [booking.id]
    );

    if (folioRes.rows.length > 0) {
      const f = folioRes.rows[0];
      if (f.balance > 0) {
        await client.query(
          `INSERT INTO folio_transactions (folio_id, transaction_type, department, description, amount, tax_amount)
           VALUES ($1, 'PAYMENT', 'PAYMENT', $2, $3, 0)`,
          [f.id, `Settlement at Checkout (${paymentMethod})`, -f.balance]
        );
      }
      await client.query(
        `UPDATE folios SET status = 'SETTLED', balance = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [f.id]
      );
    }

    // AUTOMATIC CHECKOUT -> HOUSEKEEPING TRANSITION (Requirement 10)
    // 1. Room occupancy -> VACANT
    // 2. Housekeeping status -> DIRTY
    await client.query(
      `UPDATE rooms 
       SET 
        occupancy = 'Available',
        occupancy_status = 'VACANT',
        cleanliness = 'Dirty',
        housekeeping_status = 'DIRTY',
        dirty_reason = 'Guest checked out • Full turnover required',
        guest_id = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $1`,
      [roomNumber]
    );

    // 3. Automatically create a Housekeeping task in the queue
    const taskId = `HKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const hkTaskRes = await client.query(
      `INSERT INTO housekeeping_tasks (id, room_number, priority, status, notes)
       VALUES ($1, $2, 'CHECKOUT', 'DIRTY', $3)
       RETURNING *`,
      [taskId, roomNumber, `Full sanitization and linen turnover for departing guest ${booking.guest_name}.`]
    );

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Front Desk')`,
      [
        `Check-out Completed: Room ${roomNumber}`,
        `${booking.guest_name} settled folio via ${paymentMethod} and checked out. Room ${roomNumber} automatically flagged DIRTY for Housekeeping queue (#${taskId}).`,
      ]
    );

    await client.query('COMMIT');

    // Broadcast checkout event to Housekeeping, Front Desk, and Guest Portal
    emitPmsEvent('PMS_GUEST_CHECKED_OUT', { 
      roomNumber, 
      booking: updatedBooking.rows[0], 
      housekeepingTask: hkTaskRes.rows[0] 
    });

    return res.status(200).json({
      success: true,
      message: `Guest ${booking.guest_name} checked out of Room ${roomNumber}. Room transitioned to Housekeeping queue.`,
      booking: updatedBooking.rows[0],
      housekeepingTask: hkTaskRes.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const undoCheckout = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }

    const booking = bookingRes.rows[0];

    await client.query(
      `UPDATE bookings SET status = 'CHECKED_IN', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    if (booking.room_number) {
      await client.query(
        `UPDATE rooms 
         SET 
          occupancy = 'Occupied', 
          occupancy_status = 'OCCUPIED', 
          cleanliness = 'Clean', 
          housekeeping_status = 'CLEAN', 
          dirty_reason = NULL,
          guest_id = $1 
         WHERE room_number = $2`,
        [id, booking.room_number]
      );
    }

    await client.query(
      `UPDATE stays SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE booking_id = $1`,
      [id]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Booking ${id} restored to Checked-In status.`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  checkInGuest,
  assignRoom,
  cancelBooking,
  markNoShow,
  getFolio,
  checkoutGuest,
  undoCheckout,
};
