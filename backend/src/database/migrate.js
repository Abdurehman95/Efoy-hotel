import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbName = process.env.DB_NAME || 'efoy_hotel';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'postgres';
const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432', 10);

async function runMigration() {
  console.log('🚀 Starting Efoy Hotel database migration and seed runner...');
  console.log(`📡 Target: ${user}@${host}:${port}/${dbName}`);

  // Step 1: Connect to default maintenance database 'postgres' to ensure target db exists
  const adminClient = new pg.Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`📦 Database '${dbName}' does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully.`);
    } else {
      console.log(`ℹ️ Database '${dbName}' already exists.`);
    }
  } catch (err) {
    if (err.code === '28P01') {
      console.error('\n❌ PostgreSQL Authentication Failed: Invalid password for user "postgres".');
      console.error('👉 Please update DB_PASSWORD in backend/.env with your PostgreSQL password and re-run.\n');
      process.exit(1);
    } else {
      console.warn('⚠️ Warning checking/creating database:', err.message);
    }
  } finally {
    await adminClient.end().catch(() => { });
  }

  // Step 2: Connect to target database 'efoy_hotel'
  const appClient = new pg.Client({
    host,
    port,
    user,
    password,
    database: dbName,
  });

  try {
    await appClient.connect();
    console.log(`🔗 Connected to database '${dbName}'.`);

    // Step 3: Run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📑 Applying relational schema...');
    await appClient.query(schemaSql);
    console.log('✅ Schema tables and indices applied successfully.');

    // Step 3.5: Seed room_categories if empty
    const catCheck = await appClient.query('SELECT COUNT(*) FROM room_categories');
    if (parseInt(catCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding luxury room categories...');
      await appClient.query(`
        INSERT INTO room_categories (name, base_rate, capacity, description, features, image_url)
        VALUES 
          ('Single Classic', 1500, '1 Person', 'Elegantly appointed urban haven featuring bespoke Italian millwork and city skyline vistas.', 'Single Bed • City View • Espresso Machine', '/images/room1.jpg'),
          ('Single Deluxe', 2200, '1 Person', 'Private retreat overlooking quiet interior botanical courtyard with marble shower.', 'Queen Bed • Garden Courtyard • Rain Shower', '/images/room2.jpg'),
          ('Double Deluxe', 3500, '2 Adults', 'Expansive suite featuring dual vanities, soaking tub and private promenade balcony.', 'King Bed • Balcony • Marble Bath', '/images/room3.jpg'),
          ('Double Executive', 4800, '2 Adults, 1 Child', 'Executive-level luxury with dedicated workstation, lounge alcove, and high-fidelity acoustics.', 'King Bed • Oceanfront • Lounge Area • B&O Audio', '/images/room4.jpg'),
          ('Luxury Suite', 6800, '4 Persons', 'Two-bedroom architectural triumph featuring limestone fireplace and dedicated 24h butler service.', 'Master King + Twin • Fireplace • Private Butler', '/images/room5.jpg'),
          ('Penthouse Panoramic', 8500, '6 Persons', 'Top-floor expansive luxury boasting 360-degree waterfront wrap terrace and chef kitchen.', '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen', '/images/room6.jpg'),
          ('Presidential Penthouse', 10000, '6 Persons', 'The pinnacle of private luxury: full private floor, direct helipad access, and cedar spa.', 'Full Floor Luxury • Helipad Access • Private Spa', '/images/room7.jpg')
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('✅ Room categories seeded.');
    }

    // Step 3.6: Seed inventory_items if empty
    const invCheck = await appClient.query('SELECT COUNT(*) FROM inventory_items');
    if (parseInt(invCheck.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding kitchen inventory and ingredient links...');
      await appClient.query(`
        INSERT INTO inventory_items (name, category, quantity, unit, min_stock, cost_per_unit, status)
        VALUES 
          ('A5 Miyazaki Wagyu Beef', 'Butchery', 18, 'kg', 5, 85.00, 'IN_STOCK'),
          ('French Artisanal Brioche Buns', 'Bakery', 35, 'pcs', 10, 2.50, 'IN_STOCK'),
          ('Winter Black Truffle Aioli', 'Pantry', 12, 'jars', 3, 14.00, 'IN_STOCK'),
          ('Belgian Artisan Waffle Batter', 'Bakery', 22, 'kg', 5, 8.00, 'IN_STOCK'),
          ('Wild Forest Berry Compote', 'Pantry', 14, 'jars', 4, 9.50, 'IN_STOCK'),
          ('Patagonian Toothfish (Sea Bass)', 'Seafood', 12, 'kg', 4, 42.00, 'IN_STOCK'),
          ('Valrhona Guanaja 70% Chocolate', 'Pastry', 20, 'kg', 5, 28.00, 'IN_STOCK'),
          ('Norwegian Cold-Smoked Salmon', 'Seafood', 16, 'kg', 4, 34.00, 'IN_STOCK'),
          ('USDA Prime 45-Day Dry-Aged Ribeye', 'Butchery', 14, 'portions', 4, 38.00, 'IN_STOCK'),
          ('Single-Origin Ethiopian Yirgacheffe Beans', 'Beverages', 25, 'kg', 6, 18.00, 'IN_STOCK'),
          ('Grey Goose Vodka', 'Beverages', 18, 'bottles', 4, 32.00, 'IN_STOCK'),
          ('Organic Saffron Threads', 'Spices', 80, 'grams', 20, 12.00, 'IN_STOCK');
      `);
      console.log('✅ Inventory items seeded.');
    }

    // Step 4: Verification check
    const roomCount = await appClient.query('SELECT COUNT(*) FROM rooms');
    const bookingCount = await appClient.query('SELECT COUNT(*) FROM bookings');
    const staffCount = await appClient.query('SELECT COUNT(*) FROM staff');
    const userCount = await appClient.query('SELECT COUNT(*) FROM users');
    const menuCount = await appClient.query('SELECT COUNT(*) FROM menu_items');
    const catCount = await appClient.query('SELECT COUNT(*) FROM room_categories');
    const invCount = await appClient.query('SELECT COUNT(*) FROM inventory_items');

    console.log('\n📊 Migration Summary:');
    console.log(` - Users:           ${userCount.rows[0].count}`);
    console.log(` - Rooms:           ${roomCount.rows[0].count}`);
    console.log(` - Room Categories: ${catCount.rows[0].count}`);
    console.log(` - Bookings:        ${bookingCount.rows[0].count}`);
    console.log(` - Menu Items:      ${menuCount.rows[0].count}`);
    console.log(` - Inventory Items: ${invCount.rows[0].count}`);
    console.log(` - Staff:           ${staffCount.rows[0].count}`);
    console.log('\n🎉 Database setup complete and verified!\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await appClient.end().catch(() => { });
  }
}

runMigration();
