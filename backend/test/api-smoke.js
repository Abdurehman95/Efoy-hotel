import app from '../src/app.js';
import http from 'http';

const server = http.createServer(app);

const runSmokeTest = async () => {
  console.log('🧪 Starting API Smoke Test...');

  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  const testEndpoint = async (method, path, body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${baseUrl}${path}`, opts);
      const data = await res.json();
      console.log(`  [${method}] ${path} => ${res.status} ${res.status < 400 ? '✅' : '❌'}`);
      return { status: res.status, data };
    } catch (err) {
      console.error(`  [${method}] ${path} => Error:`, err.message);
      return { status: 500, error: err };
    }
  };

  try {
    // 1. Health check
    await testEndpoint('GET', '/api/health');

    // 2. Auth Login (if DB running)
    const loginRes = await testEndpoint('POST', '/api/auth/login', {
      email: 'admin@efoyhotel.com',
      password: 'admin123',
    });

    const token = loginRes.data?.token || null;

    // 3. Rooms
    await testEndpoint('GET', '/api/rooms');

    // 4. Bookings
    await testEndpoint('GET', '/api/bookings');

    // 5. Menu
    await testEndpoint('GET', '/api/menu');

    // 6. Orders
    await testEndpoint('GET', '/api/orders');

    // 7. Staff
    await testEndpoint('GET', '/api/staff');

    // 8. Housekeeping
    await testEndpoint('GET', '/api/housekeeping/history');

    // 9. Analytics
    await testEndpoint('GET', '/api/analytics/overview');

    // 10. Logs
    await testEndpoint('GET', '/api/logs');

    // 11. Settings
    await testEndpoint('GET', '/api/settings');

    console.log('\n🎉 API Smoke Test completed!');
  } finally {
    server.close();
  }
};

runSmokeTest();
