import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const baseUrl = 'http://localhost:5000/api';

  // 1. Login as admin
  console.log('Logging in as admin...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@efoyhotel.com', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(loginData));
  }
  const token = loginData.token;
  console.log('Admin login successful!');

  // 2. Test Image Upload
  console.log('Testing room image upload...');
  // Create a 1x1 png buffer for testing
  const dummyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const blob = new Blob([dummyPng], { type: 'image/png' });
  const formData = new FormData();
  formData.append('image', blob, 'test-luxury-room.png');

  const uploadRes = await fetch(`${baseUrl}/rooms/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  console.log('Upload response:', uploadData);
  if (!uploadData.imageUrl) {
    throw new Error('Image upload failed: ' + JSON.stringify(uploadData));
  }

  // Verify static serving of uploaded image
  const staticRes = await fetch(`http://localhost:5000${uploadData.imageUrl}`);
  console.log('Static image fetch status:', staticRes.status);
  if (staticRes.status !== 200) {
    throw new Error('Static serving of uploaded image failed!');
  }

  // 3. Test Room Category Creation
  const testCatName = `Royal Suite VIP ${Date.now().toString().slice(-4)}`;
  console.log(`Creating category "${testCatName}"...`);
  const catRes = await fetch(`${baseUrl}/rooms/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: testCatName,
      baseRate: 480,
      capacity: '2 Adults, 2 Children',
      description: 'Ultra-exclusive corner suite with wrap-around sunset panorama.',
      features: 'King Bed • Private Terrace • Jacuzzi Spa',
      imageUrl: uploadData.imageUrl,
    }),
  });
  const catData = await catRes.json();
  console.log('Category creation response:', catData);
  if (!catData.success || !catData.category?.id) {
    throw new Error('Category creation failed: ' + JSON.stringify(catData));
  }
  const createdCat = catData.category;

  // 4. Test Room Creation with categoryId and imageUrl
  const testRoomNumber = `9${Math.floor(10 + Math.random() * 89)}`;
  console.log(`Creating room ${testRoomNumber} under category ${testCatName}...`);
  const roomRes = await fetch(`${baseUrl}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      roomNumber: testRoomNumber,
      type: testCatName,
      categoryId: createdCat.id,
      floor: 'Floor 9 (Penthouse Level)',
      capacity: '4 Guests',
      rate: 550,
      features: 'King Bed • Private Terrace • Jacuzzi Spa',
      imageUrl: uploadData.imageUrl,
    }),
  });
  const roomData = await roomRes.json();
  console.log('Room creation response:', roomData);
  if (!roomData.success || !roomData.room) {
    throw new Error('Room creation failed: ' + JSON.stringify(roomData));
  }
  console.log('Created room successfully with imageUrl and categoryId:', {
    roomNumber: roomData.room.roomNumber,
    type: roomData.room.type,
    categoryId: roomData.room.categoryId,
    imageUrl: roomData.room.imageUrl,
  });

  // 5. Query getRooms and check persistence
  const getRes = await fetch(`${baseUrl}/rooms/${testRoomNumber}`);
  const getData = await getRes.json();
  console.log('Get room by number response:', getData.room);
  if (getData.room.imageUrl !== uploadData.imageUrl) {
    throw new Error('Persisted room imageUrl does not match uploaded image URL!');
  }

  // 6. Clean up test records
  console.log('Cleaning up test room...');
  await fetch(`${baseUrl}/rooms/${testRoomNumber}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Cleaning up test category...');
  await fetch(`${baseUrl}/rooms/categories/${createdCat.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
