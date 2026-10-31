import http from 'http';
import express from 'express';
import app from '../src/app.js';
import { createLimiter } from '../src/middleware/rateLimiter.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('\n🧪 ========================================================');
  console.log('🧪 Starting Efoy Hotel Rate Limiter Comprehensive Test Suite');
  console.log('🧪 ========================================================\n');

  const PORT = 5098;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Health check endpoint bypasses rate limiting
    // -------------------------------------------------------------------------
    console.log('📋 Test 1: Health check endpoint is exempt from rate limiting...');
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${baseUrl}/api/health`);
      assert(res.status === 200, `Health check request ${i + 1} returned HTTP 200`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: General API rate limiting & standard headers
    // -------------------------------------------------------------------------
    console.log('\n📋 Test 2: General API rate limiting (headers & acceptance within limit)...');
    const genRes = await fetch(`${baseUrl}/api/menu`);
    assert(genRes.status === 200, 'Initial GET /api/menu request returned HTTP 200');
    assert(genRes.headers.has('ratelimit-limit') || genRes.headers.has('x-ratelimit-limit'), 'Contains RateLimit-Limit header');
    assert(genRes.headers.has('ratelimit-remaining') || genRes.headers.has('x-ratelimit-remaining'), 'Contains RateLimit-Remaining header');

    // -------------------------------------------------------------------------
    // TEST 3: Login API rate limiting (Maximum 5 requests per 15 minutes)
    // -------------------------------------------------------------------------
    console.log('\n📋 Test 3: Login API rate limiting (Max 5 req/15min)...');
    // Send 5 login requests
    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_limit@example.com', password: 'wrong' }),
      });
      assert(res.status !== 429, `Login request #${i} accepted within limit (HTTP ${res.status} !== 429)`);
    }

    // 6th login request MUST be rejected with HTTP 429
    const loginRejectRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test_limit@example.com', password: 'wrong' }),
    });
    assert(loginRejectRes.status === 429, '6th Login request rejected with HTTP 429 Too Many Requests');
    
    const loginRejectData = await loginRejectRes.json();
    assert(loginRejectData.success === false, 'Error response contains success: false');
    assert(loginRejectData.error === 'Too Many Requests', 'Error response has error: "Too Many Requests"');
    assert(loginRejectData.message.includes('Too many login attempts'), 'Message clearly explains login limit exceeded');
    assert(loginRejectRes.headers.has('retry-after') || loginRejectData.retryAfter, 'Contains Retry-After information');

    // -------------------------------------------------------------------------
    // TEST 4: Registration API rate limiting (Maximum 5 requests per 15 minutes)
    // -------------------------------------------------------------------------
    console.log('\n📋 Test 4: Registration API rate limiting (Max 5 req/15min)...');
    // Create an isolated sub-app for registration testing to test IP limit cleanly
    const regApp = express();
    regApp.set('trust proxy', 1);
    const { registerLimiter } = await import('../src/middleware/rateLimiter.js');
    regApp.post('/register', registerLimiter, (req, res) => res.status(201).json({ success: true }));

    const regServer = http.createServer(regApp);
    const REG_PORT = 5097;
    await new Promise((resolve) => regServer.listen(REG_PORT, resolve));

    try {
      for (let i = 1; i <= 5; i++) {
        const res = await fetch(`http://localhost:${REG_PORT}/register`, { method: 'POST' });
        assert(res.status === 201, `Registration attempt #${i} accepted within limit (HTTP 201)`);
      }

      // 6th registration attempt MUST be rejected with HTTP 429
      const regRejectRes = await fetch(`http://localhost:${REG_PORT}/register`, { method: 'POST' });
      assert(regRejectRes.status === 429, '6th Registration attempt rejected with HTTP 429');
      const regRejectData = await regRejectRes.json();
      assert(regRejectData.error === 'Too Many Requests', 'Registration 429 response has correct error code');
      assert(regRejectData.message.includes('Too many registration attempts'), 'Registration 429 has clear message');
    } finally {
      regServer.close();
    }

    // -------------------------------------------------------------------------
    // TEST 5: Room search & availability rate limiting (Max 30 requests)
    // -------------------------------------------------------------------------
    console.log('\n📋 Test 5: Room availability / search rate limiting (Max 30 req/15min)...');
    const roomApp = express();
    roomApp.set('trust proxy', 1);
    const { roomSearchLimiter } = await import('../src/middleware/rateLimiter.js');
    roomApp.get('/available', roomSearchLimiter, (req, res) => res.status(200).json({ success: true, rooms: [] }));

    const roomServer = http.createServer(roomApp);
    const ROOM_PORT = 5096;
    await new Promise((resolve) => roomServer.listen(ROOM_PORT, resolve));

    try {
      for (let i = 1; i <= 30; i++) {
        const res = await fetch(`http://localhost:${ROOM_PORT}/available`);
        assert(res.status === 200, `Room search request #${i} accepted within limit (HTTP 200)`);
      }

      // 31st request MUST be rejected with HTTP 429
      const roomRejectRes = await fetch(`http://localhost:${ROOM_PORT}/available`);
      assert(roomRejectRes.status === 429, '31st room availability request rejected with HTTP 429');
      const roomRejectData = await roomRejectRes.json();
      assert(roomRejectData.error === 'Too Many Requests', 'Room search 429 error format is verified');
      assert(roomRejectData.message.includes('room search and availability'), 'Room search 429 message is descriptive');
    } finally {
      roomServer.close();
    }

    // -------------------------------------------------------------------------
    // TEST 6: Window reset after configured time duration
    // -------------------------------------------------------------------------
    console.log('\n📋 Test 6: Rate limit window reset after expiration...');
    const shortWindowLimiter = createLimiter({
      windowMs: 1200, // 1.2 seconds window
      max: 2,         // 2 requests allowed
      message: 'Short window limit reached.',
    });

    const resetApp = express();
    resetApp.set('trust proxy', 1);
    resetApp.get('/test-reset', shortWindowLimiter, (req, res) => res.status(200).json({ success: true }));

    const resetServer = http.createServer(resetApp);
    const RESET_PORT = 5095;
    await new Promise((resolve) => resetServer.listen(RESET_PORT, resolve));

    try {
      // First 2 requests within window
      const r1 = await fetch(`http://localhost:${RESET_PORT}/test-reset`);
      assert(r1.status === 200, 'Request 1 in short window accepted');
      const r2 = await fetch(`http://localhost:${RESET_PORT}/test-reset`);
      assert(r2.status === 200, 'Request 2 in short window accepted');

      // 3rd request exceeds limit -> 429
      const r3 = await fetch(`http://localhost:${RESET_PORT}/test-reset`);
      assert(r3.status === 429, 'Request 3 exceeds limit -> HTTP 429 returned');

      console.log('  ⏳ Waiting 1300ms for rate limit window to reset...');
      await new Promise((resolve) => setTimeout(resolve, 1300));

      // 4th request after window expired MUST succeed with 200
      const r4 = await fetch(`http://localhost:${RESET_PORT}/test-reset`);
      assert(r4.status === 200, 'Request 4 accepted with HTTP 200 after window reset!');
    } finally {
      resetServer.close();
    }

    console.log(`\n🎉 All ${passedTests}/${totalTests} rate limiter tests passed successfully!\n`);
    process.exit(0);
  } catch (err) {
    console.error('\n💥 Test suite failed with error:', err.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
