import { pool, query } from '../config/db.js';
import { emitPmsEvent } from '../socket.js';

export const getOrders = async (req, res, next) => {
  try {
    const { status, roomNumber } = req.query;

    let sql = `
      SELECT 
        o.id,
        o.room_number AS "roomNumber",
        o.booking_id AS "bookingId",
        o.guest_name AS "guestName",
        o.total::FLOAT AS total,
        o.status,
        TO_CHAR(o.created_at, 'HH12:MI AM') AS "createdAt",
        o.elapsed_minutes AS "elapsedMinutes",
        o.notes,
        o.server_name AS "server",
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menuItemId', oi.menu_item_id,
              'name', oi.name,
              'price', oi.price::FLOAT,
              'qty', oi.qty
            )
          ) FILTER (WHERE oi.id IS NOT NULL), '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND o.status = $${params.length}`;
    }

    if (roomNumber) {
      params.push(roomNumber);
      sql += ` AND o.room_number = $${params.length}`;
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      orders: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { roomNumber, guestName, items, notes } = req.body;

    if (!roomNumber || !items || !Array.isArray(items) || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'roomNumber and at least one order item are required.',
      });
    }

    // Resolve guest name from active room booking if not explicitly provided
    let finalGuestName = guestName;
    let bookingId = null;

    const activeBooking = await client.query(
      `SELECT id, guest_name FROM bookings 
       WHERE room_number = $1 AND status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out') 
       LIMIT 1`,
      [roomNumber]
    );
    if (activeBooking.rows.length > 0) {
      bookingId = activeBooking.rows[0].id;
      if (!finalGuestName) finalGuestName = activeBooking.rows[0].guest_name;
    } else if (!finalGuestName) {
      finalGuestName = `Guest (Room ${roomNumber})`;
    }

    // Calculate total
    const total = items.reduce((acc, it) => acc + (parseFloat(it.price) || 0) * (parseInt(it.qty, 10) || 1), 0);

    const randomNum = Math.floor(500 + Math.random() * 500);
    const orderId = req.body.id || `ORD-${randomNum}`;

    const orderRes = await client.query(
      `INSERT INTO orders (id, room_number, booking_id, guest_name, total, status, notes)
       VALUES ($1, $2, $3, $4, $5, 'Pending', $6)
       RETURNING 
        id,
        room_number AS "roomNumber",
        guest_name AS "guestName",
        total::FLOAT AS total,
        status,
        TO_CHAR(created_at, 'HH12:MI AM') AS "createdAt",
        elapsed_minutes AS "elapsedMinutes",
        notes,
        server_name AS "server"`,
      [orderId, roomNumber, bookingId, finalGuestName, total, notes || null]
    );

    // Insert items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id || null, item.name, parseFloat(item.price), parseInt(item.qty, 10) || 1]
      );
    }

    // Audit log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Kitchen', $2, 'Kitchen KDS')`,
      [
        `Room Service Order #${orderId} Placed`,
        `Order received for Room ${roomNumber} (${items.map((i) => `${i.qty}x ${i.name}`).join(', ')}). Total: $${total.toFixed(2)}. Sent to KDS.`,
      ]
    );

    await client.query('COMMIT');

    const fullOrder = {
      ...orderRes.rows[0],
      items,
    };

    // Broadcast real-time event to Kitchen KDS and Front Desk
    emitPmsEvent('PMS_NEW_ORDER', fullOrder);

    return res.status(201).json({
      success: true,
      message: `Order #${orderId} submitted to Kitchen KDS.`,
      order: fullOrder,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, serverName } = req.body;

    let normalizedStatus = status;
    const statusMap = {
      'pending': 'Pending',
      'cooking': 'Cooking',
      'ready': 'Ready',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };
    if (status && statusMap[status.toLowerCase()]) {
      normalizedStatus = statusMap[status.toLowerCase()];
    }

    const validStatuses = ['Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled'];
    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const result = await client.query(
      `UPDATE orders 
       SET 
        status = $1,
        server_name = COALESCE($2, server_name),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING 
        id,
        room_number AS "roomNumber",
        guest_name AS "guestName",
        total::FLOAT AS total,
        status,
        TO_CHAR(created_at, 'HH12:MI AM') AS "createdAt",
        elapsed_minutes AS "elapsedMinutes",
        notes,
        server_name AS "server"`,
      [normalizedStatus, serverName || null, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Order #${id} not found.` });
    }

    const order = result.rows[0];

    // AUTOMATIC FOLIO CHARGING ON 'Delivered' (Requirement 6)
    if (normalizedStatus === 'Delivered') {
      const existingCharge = await client.query(
        `SELECT id FROM folio_transactions WHERE reference_id = $1 LIMIT 1`,
        [id]
      );
      if (existingCharge.rows.length === 0) {
        const activeBooking = await client.query(
          `SELECT b.id FROM bookings b 
           WHERE b.room_number = $1 AND b.status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out')
           ORDER BY created_at DESC LIMIT 1`,
          [order.roomNumber]
        );
        if (activeBooking.rows.length > 0) {
          const bookingId = activeBooking.rows[0].id;
          const folioRes = await client.query(
            `SELECT id, balance::FLOAT AS balance FROM folios WHERE booking_id = $1 LIMIT 1`,
            [bookingId]
          );
          if (folioRes.rows.length > 0) {
            const folioId = folioRes.rows[0].id;
            const total = parseFloat(order.total);
            const taxAmount = Number((total * 0.12).toFixed(2));
            const orderCharge = Number((total + taxAmount).toFixed(2));

            await client.query(
              `INSERT INTO folio_transactions (folio_id, transaction_type, department, description, amount, tax_amount, reference_id)
               VALUES ($1, 'CHARGE', 'F&B', $2, $3, $4, $5)`,
              [folioId, `In-Room Dining Delivered: Order #${id}`, total, taxAmount, id]
            );

            await client.query(
              `UPDATE folios SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
              [orderCharge, folioId]
            );

            emitPmsEvent('PMS_FOLIO_UPDATED', { roomNumber: order.roomNumber, folioId, orderCharge });
          }
        }
      }
    }

    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag)
       VALUES ($1, 'Kitchen', $2, 'Kitchen KDS')`,
      [
        `Order #${id} Status: ${status}`,
        `Kitchen updated order #${id} for Room ${order.roomNumber} to ${status}.${status === 'Delivered' ? ' Folio automatically charged.' : ''}`,
      ]
    );

    await client.query('COMMIT');

    // Broadcast order status change to Guest, Front Desk, and Kitchen
    emitPmsEvent('PMS_ORDER_STATUS_CHANGED', order);

    return res.status(200).json({
      success: true,
      message: `Order #${id} status updated to ${status}.`,
      order,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getOrders,
  createOrder,
  updateOrderStatus,
};
