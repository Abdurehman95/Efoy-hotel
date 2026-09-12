import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getSettings = async (req, res, next) => {
  try {
    const result = await query("SELECT value FROM system_settings WHERE key = 'general'");

    const defaultSettings = {
      hotelName: 'Efoy Hotel & Suites',
      taxRate: 12,
      currency: '$',
      checkoutTime: '11:00 AM',
      checkinTime: '15:00 PM',
    };

    return res.status(200).json({
      success: true,
      settings: result.rows.length > 0 ? result.rows[0].value : defaultSettings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const newSettings = req.body;

    const result = await query(
      `INSERT INTO system_settings (key, value)
       VALUES ('general', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP
       RETURNING value`,
      [JSON.stringify(newSettings)]
    );

    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      settings: result.rows[0].value,
    });
  } catch (error) {
    next(error);
  }
};

export const resetDemoData = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🔄 Resetting database to luxury demo seed state...');

    // Truncate tables with cascade
    await client.query(`
      TRUNCATE TABLE 
        order_items, 
        orders, 
        bookings, 
        housekeeping_history, 
        activity_logs, 
        menu_items, 
        staff, 
        rooms, 
        users 
      RESTART IDENTITY CASCADE;
    `);

    // Re-run seed.sql
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Demo dataset successfully reset to original 5-star state.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

export default {
  getSettings,
  updateSettings,
  resetDemoData,
};
