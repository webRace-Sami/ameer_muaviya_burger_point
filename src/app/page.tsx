'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ShopBanner } from '@/components/ShopBanner';
import { MenuGrid } from '@/components/MenuGrid';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { ShopSetting, MenuItem, CartItem, Order } from '@/lib/types';
import { initialShopSetting, initialMenuItems } from '@/lib/seed-data';
import { Phone, MapPin, Search, Clock, CheckCircle2, AlertTriangle, RefreshCw, ChefHat, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [shopSetting, setShopSetting] = useState<ShopSetting>(initialShopSetting);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Customer order status tracker search
  const [searchPhoneOrId, setSearchPhoneOrId] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null);
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);

  // Load shop settings and menu items
  const loadData = useCallback(async () => {
    try {
      const [shopRes, menuRes] = await Promise.all([
        fetch('/api/shop'),
        fetch('/api/menu'),
      ]);

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        if (shopData.success && shopData.data) {
          setShopSetting(shopData.data);
        }
      }

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        if (menuData.success && menuData.data) {
          setMenuItems(menuData.data);
        }
      }
    } catch (err) {
      console.warn('Using local fallback seed data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Load persisted cart from localStorage
    try {
      const savedCart = localStorage.getItem('ameer_burger_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {}
  }, [loadData]);

  // Save cart changes
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('ameer_burger_cart', JSON.stringify(newCart));
    } catch {}
  };

  const handleAddToCart = (item: MenuItem | CartItem) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      const updated = cart.map((c) =>
        c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      );
      updateCart(updated);
    } else {
      const newItem: CartItem = {
        id: item.id,
        nameEn: item.nameEn,
        nameUr: item.nameUr,
        price: item.price,
        image: item.image,
        quantity: 1,
      };
      updateCart([...cart, newItem]);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    const existing = cart.find((c) => c.id === itemId);
    if (!existing) return;
    if (existing.quantity > 1) {
      const updated = cart.map((c) =>
        c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
      updateCart(updated);
    } else {
      const updated = cart.filter((c) => c.id !== itemId);
      updateCart(updated);
    }
  };

  const handleClearCart = () => {
    updateCart([]);
  };

  // Search existing order by phone number or ID
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhoneOrId.trim()) return;

    setIsSearchingOrder(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const query = searchPhoneOrId.trim().toLowerCase();
          const matches = data.data.filter((o: Order) => {
            const matchId = String(o.orderNumber) === query || o.id.toLowerCase().includes(query);
            const matchPhone = o.customerPhone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, ''));
            const matchName = o.customerName.toLowerCase().includes(query);
            return matchId || matchPhone || matchName;
          });
          setSearchedOrders(matches);
        }
      }
    } catch (err) {
      console.error('Order tracking search failed:', err);
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Header with Live Clock & Date */}
      <Header
        shopSetting={shopSetting}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        {/* Banner Section */}
        <ShopBanner shopSetting={shopSetting} />

        {/* Menu Grid Section */}
        <MenuGrid
          items={menuItems}
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
        />

        {/* Customer Live Order Tracking Search Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" id="track-order">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#131c30] to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" /> آرڈر کا اسٹیٹس معلوم کریں
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-white">
                Track Your Order (آرڈر ٹریکنگ)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-urdu">
                اپنا موبائل نمبر یا آرڈر نمبر لکھ کر چیک کریں کہ آپ کا کھانا کچن میں تیار ہو رہا ہے یا نکل چکا ہے۔
              </p>

              <form onSubmit={handleTrackOrder} className="flex gap-2 max-w-md mx-auto pt-2">
                <input
                  type="text"
                  placeholder="موبائل نمبر یا آرڈر نمبر (e.g. 0300... or 101)"
                  value={searchPhoneOrId}
                  onChange={(e) => setSearchPhoneOrId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isSearchingOrder}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-colors shrink-0"
                >
                  {isSearchingOrder ? 'تلاش...' : 'چیک کریں'}
                </button>
              </form>

              {/* Searched Orders Results */}
              {searchedOrders !== null && (
                <div className="mt-6 text-left space-y-3">
                  {searchedOrders.length === 0 ? (
                    <div className="text-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 font-urdu">
                      اس نمبر پر کوئی فعال آرڈر نہیں ملا۔
                    </div>
                  ) : (
                    searchedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              آرڈر #{order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                order.status === 'PENDING'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                  : order.status === 'COOKING'
                                  ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                                  : order.status === 'READY'
                                  ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                                  : order.status === 'DELIVERED'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-950 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {order.status === 'PENDING' && 'نیا آرڈر (Pending)'}
                              {order.status === 'COOKING' && 'باورچی خانہ میں تیاری جاری (Cooking)'}
                              {order.status === 'READY' && 'تیار / ڈلیوری پر روانہ (Out for Delivery)'}
                              {order.status === 'DELIVERED' && 'ڈلیور ہو گیا (Completed)'}
                              {order.status === 'CANCELLED' && 'منسوخ شدہ (Cancelled)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 font-urdu">
                            گاہک: {order.customerName} • پتہ: {order.customerAddress}
                          </p>
                          <p className="text-[11px] text-amber-400 mt-0.5">
                            {order.items.map((i) => `${i.nameEn} (x${i.quantity})`).join(', ')}
                          </p>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <p className="text-xs text-slate-400">کل رقم</p>
                          <p className="text-base font-black text-amber-400 font-mono">
                            Rs. {order.totalAmount}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        shopSetting={shopSetting}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderSuccess={(order) => setPlacedOrder(order)}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={placedOrder}
        shopSetting={shopSetting}
        onClose={() => setPlacedOrder(null)}
      />

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between bg-gradient-to-r from-amber-500 to-flame-500 text-black font-extrabold p-3.5 rounded-2xl shadow-2xl shadow-amber-500/40 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="bg-black text-amber-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {cartCount} آئٹمز
              </span>
              <span className="font-bold text-sm">آرڈر پلیٹ دیکھیں</span>
            </div>
            <span className="font-mono text-sm font-black bg-black/20 px-2.5 py-1 rounded-xl">
              Rs. {cartTotal}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-white text-sm">
              {shopSetting.nameEn} ({shopSetting.nameUr})
            </p>
            <p className="text-slate-400 font-urdu mt-0.5">
              لوکیشن: {shopSetting.locationUr} ({shopSetting.locationEn})
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a href={`tel:${shopSetting.phone}`} className="text-amber-400 hover:underline">
              📞 {shopSetting.phone}
            </a>
            <span>•</span>
            <span className="text-slate-400">
              ⏰ {shopSetting.openTime} – {shopSetting.closeTime}
            </span>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Ameer Muaviya Burger Point. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
