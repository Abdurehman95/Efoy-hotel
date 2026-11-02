import { query } from '../src/config/db.js';
import chapaService from '../src/services/chapaService.js';

async function runPaymentTests() {
  console.log('🧪 Starting Chapa Payment & Architecture Tests...\n');

  try {
    // 1. Verify schema tables exist
    console.log('1️⃣ Checking new architecture tables...');
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'roles', 'permissions', 'user_roles', 'role_permissions',
          'rate_plans', 'room_blocks', 'payments', 'payment_webhook_events',
          'invoices', 'invoice_items', 'recipes', 'recipe_items', 'stock_movements'
        )
    `);

    const existingTables = tablesCheck.rows.map(r => r.table_name);
    console.log(`   Found ${existingTables.length}/13 new tables in database.`);
    if (existingTables.length < 13) {
      throw new Error(`Missing expected tables. Found only: ${existingTables.join(', ')}`);
    }
    console.log('   ✅ All 13 new architecture tables verified in PostgreSQL.');

    // 2. Verify laundry and suppliers are not present
    console.log('2️⃣ Verifying explicit removals (suppliers, laundry)...');
    const removedTables = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('suppliers', 'laundry_orders', 'laundry_order_items')
    `);
    if (removedTables.rows.length > 0) {
      throw new Error(`Found tables that should be removed: ${removedTables.rows.map(r => r.table_name).join(', ')}`);
    }
    console.log('   ✅ No suppliers or laundry tables present.');

    // 3. Test Chapa Service Initialization
    console.log('3️⃣ Testing Chapa Service Initialization...');
    const testTxRef = `TEST-TX-${Date.now()}`;
    const initRes = await chapaService.initializeTransaction({
      amount: 4500.00,
      currency: 'ETB',
      email: 'testguest@efoyhotel.com',
      firstName: 'Abebe',
      lastName: 'Bikila',
      phoneNumber: '0911223344',
      txRef: testTxRef,
      bookingId: 'BK-TEST-001',
    });

    if (!initRes || !initRes.checkoutUrl) {
      throw new Error('Chapa initialization failed to return checkoutUrl');
    }
    console.log(`   ✅ Chapa checkout initialized: ${initRes.checkoutUrl.substring(0, 45)}...`);

    // 4. Test Verification Routine
    console.log('4️⃣ Testing Chapa Verification...');
    const verifyRes = await chapaService.verifyTransaction(testTxRef);
    if (!verifyRes.verified) {
      throw new Error('Verification failed in test mode');
    }
    console.log('   ✅ Chapa verification routine passed.');

    // 5. Test Webhook Signature validation
    console.log('5️⃣ Testing Webhook Signature Validation...');
    const testPayload = { tx_ref: testTxRef, status: 'success' };
    const isValid = chapaService.validateWebhookSignature(testPayload, '');
    if (!isValid) {
      throw new Error('Default fallback signature validation should succeed');
    }
    console.log('   ✅ Webhook signature validation tested.');

    // 6. Test Date Overlap Query Logic
    console.log('6️⃣ Testing Date-Overlap Availability Query with room_blocks...');
    const overlapRes = await query(`
      SELECT r.room_number 
      FROM rooms r
      WHERE COALESCE(r.maintenance_status, 'AVAILABLE') = 'AVAILABLE'
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_number = r.room_number
          AND b.status NOT IN ('CANCELLED', 'CHECKED_OUT', 'Cancelled', 'Checked Out')
          AND b.check_in < '2026-12-05'::date
          AND b.check_out > '2026-12-01'::date
      )
      AND NOT EXISTS (
        SELECT 1 FROM room_blocks rb
        WHERE rb.room_number = r.room_number
          AND rb.status = 'ACTIVE'
          AND rb.start_date < '2026-12-05'::date
          AND rb.end_date > '2026-12-01'::date
      )
      LIMIT 3
    `);
    console.log(`   ✅ Date-overlap query returned ${overlapRes.rowCount} available rooms without error.`);

    console.log('\n🎉 ALL ARCHITECTURE & PAYMENT TESTS PASSED SUCCESSFULLY! 🎉\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runPaymentTests();
