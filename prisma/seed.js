const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ameer Muaviya Burger Point database...');

  // Shop Settings
  await prisma.shopSetting.upsert({
    where: { id: 'default_setting' },
    update: {},
    create: {
      id: 'default_setting',
      nameEn: 'Ameer Muaviya Burger Point',
      nameUr: 'امیر معاویہ برگر پوائنٹ',
      phone: '0300-9642811',
      locationEn: 'Main Bazaar, Near Al-Razi Hospital Road, Nokhar',
      locationUr: 'مین بازار، نزْد الرازی ہسپتال روڈ، نوکھر',
      openTime: '12:00 PM',
      closeTime: '12:00 AM',
      isOpen: true,
      announcement: 'خوش آمدید! گرما گرم اور خستہ انڈہ برگر، چکن برگر اور شاورما کے لیے ابھی آرڈر کریں - نوکھر میں ہوم ڈلیوری دستیاب ہے!',
    },
  });

  // Sample initial food items
  const items = [
    {
      id: 'item_single_egg',
      nameEn: 'Single Egg Burger',
      nameUr: 'سنگل انڈہ برگر (انڈہ شامی)',
      description: 'Crispy fried egg, spiced beef/chicken shami kabab, crunchy onion, coleslaw, mint raita & special tangy burger chutney on a toasted sesame bun.',
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
      description: 'Double golden fried eggs, double shami kabab, fresh crispy salad, secret burger spice blend, creamy mayo & zesty desi raita.',
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
      description: 'Golden crunchy chicken breast fillet, melted cheddar cheese, fresh iceberg lettuce, and signature spicy garlic mayo in a soft brioche bun.',
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
      description: 'Succulent marinated grilled chicken, pickled cucumber, crispy fries, special garlic sauce (Toum), wrapped in soft fresh pita bread.',
      price: 170,
      category: 'Shawarma',
      image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=800&q=80',
      isAvailable: true,
      isFeatured: true,
      sortOrder: 4,
    },
  ];

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
