import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { initialShopSetting, initialMenuItems } from './seed-data';
import { ShopSetting, MenuItem, Order, OrderStatus } from './types';

// Global Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// File-based persistence fallback store location
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreSchema {
  shopSetting: ShopSetting;
  menuItems: MenuItem[];
  orders: Order[];
}

function ensureDataFile(): StoreSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initialStore: StoreSchema = {
        shopSetting: initialShopSetting,
        menuItems: initialMenuItems,
        orders: [
          {
            id: 'ord_demo_1',
            orderNumber: 101,
            customerName: 'Muhammad Usman (محمد عثمان)',
            customerPhone: '0302-7654321',
            customerAddress: 'Al-Razi Chowk, Nokhar Road',
            specialNotes: 'زیادہ پیاز اور اسپیشل ساس ڈالیں',
            items: [
              { id: 'item_single_egg', nameEn: 'Single Egg Burger', nameUr: 'سنگل انڈہ برگر (انڈہ شامی)', price: 130, quantity: 2 },
              { id: 'item_shawarma_special', nameEn: 'Special Chicken Shawarma', nameUr: 'اسپیشل چکن شاورما', price: 170, quantity: 1 }
            ],
            totalAmount: 430,
            status: 'COOKING',
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          }
        ],
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
      return initialStore;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content) as StoreSchema;
  } catch (err) {
    console.error('Error accessing fallback store:', err);
    return {
      shopSetting: initialShopSetting,
      menuItems: initialMenuItems,
      orders: [],
    };
  }
}

function saveStore(store: StoreSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving fallback store:', err);
  }
}

// Check if Prisma Database is connected and working
let isPostgresHealthy: boolean | null = null;

async function checkPostgres(): Promise<boolean> {
  const url = process.env.DATABASE_URL || '';
  if (!url || url.includes('placeholder_') || url.includes('your_password')) {
    return false;
  }
  if (isPostgresHealthy !== null) return isPostgresHealthy;

  try {
    // Quick test query
    await prisma.$queryRaw`SELECT 1`;
    isPostgresHealthy = true;
    return true;
  } catch {
    isPostgresHealthy = false;
    return false;
  }
}

export const db = {
  // Shop Settings
  async getShopSetting(): Promise<ShopSetting> {
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        let setting = await prisma.shopSetting.findFirst();
        if (!setting) {
          setting = await prisma.shopSetting.create({
            data: {
              id: initialShopSetting.id,
              nameEn: initialShopSetting.nameEn,
              nameUr: initialShopSetting.nameUr,
              phone: initialShopSetting.phone,
              locationEn: initialShopSetting.locationEn,
              locationUr: initialShopSetting.locationUr,
              openTime: initialShopSetting.openTime,
              closeTime: initialShopSetting.closeTime,
              isOpen: initialShopSetting.isOpen,
              announcement: initialShopSetting.announcement,
            },
          });
        }
        return {
          id: setting.id,
          nameEn: setting.nameEn,
          nameUr: setting.nameUr,
          phone: setting.phone,
          locationEn: setting.locationEn,
          locationUr: setting.locationUr,
          openTime: setting.openTime,
          closeTime: setting.closeTime,
          isOpen: setting.isOpen,
          announcement: setting.announcement,
          updatedAt: setting.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma shop fetch failed, using local store:', err);
      }
    }
    const store = ensureDataFile();
    return store.shopSetting;
  },

  async updateShopSetting(data: Partial<ShopSetting>): Promise<ShopSetting> {
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const current = await this.getShopSetting();
        const updated = await prisma.shopSetting.update({
          where: { id: current.id },
          data: {
            nameEn: data.nameEn,
            nameUr: data.nameUr,
            phone: data.phone,
            locationEn: data.locationEn,
            locationUr: data.locationUr,
            openTime: data.openTime,
            closeTime: data.closeTime,
            isOpen: data.isOpen !== undefined ? data.isOpen : undefined,
            announcement: data.announcement,
          },
        });
        return {
          ...updated,
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma shop update failed, using local store:', err);
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

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const count = await prisma.menuItem.count();
        if (count === 0) {
          // Seed items to Neon PostgreSQL
          for (const item of initialMenuItems) {
            await prisma.menuItem.create({
              data: {
                id: item.id,
                nameEn: item.nameEn,
                nameUr: item.nameUr,
                description: item.description,
                price: item.price,
                category: item.category,
                image: item.image,
                isAvailable: item.isAvailable,
                isFeatured: item.isFeatured ?? false,
                sortOrder: item.sortOrder ?? 0,
              },
            });
          }
        }
        const items = await prisma.menuItem.findMany({
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });
        return items.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn('Prisma menu fetch failed, using local store:', err);
      }
    }
    const store = ensureDataFile();
    return store.menuItems;
  },

  async addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const hasPg = await checkPostgres();
    const id = `item_${Date.now()}`;
    if (hasPg) {
      try {
        const created = await prisma.menuItem.create({
          data: {
            nameEn: item.nameEn,
            nameUr: item.nameUr,
            description: item.description || null,
            price: Number(item.price),
            category: item.category || 'Burgers',
            image: item.image || '/images/single-egg-burger.jpg',
            isAvailable: item.isAvailable ?? true,
            isFeatured: item.isFeatured ?? false,
            sortOrder: item.sortOrder ?? 0,
          },
        });
        return {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma menu add failed, using local store:', err);
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
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const updated = await prisma.menuItem.update({
          where: { id },
          data: {
            ...updates,
            price: updates.price !== undefined ? Number(updates.price) : undefined,
          },
        });
        return {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma menu update failed, using local store:', err);
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
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        await prisma.menuItem.delete({ where: { id } });
        return true;
      } catch (err) {
        console.warn('Prisma menu delete failed, using local store:', err);
      }
    }
    const store = ensureDataFile();
    const prevLen = store.menuItems.length;
    store.menuItems = store.menuItems.filter((i) => i.id !== id);
    saveStore(store);
    return store.menuItems.length < prevLen;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const orders = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerAddress: o.customerAddress,
          specialNotes: o.specialNotes,
          items: o.items as any,
          totalAmount: o.totalAmount,
          status: o.status as OrderStatus,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn('Prisma order fetch failed, using local store:', err);
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
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const created = await prisma.order.create({
          data: {
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerAddress: data.customerAddress,
            specialNotes: data.specialNotes || null,
            items: data.items,
            totalAmount: data.totalAmount,
            status: 'PENDING',
          },
        });
        return {
          id: created.id,
          orderNumber: created.orderNumber,
          customerName: created.customerName,
          customerPhone: created.customerPhone,
          customerAddress: created.customerAddress,
          specialNotes: created.specialNotes,
          items: created.items as any,
          totalAmount: created.totalAmount,
          status: created.status as OrderStatus,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma create order failed, using local store:', err);
      }
    }
    const store = ensureDataFile();
    const maxNumber = store.orders.reduce((max, o) => Math.max(max, o.orderNumber || 100), 100);
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
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
    const hasPg = await checkPostgres();
    if (hasPg) {
      try {
        const updated = await prisma.order.update({
          where: { id },
          data: { status },
        });
        return {
          id: updated.id,
          orderNumber: updated.orderNumber,
          customerName: updated.customerName,
          customerPhone: updated.customerPhone,
          customerAddress: updated.customerAddress,
          specialNotes: updated.specialNotes,
          items: updated.items as any,
          totalAmount: updated.totalAmount,
          status: updated.status as OrderStatus,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn('Prisma order status update failed, using local store:', err);
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
