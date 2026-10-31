import { query, pool } from '../config/db.js';

const dishes = [
  ['Truffle Wagyu Burger', 'All-Day Dining', 28.00, '20-25 mins', true, 'Brioche bun, caramelized onion, Gruyere, black truffle aioli, rosemary parmesan fries.', '850 kcal', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'],
  ['Belgian Waffle Stack', 'Breakfast', 24.00, '15 mins', true, 'Organic berry compote, Madagascar vanilla bean cream, grade-A Canadian maple syrup.', '620 kcal', 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&q=80'],
  ['Chilean Sea Bass', 'Chef Special', 42.00, '25-30 mins', true, 'Pan-seared with saffron emulsion, baby fennel, and fingerling potato crisps.', '540 kcal', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80'],
  ['Valrhona Molten Fondant', 'Desserts', 18.00, '12 mins', true, 'Warm molten 70% chocolate center, hazelnut praline gelato, edible 24k gold leaf.', '490 kcal', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80'],
  ['Smoked Salmon Bagel Royale', 'Breakfast', 26.00, '12 mins', true, 'Norwegian cold-smoked salmon, dill cream cheese, caper berries, pickled red onion.', '480 kcal', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80'],
  ['Prime Dry-Aged Ribeye 12oz', 'Chef Special', 64.00, '30 mins', true, '45-day dry aged, garlic confit butter, grilled asparagus, marrow bordelaise sauce.', '980 kcal', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80'],
  ['Artisanal Charcuterie & Fromage', 'All-Day Dining', 32.00, '10 mins', true, 'Prosciutto di Parma, Comte 24-mo, honeycomb, Marcona almonds, house sourdough.', '610 kcal', 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80'],
  ['Signature Horizon Espresso Martini', 'Beverages', 18.00, '5 mins', true, 'Grey Goose vodka, freshly pulled single-origin espresso, Kahlúa, dark chocolate rim.', '210 kcal', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80'],
  ['Ethiopian Single-Origin Yirgacheffe Roast', 'Beverages', 8.00, '5 mins', true, 'Handcrafted pour-over with jasmine floral notes, bergamot, and sweet peach undertones.', '5 kcal', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80'],
  ['Imperial Grand Seafood Platter & Tasting', 'Chef Special', 95.00, '35 mins', true, 'Whole rock lobster, king crab legs, oysters, tiger prawns, and sea urchin with champagne pairings.', '1150 kcal', 'https://images.unsplash.com/photo-1559737558-2453e9a56cb6?w=600&q=80']
];

async function seed() {
  for (const d of dishes) {
    const exist = await query('SELECT id FROM menu_items WHERE name = $1', [d[0]]);
    if (exist.rows.length === 0) {
      await query(
        `INSERT INTO menu_items (name, category, price, prep_time, in_stock, description, calories, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        d
      );
    }
  }

  // Ensure room categories
  const categories = [
    ['Single Classic', 1500, '1 Person', 'Elegantly appointed urban haven featuring bespoke Italian millwork and city skyline vistas.', 'Single Bed • City View • Espresso Machine', '/images/room1.jpg'],
    ['Single Deluxe', 2200, '1 Person', 'Private retreat overlooking quiet interior botanical courtyard with marble shower.', 'Queen Bed • Garden Courtyard • Rain Shower', '/images/room2.jpg'],
    ['Double Deluxe', 3500, '2 Adults', 'Expansive suite featuring dual vanities, soaking tub and private promenade balcony.', 'King Bed • Balcony • Marble Bath', '/images/room3.jpg'],
    ['Double Executive', 4800, '2 Adults, 1 Child', 'Executive-level luxury with dedicated workstation, lounge alcove, and high-fidelity acoustics.', 'King Bed • Oceanfront • Lounge Area • B&O Audio', '/images/room4.jpg'],
    ['Luxury Suite', 6800, '4 Persons', 'Two-bedroom architectural triumph featuring limestone fireplace and dedicated 24h butler service.', 'Master King + Twin • Fireplace • Private Butler', '/images/room5.jpg'],
    ['Penthouse Panoramic', 8500, '6 Persons', 'Top-floor expansive luxury boasting 360-degree waterfront wrap terrace and chef kitchen.', '3 En-Suite Bedrooms • 360° Terrace • Chef Kitchen', '/images/room6.jpg'],
    ['Presidential Penthouse', 10000, '6 Persons', 'The pinnacle of private luxury: full private floor, direct helipad access, and cedar spa.', 'Full Floor Luxury • Helipad Access • Private Spa', '/images/room7.jpg']
  ];

  for (const c of categories) {
    const exist = await query('SELECT id FROM room_categories WHERE name = $1', [c[0]]);
    if (exist.rows.length === 0) {
      await query(
        `INSERT INTO room_categories (name, base_rate, capacity, description, features, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        c
      );
    }
  }

  const menu = await query('SELECT id, name, category, price FROM menu_items ORDER BY id ASC');
  const cats = await query('SELECT id, name FROM room_categories ORDER BY id ASC');
  console.log('✅ Menu items seeded:', menu.rows.length);
  console.log('✅ Room categories seeded:', cats.rows.length);
  await pool.end();
}

seed().catch(console.error);
