const { neon } = require('@neondatabase/serverless');

const url =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0GSy1rCPtmNJ@ep-sparkling-bonus-ay88nvqy-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(url);

async function initNeonTables() {
  console.log('Connecting to Neon PostgreSQL database...');

  await sql`
    CREATE TABLE IF NOT EXISTS "ShopSetting" (
      "id" TEXT PRIMARY KEY,
      "nameEn" TEXT NOT NULL,
      "nameUr" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "locationEn" TEXT NOT NULL,
      "locationUr" TEXT NOT NULL,
      "openTime" TEXT NOT NULL,
      "closeTime" TEXT NOT NULL,
      "isOpen" BOOLEAN NOT NULL DEFAULT true,
      "announcement" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "MenuItem" (
      "id" TEXT PRIMARY KEY,
      "nameEn" TEXT NOT NULL,
      "nameUr" TEXT NOT NULL,
      "description" TEXT,
      "price" DOUBLE PRECISION NOT NULL,
      "category" TEXT NOT NULL DEFAULT 'Burgers',
      "image" TEXT NOT NULL,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "isFeatured" BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT PRIMARY KEY,
      "orderNumber" SERIAL,
      "customerName" TEXT NOT NULL,
      "customerPhone" TEXT NOT NULL,
      "customerAddress" TEXT NOT NULL,
      "specialNotes" TEXT,
      "items" JSONB NOT NULL,
      "totalAmount" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  console.log('✅ Tables created in Neon PostgreSQL!');

  // Check Settings
  const settings = await sql`SELECT * FROM "ShopSetting" WHERE "id" = 'default_setting'`;
  if (settings.length === 0) {
    await sql`
      INSERT INTO "ShopSetting" ("id", "nameEn", "nameUr", "phone", "locationEn", "locationUr", "openTime", "closeTime", "isOpen", "announcement")
      VALUES (
        'default_setting',
        'Ameer Muaviya Burger Point',
        'امیر معاویہ برگر پوائنٹ',
        '0300-9642811',
        'Main Bazaar, Near Al-Razi Hospital Road, Nokhar',
        'مین بازار، نزْد الرازی ہسپتال روڈ، نوکھر',
        '12:00 PM',
        '12:00 AM',
        true,
        'خوش آمدید! گرما گرم اور خستہ انڈہ برگر، چکن برگر اور شاورما کے لیے ابھی آرڈر کریں - نوکھر میں ہوم ڈلیوری دستیاب ہے!'
      )
    `;
    console.log('✅ Default Shop Settings inserted!');
  }

  // Check Menu
  const countMenu = await sql`SELECT count(*) FROM "MenuItem"`;
  if (parseInt(countMenu[0].count) === 0) {
    const items = [
      {
        id: 'item_single_egg',
        nameEn: 'Single Egg Burger',
        nameUr: 'سنگل انڈہ برگر (انڈہ شامی)',
        description:
          'Crispy fried egg, spiced beef/chicken shami kabab, crunchy onion, coleslaw, mint raita & special tangy burger chutney on a toasted sesame bun.',
        price: 130,
        category: 'Burgers',
        image: '/images/single-egg-burger.jpg',
        isAvailable: true,
        isFeatured: true,
        sortOrder: 1,
      },
      {
        id: 'item_double_egg',
        nameEn: 'Double Egg Burger',
        nameUr: 'ڈبل انڈہ برگر (اسپیشل)',
        description:
          'Double golden fried eggs, double shami kabab, fresh crispy salad, secret burger spice blend, creamy mayo & zesty desi raita.',
        price: 180,
        category: 'Burgers',
        image: '/images/double-egg-burger.jpg',
        isAvailable: true,
        isFeatured: true,
        sortOrder: 2,
      },
      {
        id: 'item_chicken_burger',
        nameEn: 'Crispy Chicken Zinger Burger',
        nameUr: 'چکن زنگر برگر',
        description:
          'Golden crunchy chicken breast fillet, melted cheddar cheese, fresh iceberg lettuce, and signature spicy garlic mayo in a soft brioche bun.',
        price: 260,
        category: 'Burgers',
        image: '/images/crispy-chicken-burger.jpg',
        isAvailable: true,
        isFeatured: true,
        sortOrder: 3,
      },
      {
        id: 'item_shawarma_special',
        nameEn: 'Special Chicken Shawarma',
        nameUr: 'اسپیشل چکن شاورما',
        description:
          'Succulent marinated grilled chicken, pickled cucumber, crispy fries, special garlic sauce (Toum), wrapped in soft fresh pita bread.',
        price: 170,
        category: 'Shawarma',
        image:
          'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        isFeatured: true,
        sortOrder: 4,
      },
      {
        id: 'item_cheese_shawarma',
        nameEn: 'Chicken Cheese Shawarma',
        nameUr: 'چکن پنیر شاورما (چیزی)',
        description:
          'Shredded roasted spiced chicken loaded with melted mozzarella & cheddar cheese, garlic mayo and hot chili sauce.',
        price: 220,
        category: 'Shawarma',
        image:
          'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        isFeatured: false,
        sortOrder: 5,
      },
      {
        id: 'item_masala_fries',
        nameEn: 'Crispy Masala Fries',
        nameUr: 'کرسپی مصالحہ فرائز',
        description:
          'Golden crispy potato chips tossed in special Nokhar chaat masala and herbs, served with spicy garlic ketchup.',
        price: 120,
        category: 'Fries & Sides',
        image:
          'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        isFeatured: false,
        sortOrder: 6,
      },
      {
        id: 'item_chicken_roll',
        nameEn: 'Chicken Paratha Roll',
        nameUr: 'چکن پراٹھا رول',
        description:
          'Crispy fried paratha stuffed with juicy chicken boti chunks, sliced red onions and thick mint chutney.',
        price: 210,
        category: 'Shawarma',
        image:
          'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        isFeatured: false,
        sortOrder: 7,
      },
      {
        id: 'item_cold_drinks',
        nameEn: 'Chilled Soft Drink (500ml)',
        nameUr: 'ٹھنڈی کولڈ ڈرنک (پیپسی / 7 اپ / میرنڈا)',
        description:
          'Ice cold refreshing beverage bottle (Pepsi, 7Up, Mirinda, Mountain Dew, or Pakola).',
        price: 90,
        category: 'Drinks',
        image:
          'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
        isFeatured: false,
        sortOrder: 8,
      },
    ];

    for (const item of items) {
      await sql`
        INSERT INTO "MenuItem" ("id", "nameEn", "nameUr", "description", "price", "category", "image", "isAvailable", "isFeatured", "sortOrder")
        VALUES (${item.id}, ${item.nameEn}, ${item.nameUr}, ${item.description}, ${item.price}, ${item.category}, ${item.image}, ${item.isAvailable}, ${item.isFeatured}, ${item.sortOrder})
      `;
    }
    console.log('✅ Menu items inserted into Neon!');
  }

  console.log('🎉 Neon PostgreSQL is 100% ready!');
}

initNeonTables().catch((err) => {
  console.error('Error initializing Neon:', err);
  process.exit(1);
});
