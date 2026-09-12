import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log('──────────────────────────────────────────────────');
  console.log(`🏨 Efoy Hotel & Suites PMS Backend running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('──────────────────────────────────────────────────');

  // Test DB connection
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`✅ PostgreSQL Connected successfully. Server time: ${res.rows[0].now}`);
  } catch (err) {
    console.warn(`⚠️ PostgreSQL connection attempt: ${err.message}`);
    console.warn(`💡 Tip: Run 'npm run migrate' to initialize the database or verify credentials in backend/.env`);
  }
});

// Graceful shutdown
const handleShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('🚪 Closed HTTP server.');
    try {
      await pool.end();
      console.log('🗄️ Closed PostgreSQL pool.');
    } catch (e) {
      console.error('Error closing pool:', e.message);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
