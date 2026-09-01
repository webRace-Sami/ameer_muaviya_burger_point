import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { initialShopSetting, initialMenuItems } from './seed-data';
import { ShopSetting, MenuItem, Order, OrderStatus } from './types';

// Neon database connection URL
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_0GSy1rCPtmNJ@ep-sparkling-bonus-ay88nvqy-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

function getSql() {
  if (
    !DATABASE_URL ||
    DATABASE_URL.includes('placeholder_') ||
    DATABASE_URL.includes('your_password')
  ) {
    return null;
  }
  try {
    return neon(DATABASE_URL);
  } catch (err) {
    console.warn('Neon connection failed:', err);
    return null;
  }
}

// In-Memory / File Fallback Store
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreSchema {
  shopSetting: ShopSetting;
  menuItems: MenuItem[];
  orders: Order[];
}

let inMemoryStore: StoreSchema = {
  shopSetting: initialShopSetting,
  menuItems: initialMenuItems,
  orders: [],
};

function ensureDataFile(): StoreSchema {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore;
    }
  } catch {}
  return inMemoryStore;
}

function saveStore(store: StoreSchema) {
  inMemoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch {}
}

export const db = {
  // ==========================================
  // SHOP SETTINGS
  // ==========================================
  async getShopSetting(): Promise<ShopSetting> {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM "ShopSetting" WHERE "id" = 'default_setting' LIMIT 1
        `;
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            nameEn: r.nameEn,
            nameUr: r.nameUr,
            phone: r.phone,
            locationEn: r.locationEn,
            locationUr: r.locationUr,
            openTime: r.openTime,
            closeTime: r.closeTime,
            isOpen: Boolean(r.isOpen),
            announcement: r.announcement,
            updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
          };
        } else {
          // Insert initial setting
          await sql`
            INSERT INTO "ShopSetting" ("id", "nameEn", "nameUr", "phone", "locationEn", "locationUr", "openTime", "closeTime", "isOpen", "announcement")
            VALUES (
              ${initialShopSetting.id},
              ${initialShopSetting.nameEn},
              ${initialShopSetting.nameUr},
              ${initialShopSetting.phone},
              ${initialShopSetting.locationEn},
              ${initialShopSetting.locationUr},
              ${initialShopSetting.openTime},
              ${initialShopSetting.closeTime},
              ${initialShopSetting.isOpen},
              ${initialShopSetting.announcement}
            )
          `;
          return initialShopSetting;
        }
      } catch (err) {
        console.warn('Neon shop fetch error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    return store.shopSetting;
  },

  async updateShopSetting(data: Partial<ShopSetting>): Promise<ShopSetting> {
    const sql = getSql();
    if (sql) {
      try {
        const current = await this.getShopSetting();
        const updated = { ...current, ...data };
        await sql`
          INSERT INTO "ShopSetting" ("id", "nameEn", "nameUr", "phone", "locationEn", "locationUr", "openTime", "closeTime", "isOpen", "announcement", "updatedAt")
          VALUES (
            'default_setting',
            ${updated.nameEn},
            ${updated.nameUr},
            ${updated.phone},
            ${updated.locationEn},
            ${updated.locationUr},
            ${updated.openTime},
            ${updated.closeTime},
            ${updated.isOpen},
            ${updated.announcement},
            NOW()
          )
          ON CONFLICT ("id") DO UPDATE SET
            "nameEn" = EXCLUDED."nameEn",
            "nameUr" = EXCLUDED."nameUr",
            "phone" = EXCLUDED."phone",
            "locationEn" = EXCLUDED."locationEn",
            "locationUr" = EXCLUDED."locationUr",
            "openTime" = EXCLUDED."openTime",
            "closeTime" = EXCLUDED."closeTime",
            "isOpen" = EXCLUDED."isOpen",
            "announcement" = EXCLUDED."announcement",
            "updatedAt" = NOW()
        `;
        return updated;
      } catch (err) {
        console.warn('Neon shop update error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    store.shopSetting = {
      ...store.shopSetting,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.shopSetting;
  },

  // ==========================================
  // MENU ITEMS
  // ==========================================
  async getMenuItems(): Promise<MenuItem[]> {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM "MenuItem" ORDER BY "sortOrder" ASC, "createdAt" ASC
        `;
        if (rows.length === 0) {
          // Seed menu items
          for (const item of initialMenuItems) {
            await sql`
              INSERT INTO "MenuItem" ("id", "nameEn", "nameUr", "description", "price", "category", "image", "isAvailable", "isFeatured", "sortOrder")
              VALUES (${item.id}, ${item.nameEn}, ${item.nameUr}, ${item.description}, ${item.price}, ${item.category}, ${item.image}, ${item.isAvailable}, ${item.isFeatured}, ${item.sortOrder})
            `;
          }
          return initialMenuItems;
        }
        return rows.map((r) => ({
          id: r.id,
          nameEn: r.nameEn,
          nameUr: r.nameUr,
          description: r.description,
          price: Number(r.price),
          category: r.category,
          image: r.image,
          isAvailable: Boolean(r.isAvailable),
          isFeatured: Boolean(r.isFeatured),
          sortOrder: Number(r.sortOrder || 0),
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('Neon menu fetch error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    return store.menuItems;
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const id = `item_${Date.now()}`;
    const sql = getSql();
    if (sql) {
      try {
        await sql`
          INSERT INTO "MenuItem" ("id", "nameEn", "nameUr", "description", "price", "category", "image", "isAvailable", "isFeatured", "sortOrder")
          VALUES (${id}, ${item.nameEn}, ${item.nameUr}, ${item.description || null}, ${Number(item.price)}, ${item.category || 'Burgers'}, ${item.image || '/images/single-egg-burger.jpg'}, ${item.isAvailable ?? true}, ${item.isFeatured ?? false}, ${item.sortOrder ?? 0})
        `;
        return {
          ...item,
          id,
          price: Number(item.price),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn('Neon add item error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    const newItem: MenuItem = {
      ...item,
      id,
      price: Number(item.price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.menuItems.push(newItem);
    saveStore(store);
    return newItem;
  },

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`SELECT * FROM "MenuItem" WHERE "id" = ${id} LIMIT 1`;
        if (rows.length > 0) {
          const current = rows[0];
          const nameEn = updates.nameEn !== undefined ? updates.nameEn : current.nameEn;
          const nameUr = updates.nameUr !== undefined ? updates.nameUr : current.nameUr;
          const description = updates.description !== undefined ? updates.description : current.description;
          const price = updates.price !== undefined ? Number(updates.price) : Number(current.price);
          const category = updates.category !== undefined ? updates.category : current.category;
          const image = updates.image !== undefined ? updates.image : current.image;
          const isAvailable = updates.isAvailable !== undefined ? updates.isAvailable : current.isAvailable;
          const isFeatured = updates.isFeatured !== undefined ? updates.isFeatured : current.isFeatured;

          await sql`
            UPDATE "MenuItem" SET
              "nameEn" = ${nameEn},
              "nameUr" = ${nameUr},
              "description" = ${description},
              "price" = ${price},
              "category" = ${category},
              "image" = ${image},
              "isAvailable" = ${isAvailable},
              "isFeatured" = ${isFeatured},
              "updatedAt" = NOW()
            WHERE "id" = ${id}
          `;

          return {
            id,
            nameEn,
            nameUr,
            description,
            price,
            category,
            image,
            isAvailable: Boolean(isAvailable),
            isFeatured: Boolean(isFeatured),
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Neon update item error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    const index = store.menuItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    store.menuItems[index] = {
      ...store.menuItems[index],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : store.menuItems[index].price,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    return store.menuItems[index];
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    const sql = getSql();
    if (sql) {
      try {
        await sql`DELETE FROM "MenuItem" WHERE "id" = ${id}`;
        return true;
      } catch (err) {
        console.warn('Neon delete item error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    const prevLen = store.menuItems.length;
    store.menuItems = store.menuItems.filter((i) => i.id !== id);
    saveStore(store);
    return store.menuItems.length < prevLen;
  },

  // ==========================================
  // ORDERS
  // ==========================================
  async getOrders(): Promise<Order[]> {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM "Order" ORDER BY "createdAt" DESC LIMIT 100
        `;
        return rows.map((r) => ({
          id: r.id,
          orderNumber: Number(r.orderNumber),
          customerName: r.customerName,
          customerPhone: r.customerPhone,
          customerAddress: r.customerAddress,
          specialNotes: r.specialNotes,
          items: (typeof r.items === 'string' ? JSON.parse(r.items) : r.items) as any,
          totalAmount: Number(r.totalAmount),
          status: r.status as OrderStatus,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('Neon orders fetch error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    return store.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createOrder(data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    specialNotes?: string;
    items: { id: string; nameEn: string; nameUr: string; price: number; quantity: number }[];
    totalAmount: number;
  }): Promise<Order> {
    const id = `ord_${Date.now()}`;
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          INSERT INTO "Order" ("id", "customerName", "customerPhone", "customerAddress", "specialNotes", "items", "totalAmount", "status")
          VALUES (${id}, ${data.customerName}, ${data.customerPhone}, ${data.customerAddress}, ${data.specialNotes || null}, ${JSON.stringify(data.items)}, ${Number(data.totalAmount)}, 'PENDING')
          RETURNING "orderNumber", "createdAt"
        `;
        const orderNumber = rows[0]?.orderNumber || 101;
        return {
          id,
          orderNumber: Number(orderNumber),
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          specialNotes: data.specialNotes || null,
          items: data.items,
          totalAmount: Number(data.totalAmount),
          status: 'PENDING',
          createdAt: rows[0]?.createdAt ? new Date(rows[0].createdAt).toISOString() : new Date().toISOString(),
        };
      } catch (err) {
        console.warn('Neon create order error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    const maxNumber = store.orders.reduce((max, o) => Math.max(max, o.orderNumber || 100), 100);
    const newOrder: Order = {
      id,
      orderNumber: maxNumber + 1,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      specialNotes: data.specialNotes || null,
      items: data.items,
      totalAmount: data.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.orders.unshift(newOrder);
    saveStore(store);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const sql = getSql();
    if (sql) {
      try {
        await sql`
          UPDATE "Order" SET "status" = ${status}, "updatedAt" = NOW() WHERE "id" = ${id}
        `;
        const rows = await sql`SELECT * FROM "Order" WHERE "id" = ${id} LIMIT 1`;
        if (rows.length > 0) {
          const r = rows[0];
          return {
            id: r.id,
            orderNumber: Number(r.orderNumber),
            customerName: r.customerName,
            customerPhone: r.customerPhone,
            customerAddress: r.customerAddress,
            specialNotes: r.specialNotes,
            items: (typeof r.items === 'string' ? JSON.parse(r.items) : r.items) as any,
            totalAmount: Number(r.totalAmount),
            status: r.status as OrderStatus,
            createdAt: new Date(r.createdAt).toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('Neon order status update error, using fallback:', err);
      }
    }
    const store = ensureDataFile();
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveStore(store);
    return order;
  },
};
