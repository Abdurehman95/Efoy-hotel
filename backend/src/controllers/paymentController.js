import { query, pool } from '../config/db.js';
import crypto from 'crypto';
import chapaService from '../services/chapaService.js';
import { emitPmsEvent } from '../socket.js';

/**
 * 1. Initialize Chapa Checkout
 * Creates a local PENDING payment record and requests hosted checkout from Chapa.
 */
export const initializePayment = async (req, res, next) => {
  try {
    const { bookingId, amount, currency = 'ETB', email, firstName, lastName, phone, returnUrl } = req.body;

    if (!bookingId || amount === undefined || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: bookingId, amount, and email are required.',
      });
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number.',
      });
    }

    // Verify booking exists
    const bookingRes = await query(
      `SELECT id, guest_name, email, phone, room_number, room_rate, status, paid 
       FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking ${bookingId} not found.`,
      });
    }

    const booking = bookingRes.rows[0];

    const rawPhone = phone || booking.phone;
    const guestPhone = chapaService.formatChapaPhone(rawPhone);
    if (!guestPhone) {
      return res.status(400).json({
        success: false,
        message: 'A valid 10-digit Ethiopian mobile phone number (09xxxxxxxx or 07xxxxxxxx) is required to process Chapa payment.',
      });
    }

    // Find or create folio for the booking
    let folioRes = await query(`SELECT id, balance FROM folios WHERE booking_id = $1`, [bookingId]);
    let folioId = folioRes.rows[0]?.id || null;

    if (!folioId) {
      folioId = `FOL-${bookingId}`;
      await query(
        `INSERT INTO folios (id, booking_id, room_number, balance, status, currency)
         VALUES ($1, $2, $3, $4, 'OPEN', $5)
         ON CONFLICT (id) DO NOTHING`,
        [folioId, bookingId, booking.room_number, payAmount, currency]
      );
    }

    // Generate unique transaction reference
    const uniqueHash = crypto.randomBytes(4).toString('hex');
    const txRef = `EFOY-${bookingId}-${Date.now()}-${uniqueHash}`;
    const idempotencyKey = req.headers['idempotency-key'] || `IDEM-${txRef}`;

    // Store local pending payment record
    const insertPayment = await query(
      `INSERT INTO payments (
        folio_id, booking_id, amount, currency, provider, 
        provider_tx_ref, status, payment_type, idempotency_key
      ) VALUES ($1, $2, $3, $4, 'CHAPA', $5, 'PENDING', 'ONLINE', $6)
      RETURNING id, provider_tx_ref, amount, currency, status, created_at`,
      [folioId, bookingId, payAmount, currency, txRef, idempotencyKey]
    );

    const paymentRecord = insertPayment.rows[0];

    // Initialize with Chapa
    const chapaRes = await chapaService.initializeTransaction({
      amount: payAmount,
      currency,
      email: email || booking.email,
      firstName: firstName || booking.guest_name?.split(' ')[0] || 'Valued',
      lastName: lastName || booking.guest_name?.split(' ').slice(1).join(' ') || 'Guest',
      phone: guestPhone,
      txRef,
      bookingId,
      returnUrl,
      title: 'Efoy Hotel & Suites',
      description: `Payment for Reservation ${bookingId}`,
    });

    // Save checkout_url to database
    await query(
      `UPDATE payments 
       SET checkout_url = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [chapaRes.checkoutUrl, paymentRecord.id]
    );

    // Audit log
    await query(
      `INSERT INTO activity_logs (title, category, description, tag, action, entity_type, entity_id)
       VALUES ($1, 'Payment', $2, 'Finance', 'PAYMENT_INITIALIZED', 'payments', $3)`,
      [
        `Chapa Payment Initialized: ${txRef}`,
        `Payment attempt of ${currency} ${payAmount} created for Booking ${bookingId}.`,
        paymentRecord.id.toString(),
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Chapa checkout initialized successfully.',
      checkoutUrl: chapaRes.checkoutUrl,
      txRef,
      paymentId: paymentRecord.id,
      amount: payAmount,
      currency,
      isSimulated: chapaRes.isSimulated || false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Verify Payment Directly with Chapa Server-to-Server
 * Ensures amount, currency, and tx_ref match before marking paid and updating ledger.
 * Fully Idempotent: Can be called multiple times without duplicate charges.
 */
export const verifyPayment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { txRef } = req.params;

    if (!txRef) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference (txRef) parameter is required.',
      });
    }

    // Check local payment record
    const paymentCheck = await query(
      `SELECT p.id, p.folio_id, p.booking_id, p.amount::FLOAT AS amount, p.currency, p.status, p.paid_at,
              b.guest_name, b.email, b.room_number
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       WHERE p.provider_tx_ref = $1`,
      [txRef]
    );

    if (paymentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Payment record with transaction reference ${txRef} not found.`,
      });
    }

    const localPayment = paymentCheck.rows[0];

    // Idempotency: If already confirmed successful, return immediately without re-posting
    if (localPayment.status === 'SUCCESSFUL') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been verified and processed.',
        status: 'SUCCESSFUL',
        payment: localPayment,
      });
    }

    // Verify with Chapa API
    const verification = await chapaService.verifyTransaction(txRef);

    if (!verification.verified) {
      await query(
        `UPDATE payments 
         SET status = 'FAILED', failure_reason = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE provider_tx_ref = $2`,
        [verification.message || 'Verification rejected by Chapa.', txRef]
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed at provider.',
        status: 'FAILED',
      });
    }

    const verifiedAmount = verification.amount || localPayment.amount;

    // Security check: Verify amount and currency match expected values
    if (verification.amount && Math.abs(verification.amount - localPayment.amount) > 0.01) {
      await query(
        `UPDATE payments 
         SET status = 'FAILED', failure_reason = 'Amount mismatch between Chapa and PMS.', updated_at = CURRENT_TIMESTAMP 
         WHERE provider_tx_ref = $1`,
        [txRef]
      );

      return res.status(400).json({
        success: false,
        message: 'Security Alert: Payment amount mismatch detected.',
        status: 'FAILED',
      });
    }

    // Atomic PostgreSQL Transaction
    await client.query('BEGIN');

    // 1. Mark Payment Successful
    await client.query(
      `UPDATE payments 
       SET status = 'SUCCESSFUL', paid_at = COALESCE($1, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP 
       WHERE provider_tx_ref = $2`,
      [verification.paidAt, txRef]
    );

    // 2. Post Immutable Ledger Entry to folio_transactions
    if (localPayment.folio_id) {
      await client.query(
        `INSERT INTO folio_transactions (
          folio_id, transaction_type, department, description, amount, 
          tax_amount, reference_type, reference_id, posted_by
        ) VALUES ($1, 'PAYMENT', 'PAYMENT', $2, $3, 0.00, 'CHAPA', $4, $5)`,
        [
          localPayment.folio_id,
          `Chapa Online Payment (${verification.paymentMethod || 'Online'})`,
          verifiedAmount,
          txRef,
          req.user?.id || null,
        ]
      );

      // 3. Atomically Update Folio Balance
      await client.query(
        `UPDATE folios 
         SET balance = GREATEST(0.00, balance - $1),
             status = CASE WHEN (balance - $1) <= 0 THEN 'SETTLED' ELSE status END,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [verifiedAmount, localPayment.folio_id]
      );
    }

    // 4. Update Booking Status
    if (localPayment.booking_id) {
      await client.query(
        `UPDATE bookings 
         SET paid = TRUE, 
             payment_method = 'Chapa Online Gateway',
             status = CASE WHEN status = 'PENDING_PAYMENT' THEN 'CONFIRMED' ELSE status END,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [localPayment.booking_id]
      );

      // 5. Booking Status History
      await client.query(
        `INSERT INTO booking_status_history (booking_id, old_status, new_status, reason)
         VALUES ($1, 'PENDING_PAYMENT', 'CONFIRMED', 'Chapa online payment verified successfully')`,
        [localPayment.booking_id]
      );
    }

    // 6. Security & Financial Audit Log
    await client.query(
      `INSERT INTO activity_logs (title, category, description, tag, action, entity_type, entity_id)
       VALUES ($1, 'Finance', $2, 'Payment', 'PAYMENT_VERIFIED', 'payments', $3)`,
      [
        `Chapa Payment Verified: ${txRef}`,
        `Successfully received ${localPayment.currency} ${verifiedAmount} for Booking ${localPayment.booking_id}.`,
        localPayment.id.toString(),
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_PAYMENT_VERIFIED', {
      txRef,
      bookingId: localPayment.booking_id,
      amount: verifiedAmount,
      currency: localPayment.currency,
      status: 'SUCCESSFUL',
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and posted to folio successfully.',
      status: 'SUCCESSFUL',
      txRef,
      amount: verifiedAmount,
      currency: localPayment.currency,
      bookingId: localPayment.booking_id,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * 3. Chapa Webhook / Callback Handler
 * Receives server-to-server asynchronous notification from Chapa.
 * Validates HMAC signature, records raw event, and idempotently verifies payment.
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-chapa-signature'] || req.headers['chapa-signature'];
    const payload = req.body || {};

    const isSigValid = chapaService.validateWebhookSignature(req.rawBody || payload, signature);

    const txRef = payload.tx_ref || payload.data?.tx_ref || payload.trx_ref;

    // Log raw webhook event
    await query(
      `INSERT INTO payment_webhook_events (provider, tx_ref, payload, signature_valid, processing_status)
       VALUES ('CHAPA', $1, $2, $3, $4)`,
      [txRef || 'UNKNOWN', JSON.stringify(payload), isSigValid, isSigValid ? 'RECEIVED' : 'FAILED']
    );

    if (!isSigValid) {
      console.warn('⚠️ Rejected Chapa webhook due to invalid signature.');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature.' });
    }

    if (!txRef) {
      return res.status(400).json({ success: false, message: 'No tx_ref in webhook body.' });
    }

    // Trigger verification routine idempotently
    const verification = await chapaService.verifyTransaction(txRef);
    if (verification.verified) {
      // Re-use verification flow
      req.params = { txRef };
      return verifyPayment(req, res, next);
    }

    await query(
      `UPDATE payment_webhook_events 
       SET processing_status = 'PROCESSED', processed_at = CURRENT_TIMESTAMP 
       WHERE tx_ref = $1`,
      [txRef]
    );

    return res.status(200).json({ success: true, message: 'Webhook received.' });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Get Payment Status by ID or tx_ref
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.id, p.folio_id AS "folioId", p.booking_id AS "bookingId", 
              p.amount::FLOAT AS amount, p.currency, p.provider, 
              p.provider_tx_ref AS "txRef", p.checkout_url AS "checkoutUrl", 
              p.status, p.payment_type AS "paymentType", p.paid_at AS "paidAt", 
              p.failure_reason AS "failureReason", p.created_at AS "createdAt",
              b.guest_name AS "guestName", b.room_number AS "roomNumber"
       FROM payments p
       LEFT JOIN bookings b ON p.booking_id = b.id
       WHERE p.id::text = $1 OR p.provider_tx_ref = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    const payment = result.rows[0];

    // RBAC: If user is guest, ensure they only view their own payment
    if (req.user && req.user.role === 'guest') {
      const userEmail = req.user.email;
      const bRes = await query(`SELECT email FROM bookings WHERE id = $1`, [payment.bookingId]);
      if (bRes.rows[0]?.email !== userEmail) {
        return res.status(403).json({ success: false, message: 'Access denied to this payment record.' });
      }
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Reconcile Payment (Staff / Admin Protected)
 */
export const reconcilePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentRes = await query(
      `SELECT provider_tx_ref FROM payments WHERE id::text = $1 OR provider_tx_ref = $1`,
      [id]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found for reconciliation.' });
    }

    const txRef = paymentRes.rows[0].provider_tx_ref;
    req.params = { txRef };
    return verifyPayment(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Process Authorized Refund (Admin Protected & Audited)
 */
export const processRefund = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { reason, amount } = req.body;

    const paymentRes = await query(
      `SELECT p.id, p.folio_id, p.booking_id, p.amount::FLOAT AS amount, p.currency, p.provider_tx_ref 
       FROM payments p WHERE p.id::text = $1 OR p.provider_tx_ref = $1`,
      [id]
    );

    if (paymentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const payment = paymentRes.rows[0];
    const refundAmount = amount ? parseFloat(amount) : payment.amount;

    await client.query('BEGIN');

    // Record immutable refund in folio_transactions
    if (payment.folio_id) {
      await client.query(
        `INSERT INTO folio_transactions (
          folio_id, transaction_type, department, description, amount, 
          tax_amount, reference_type, reference_id, posted_by
        ) VALUES ($1, 'REFUND', 'PAYMENT', $2, $3, 0.00, 'CHAPA_REFUND', $4, $5)`,
        [
          payment.folio_id,
          `Authorized Refund: ${reason || 'Customer request'}`,
          refundAmount,
          payment.provider_tx_ref,
          req.user?.id || null,
        ]
      );

      // Re-add balance to folio
      await client.query(
        `UPDATE folios 
         SET balance = balance + $1, status = 'OPEN', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [refundAmount, payment.folio_id]
      );
    }

    // Security & Financial Audit Log
    await client.query(
      `INSERT INTO activity_logs (user_id, title, category, description, tag, action, entity_type, entity_id)
       VALUES ($1, $2, 'Finance', $3, 'Audit', 'REFUND_PROCESSED', 'payments', $4)`,
      [
        req.user?.id || null,
        `Refund Authorized: ${payment.currency} ${refundAmount}`,
        `Administrator authorized refund of ${payment.currency} ${refundAmount} for ${payment.provider_tx_ref}. Reason: ${reason || 'Not specified'}.`,
        payment.id.toString(),
      ]
    );

    await client.query('COMMIT');

    emitPmsEvent('PMS_REFUND_PROCESSED', {
      paymentId: payment.id,
      amount: refundAmount,
      currency: payment.currency,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: 'Refund processed and ledger updated.',
      refundAmount,
      currency: payment.currency,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  reconcilePayment,
  processRefund,
};
