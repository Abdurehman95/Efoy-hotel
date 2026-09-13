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

    // Step 4: Run seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Populating initial seed data...');
    await appClient.query(seedSql);
    console.log('✅ Luxury hotel seed records populated successfully.');

    // Step 5: Verification check
    const roomCount = await appClient.query('SELECT COUNT(*) FROM rooms');
    const bookingCount = await appClient.query('SELECT COUNT(*) FROM bookings');
    const staffCount = await appClient.query('SELECT COUNT(*) FROM staff');
    const userCount = await appClient.query('SELECT COUNT(*) FROM users');
    const menuCount = await appClient.query('SELECT COUNT(*) FROM menu_items');

    console.log('\n📊 Migration Summary:');
    console.log(` - Users:       ${userCount.rows[0].count}`);
    console.log(` - Rooms:       ${roomCount.rows[0].count}`);
    console.log(` - Bookings:    ${bookingCount.rows[0].count}`);
    console.log(` - Menu Items:  ${menuCount.rows[0].count}`);
    console.log(` - Staff:       ${staffCount.rows[0].count}`);
    console.log('\n🎉 Database setup complete and verified!\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await appClient.end().catch(() => { });
  }
}

runMigration();
