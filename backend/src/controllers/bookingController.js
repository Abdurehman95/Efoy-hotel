import { pool, query } from '../config/db.js';

export const getBookings = async (req, res, next) => {
  try {
    const { status, search, roomNumber } = req.query;

    let sql = `
      SELECT 
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
        payment_method AS "paymentMethod",
        created_at AS "createdAt"
      FROM bookings
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND room_number = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (guest_name ILIKE $${params.length} OR id ILIKE $${params.length} OR email ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC`;

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
        payment_method AS "paymentMethod",
        created_at AS "createdAt"
      FROM bookings
      WHERE id = $1`,
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

    // Generate Booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = req.body.id || `BK-${randomSuffix}`;
    const bookingStatus = status || 'Arriving Today';
    const computedNights = nights || 1;

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

    // If assigned to a room and in-house or arriving, set room occupancy
    if (roomNumber) {
      const roomOccupancy = bookingStatus === 'In-House' ? 'Occupied' : 'Reserved';
      await client.query(
        `UPDATE rooms SET occupancy = $1, guest_id = $2 WHERE room_number = $3`,
        [roomOccupancy, bookingId, roomNumber]
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Reservation')`,
      [
        `New Reservation: ${bookingId}`,
        `Booked for ${guestName} (${roomType}${roomNumber ? ` - Room ${roomNumber}` : ''}). Check-in: ${checkIn}.`,
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully.',
      booking: bookingRes.rows[0],
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

    // Fetch booking
    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Booking ${id} not found.` });
    }
    const booking = bookingRes.rows[0];

    // Fetch room
    const roomRes = await client.query('SELECT * FROM rooms WHERE room_number = $1', [roomNumber]);
    if (roomRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Room ${roomNumber} does not exist.` });
    }
    const targetRoom = roomRes.rows[0];

    // SMART DIRTY CHECK
    if (targetRoom.cleanliness === 'Dirty' && forceOverride !== true) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        warning: true,
        isDirty: true,
        message: `Room ${roomNumber} is currently Dirty. Assigning an uncleaned room violates 5-star protocol.`,
        dirtyReason: targetRoom.dirty_reason || 'Turnover required',
      });
    }

    // Release old room if different
    if (booking.room_number && booking.room_number !== roomNumber) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Available', guest_id = NULL WHERE room_number = $1`,
        [booking.room_number]
      );
    }

    // Assign new room
    await client.query(
      `UPDATE rooms 
       SET occupancy = 'Occupied', guest_id = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE room_number = $2`,
      [id, roomNumber]
    );

    // Update booking
    const updatedBooking = await client.query(
      `UPDATE bookings 
       SET room_number = $1, status = 'In-House', updated_at = CURRENT_TIMESTAMP 
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

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Front Desk')`,
      [
        `Room ${roomNumber} Assigned to ${booking.guest_name}`,
        `Front desk assigned ${booking.guest_name} (${id}) to Room ${roomNumber}.${forceOverride ? ' [Dirty Override Applied]' : ''}`,
      ]
    );

    await client.query('COMMIT');

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

export const getFolio = async (req, res, next) => {
  try {
    const { roomNumber } = req.params;

    // Find active or most recent in-house/departing booking for this room
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
      WHERE room_number = $1 AND status != 'Cancelled'
      ORDER BY (status = 'In-House' OR status = 'Departing Today') DESC, created_at DESC 
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

    // Get orders
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

    const subtotal = Number((roomTotal + foodTotal).toFixed(2));
    const taxRate = 0.12; // 12% luxury tax
    const tax = Number((subtotal * taxRate).toFixed(2));
    const grandTotal = Number((subtotal + tax).toFixed(2));

    return res.status(200).json({
      success: true,
      folio: {
        roomNumber,
        booking,
        orders: ordersRes.rows,
        breakdown: {
          nights: booking.nights,
          roomRate: booking.roomRate,
          roomTotal,
          foodTotal,
          subtotal,
          taxRatePercent: 12,
          tax,
          grandTotal,
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
    const { paymentMethod } = req.body;

    // Find active booking for this room
    const bookingRes = await client.query(
      `SELECT * FROM bookings 
       WHERE room_number = $1 AND status IN ('In-House', 'Departing Today')
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

    // Mark booking checked out and paid
    const updatedBooking = await client.query(
      `UPDATE bookings 
       SET 
        status = 'Checked Out',
        paid = TRUE,
        payment_method = COALESCE($1, 'Card (Visa/Mastercard)'),
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

    // Flag room as Available + Dirty with turnover reason
    await client.query(
      `UPDATE rooms 
       SET 
        occupancy = 'Available',
        cleanliness = 'Dirty',
        dirty_reason = 'Guest checked out today • Full turnover required',
        guest_id = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE room_number = $1`,
      [roomNumber]
    );

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Front Desk', $2, 'Front Desk')`,
      [
        `Check-out Completed: Room ${roomNumber}`,
        `${booking.guest_name} settled folio and checked out. Room ${roomNumber} flagged Dirty for Housekeeping.`,
      ]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Guest ${booking.guest_name} checked out of Room ${roomNumber}. Turnover requested.`,
      booking: updatedBooking.rows[0],
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
      `UPDATE bookings SET status = 'In-House', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    if (booking.room_number) {
      await client.query(
        `UPDATE rooms SET occupancy = 'Occupied', guest_id = $1 WHERE room_number = $2`,
        [id, booking.room_number]
      );
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Booking ${id} restored to In-House.`,
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
  assignRoom,
  getFolio,
  checkoutGuest,
  undoCheckout,
};
