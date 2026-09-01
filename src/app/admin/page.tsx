'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChefHat,
  Utensils,
  Settings,
  Clock,
  Calendar,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Printer,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  Upload,
  Link2,
  Save,
  Check,
  X,
  Smartphone,
  Eye
} from 'lucide-react';
import { ShopSetting, MenuItem, Order, OrderStatus } from '@/lib/types';
import { initialShopSetting, initialMenuItems } from '@/lib/seed-data';

export default function AdminPage() {
  // Authentication PIN
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Admin View: 'KITCHEN' (Orders) | 'MENU' (Food Items) | 'SETTINGS' (Shop Details & Timings)
  const [activeTab, setActiveTab] = useState<'KITCHEN' | 'MENU' | 'SETTINGS'>('KITCHEN');

  // Core Data States
  const [shopSetting, setShopSetting] = useState<ShopSetting>(initialShopSetting);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingSetting, setIsSavingSetting] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Sound Alerts
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevOrdersCountRef = useRef<number>(0);

  // Live Date & Time
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Menu Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageMode, setImageMode] = useState<'LINK' | 'UPLOAD'>('LINK');
  const [itemFormData, setItemFormData] = useState({
    nameEn: '',
    nameUr: '',
    price: '',
    category: 'Burgers',
    image: '',
    description: '',
    isAvailable: true,
    isFeatured: false,
  });

  // Shop Settings Form State
  const [settingsForm, setSettingsForm] = useState<ShopSetting>(initialShopSetting);

  // Printable Receipt Order
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // File Input Ref for Mobile Gallery
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Local Storage PIN on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('ameer_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Update Live Date & Time
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Play Kitchen Order Notification Audio
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {}
  }, [soundEnabled]);

  // Load All Admin Data
  const fetchData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true);
      const [shopRes, menuRes, ordersRes] = await Promise.all([
        fetch('/api/shop'),
        fetch('/api/menu'),
        fetch('/api/orders'),
      ]);

      if (shopRes.ok) {
        const shopData = await shopRes.json();
        if (shopData.success && shopData.data) {
          setShopSetting(shopData.data);
          if (!isPolling) setSettingsForm(shopData.data);
        }
      }

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        if (menuData.success && menuData.data) {
          setMenuItems(menuData.data);
        }
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && Array.isArray(ordersData.data)) {
          const newOrders: Order[] = ordersData.data;

          // If new orders arrived during polling, trigger alert sound
          if (
            isPolling &&
            newOrders.length > prevOrdersCountRef.current &&
            prevOrdersCountRef.current > 0
          ) {
            playAlertSound();
          }
          prevOrdersCountRef.current = newOrders.length;
          setOrders(newOrders);
        }
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      if (!isPolling) setIsLoading(false);
    }
  }, [playAlertSound]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const pollInterval = setInterval(() => {
        fetchData(true);
      }, 6000);
      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, fetchData]);

  // Handle Login PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === process.env.NEXT_PUBLIC_ADMIN_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ameer_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('غلط پن کوڈ! براہ کرم درست پاس ورڈ درج کریں (Default: 1234)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ameer_admin_auth');
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Toggle Menu Item In-Stock / Out-of-Stock
  const handleToggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.isAvailable;
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: newStatus } : i))
        );
      }
    } catch (err) {
      console.error('Failed to toggle stock:', err);
    }
  };

  // Delete Menu Item
  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm('کیا آپ واقعی یہ کھانا مینو سے ڈیلیٹ کرنا چاہتے ہیں؟')) return;
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMenuItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  // Open Edit/Add Modal
  const openItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        nameEn: item.nameEn,
        nameUr: item.nameUr,
        price: String(item.price),
        category: item.category,
        image: item.image,
        description: item.description || '',
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured || false,
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        nameEn: '',
        nameUr: '',
        price: '',
        category: 'Burgers',
        image: '/images/single-egg-burger.jpg',
        description: '',
        isAvailable: true,
        isFeatured: false,
      });
    }
    setIsItemModalOpen(true);
  };

  // Handle Mobile Gallery Image Selection
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setItemFormData((prev) => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error('Failed to upload image from mobile gallery:', err);
      // Client side base64 fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setItemFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Save Menu Item (Create or Update)
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.nameEn || !itemFormData.price) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...itemFormData,
            price: Number(itemFormData.price),
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setMenuItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? result.data : i))
          );
        }
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...itemFormData,
            price: Number(itemFormData.price),
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setMenuItems((prev) => [...prev, result.data]);
        }
      }
      setIsItemModalOpen(false);
    } catch (err) {
      console.error('Failed to save menu item:', err);
    }
  };

  // Save Shop Settings
  const handleSaveShopSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSetting(true);
    setSaveSuccessMsg('');
    try {
      const res = await fetch('/api/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        const result = await res.json();
        setShopSetting(result.data);
        setSaveSuccessMsg('ترتیبات کامیابی سے محفوظ کر لی گئی ہیں! (Settings Saved)');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save shop settings:', err);
    } finally {
      setIsSavingSetting(false);
    }
  };

  // Print Receipt
  const handlePrint = (order: Order) => {
    setReceiptOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">ایڈمن لاگ ان</h2>
            <p className="text-xs text-amber-300 font-urdu mt-1">
              امیر معاویہ برگر پوائنٹ (نوکھر) کنٹرول پینل
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Enter Admin PIN to manage kitchen orders, food menu & shop timings
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                placeholder="درج کریں PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-center font-mono text-xl tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-400 font-urdu bg-red-950/60 p-2 rounded-xl border border-red-500/30">
                {pinError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-flame-500 hover:from-amber-400 hover:to-flame-400 text-black font-black py-3 rounded-2xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-sm"
            >
              پینل کھولیں (Unlock Panel)
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> واپس کسٹمر مینو پر جائیں
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'COOKING'
  ).length;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col pb-20 sm:pb-6">
      {/* Admin Sticky Header */}
      <header className="sticky top-0 z-40 glass-header border-b border-amber-500/20 shadow-xl">
        {/* Top Ticker: Live Time & Date */}
        <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-3 sm:px-6 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-bold">{currentTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px]">
              <span className="text-slate-400 hidden xs:inline">
                ٹائمنگ: <strong className="text-amber-300">{shopSetting.openTime} تا {shopSetting.closeTime}</strong>
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  shopSetting.isOpen
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-950 text-red-300 border border-red-500/30'
                }`}
              >
                {shopSetting.isOpen ? 'کھلا ہے • OPEN' : 'بند ہے • CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Admin Nav Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="View Customer Site"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-lg font-black text-white truncate max-w-[140px] sm:max-w-none">
                    {shopSetting.nameEn}
                  </h1>
                  <span className="bg-flame-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-urdu text-amber-300 -mt-0.5 truncate max-w-[180px] sm:max-w-none">
                  {shopSetting.nameUr} - نوکھر
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab('KITCHEN')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'KITCHEN'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>باورچی خانہ (Orders)</span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-flame-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('MENU')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'MENU'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>مینو کنٹرول (Fast Food)</span>
              </button>

              <button
                onClick={() => setActiveTab('SETTINGS')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'SETTINGS'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>دکان ترتیبات (Shop Settings)</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title={soundEnabled ? 'صوتی الرٹ آن ہے' : 'صوتی الرٹ بند ہے'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => fetchData()}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="ریفریش کریں"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 hover:bg-red-900/80 transition-colors text-[11px] sm:text-xs font-bold"
                title="لاگ آؤٹ"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* ========================================================================= */}
        {/* TAB 1: KITCHEN ORDER BOARD */}
        {/* ========================================================================= */}
        {activeTab === 'KITCHEN' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  <ChefHat className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400" />
                  Live Kitchen Order Board (باورچی خانہ)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-urdu mt-0.5">
                  تمام آنے والے آرڈرز یہاں لائیو نظر آئیں گے۔
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-xs text-slate-300 font-mono">
                  کل آرڈرز: <strong className="text-amber-300">{orders.length}</strong>
                </span>
              </div>
            </div>

            {/* Orders Feed */}
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <p className="text-4xl sm:text-5xl">🍳</p>
                <h3 className="text-base sm:text-lg font-bold text-white">کوئی فعال آرڈر نہیں ہے</h3>
                <p className="text-xs text-slate-400 font-urdu">
                  جیسے ہی کوئی گاہک نوکھر سے آن لائن آرڈر کرے گا، یہاں بیل بجے گی اور آرڈر ظاہر ہوگا۔
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {orders.map((order) => {
                  const isPending = order.status === 'PENDING';
                  const isCooking = order.status === 'COOKING';
                  const isReady = order.status === 'READY';
                  const isDelivered = order.status === 'DELIVERED';
                  const isCancelled = order.status === 'CANCELLED';

                  return (
                    <div
                      key={order.id}
                      className={`rounded-3xl p-4 sm:p-5 border flex flex-col justify-between transition-all ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : isCooking
                          ? 'bg-blue-950/20 border-blue-500/50'
                          : isReady
                          ? 'bg-purple-950/20 border-purple-500/50'
                          : isDelivered
                          ? 'bg-slate-900/60 border-slate-800 opacity-80'
                          : 'bg-red-950/10 border-red-900/40 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-black text-amber-400">
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                isPending
                                  ? 'bg-amber-500 text-black animate-pulse'
                                  : isCooking
                                  ? 'bg-blue-500 text-white'
                                  : isReady
                                  ? 'bg-purple-500 text-white'
                                  : isDelivered
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="py-3 space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <span>👤</span>
                            <span>{order.customerName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-amber-300 font-mono">
                            <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <a href={`tel:${order.customerPhone}`} className="hover:underline font-bold">
                              {order.customerPhone}
                            </a>
                            <a
                              href={`https://wa.me/92${order.customerPhone.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-md font-sans ml-auto font-bold border border-[#25D366]/30"
                            >
                              WhatsApp
                            </a>
                          </div>

                          <div className="flex items-start gap-1.5 text-slate-300 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-flame-400 shrink-0 mt-0.5" />
                            <span className="font-urdu leading-tight">{order.customerAddress}</span>
                          </div>

                          {order.specialNotes && (
                            <div className="bg-slate-950 p-2 rounded-xl border border-amber-500/30 text-[11px] text-amber-200 font-urdu mt-2">
                              <strong>ہدایات:</strong> {order.specialNotes}
                            </div>
                          )}
                        </div>

                        {/* Ordered Items */}
                        <div className="py-2 border-t border-slate-800/80 space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            کھانے کے آئٹمز:
                          </p>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs bg-slate-950/60 p-1.5 rounded-lg text-slate-200"
                              >
                                <span>
                                  {item.nameEn}{' '}
                                  <strong className="text-amber-400">x{item.quantity}</strong>
                                </span>
                                <span className="font-mono text-slate-400">
                                  Rs. {item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bill & Status Controls */}
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">کل بل (Total):</span>
                          <span className="font-mono text-base font-black text-amber-400">
                            Rs. {order.totalAmount}
                          </span>
                        </div>

                        {/* Status Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                          {isPending && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'COOKING')}
                              className="col-span-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>ککنگ شروع کریں (Start Cooking)</span>
                            </button>
                          )}

                          {isCooking && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                              className="col-span-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>تیار ہے / ڈلیوری پر بھیجیں</span>
                            </button>
                          )}

                          {isReady && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>ڈلیوری مکمل ہو گئی (Delivered)</span>
                            </button>
                          )}

                          {/* Print Receipt */}
                          <button
                            onClick={() => handlePrint(order)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl flex items-center justify-center gap-1 text-xs active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>رسید پرنٹ</span>
                          </button>

                          {/* Cancel button */}
                          {!isDelivered && !isCancelled && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                              className="bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 py-2 rounded-xl flex items-center justify-center gap-1 text-xs active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>کینسل کریں</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MENU & FAST FOOD MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'MENU' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400" />
                  Fast Food Menu Management (مینو کنٹرول)
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-urdu mt-0.5">
                  گوگل سے تصویر کا لنک ڈالیں یا موبائل گیلری سے فوٹو اپلوڈ کریں۔
                </p>
              </div>

              <button
                onClick={() => openItemModal()}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-flame-500 hover:from-amber-400 hover:to-flame-400 text-black font-black px-4 py-3 rounded-2xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all text-xs sm:text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>نیا کھانا شامل کریں (Add New Food)</span>
              </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div className="relative w-full h-44 bg-slate-950">
                    <Image
                      src={item.image || '/images/single-egg-burger.jpg'}
                      alt={item.nameEn}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300">
                      {item.category}
                    </div>

                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          item.isAvailable
                            ? 'bg-emerald-500 text-black shadow'
                            : 'bg-red-600 text-white'
                        }`}
                        title="دستیابی تبدیل کریں"
                      >
                        {item.isAvailable ? '✓ دستیاب (In Stock)' : '✕ ختم (Out of Stock)'}
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 bg-black/80 px-2.5 py-0.5 rounded-lg border border-amber-500/30 text-amber-400 font-mono font-black text-sm">
                      Rs. {item.price}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">
                        {item.nameEn}
                      </h3>
                      <p className="font-urdu font-bold text-amber-300 text-xs mt-0.5">
                        {item.nameUr}
                      </p>
                      {item.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => openItemModal(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ترمیم (Edit)</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 bg-red-950/60 hover:bg-red-900/80 border border-red-500/30 text-red-300 rounded-xl transition-colors"
                        title="ڈیلیٹ کریں"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SHOP SETTINGS & TIMINGS */}
        {/* ========================================================================= */}
        {activeTab === 'SETTINGS' && (
          <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400" />
                Shop Profile & Timings (دکان کی ترتیبات)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-urdu mt-0.5">
                دکان کا نام، رابطہ فون نمبر، نوکھر کا پتہ، اوقات کار (12:00 PM to 12:00 AM) اور لائیو اسٹیٹس اپ ڈیٹ کریں۔
              </p>
            </div>

            {saveSuccessMsg && (
              <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-200 p-3.5 sm:p-4 rounded-2xl flex items-center gap-2 font-urdu text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <form
              onSubmit={handleSaveShopSettings}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-xl"
            >
              {/* Live Shop Open/Closed Toggle */}
              <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    دکان کی موجودہ حالت (Live Shop Status)
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-urdu">
                    کیا گاہک ابھی آن لائن آرڈر کر سکتے ہیں؟
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.isOpen}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, isOpen: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 sm:w-14 h-6 sm:h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] sm:after:left-[4px] after:bg-white after:rounded-full after:h-5 sm:after:h-6 after:w-5 sm:after:w-6 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>

              {/* Shop Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Shop Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.nameEn}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, nameEn: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    دکان کا نام (Urdu)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.nameUr}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, nameUr: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-urdu text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-mono text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Opening Time (کھلنے کا وقت)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12:00 PM"
                    value={settingsForm.openTime}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, openTime: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Closing Time (بند ہونے کا وقت)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12:00 AM"
                    value={settingsForm.closeTime}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, closeTime: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Location Address (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.locationEn}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, locationEn: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    لوکیشن کا پتہ (Urdu)
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.locationUr}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, locationUr: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-urdu text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Message */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Urdu Announcement Message (بینر پر اعلان)
                </label>
                <input
                  type="text"
                  value={settingsForm.announcement || ''}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcement: e.target.value })
                  }
                  placeholder="خوش آمدید! تازہ اور لذیذ برگر اور شاورما دستیاب ہیں..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-urdu text-amber-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSetting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-flame-500 hover:from-amber-400 hover:to-flame-400 text-black font-black py-3 rounded-2xl shadow-xl shadow-amber-500/25 active:scale-95 transition-all text-xs sm:text-sm md:text-base disabled:opacity-50"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>
                    {isSavingSetting ? 'محفوظ کیا جا رہا ہے...' : 'ترتیبات محفوظ کریں (Save Settings)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR FOR ADMIN */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('KITCHEN')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'KITCHEN'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <ChefHat className="w-5 h-5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-flame-600 text-white text-[9px] font-mono px-1 rounded-full animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-urdu">باورچی خانہ</span>
        </button>

        <button
          onClick={() => setActiveTab('MENU')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'MENU'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-urdu">مینو کنٹرول</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'SETTINGS'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-urdu">دکان ترتیبات</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* ADD / EDIT MENU ITEM MODAL (MOBILE FRIENDLY + GALLERY UPLOAD + GOOGLE LINKS) */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-white">
                {editingItem ? 'کھانے کی تفصیلات تبدیل کریں' : 'نیا فاسٹ فوڈ شامل کریں'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Food Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Double Egg Burger"
                    value={itemFormData.nameEn}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, nameEn: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    کھانے کا نام (Urdu) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ڈبل انڈہ برگر"
                    value={itemFormData.nameUr}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, nameUr: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-urdu text-amber-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price (PKR Rs.) *</label>
                  <input
                    type="number"
                    required
                    placeholder="180"
                    value={itemFormData.price}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, price: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono text-white text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs sm:text-sm"
                  >
                    <option value="Burgers">Burgers (برگرز)</option>
                    <option value="Shawarma">Shawarma (شاورما)</option>
                    <option value="Fries & Sides">Fries & Sides (فرائز)</option>
                    <option value="Drinks">Drinks (مشروبات)</option>
                  </select>
                </div>
              </div>

              {/* Image Input Options: Google Image Link / Web URL or Mobile Gallery Upload */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Food Image (تصویر منتخب کریں)</span>
                  </label>

                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageMode('LINK')}
                      className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        imageMode === 'LINK'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3 h-3" /> گوگل لنک (URL)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageMode('UPLOAD');
                        fileInputRef.current?.click();
                      }}
                      className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                        imageMode === 'UPLOAD'
                          ? 'bg-amber-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" /> گیلری / کیمرہ
                    </button>
                  </div>
                </div>

                {imageMode === 'LINK' ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Paste Google Image Link or Web URL (https://...)"
                      value={itemFormData.image}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, image: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full bg-slate-900 hover:bg-slate-800 border border-dashed border-amber-500/40 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold text-amber-300 active:scale-95 transition-all"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>
                        {isUploadingImage
                          ? 'تصویر اپلوڈ ہو رہی ہے...'
                          : 'موبائل گیلری یا کیمرے سے فوٹو منتخب کریں'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-0.5">
                  <span className="text-slate-500">یا تیار شدہ تصاویر:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setItemFormData({
                        ...itemFormData,
                        image: '/images/single-egg-burger.jpg',
                      })
                    }
                    className="text-amber-400 hover:underline"
                  >
                    سنگل انڈہ
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setItemFormData({
                        ...itemFormData,
                        image: '/images/double-egg-burger.jpg',
                      })
                    }
                    className="text-amber-400 hover:underline"
                  >
                    ڈبل انڈہ
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setItemFormData({
                        ...itemFormData,
                        image: '/images/crispy-chicken-burger.jpg',
                      })
                    }
                    className="text-amber-400 hover:underline"
                  >
                    چکن زنگر
                  </button>
                </div>

                {/* Live Image Preview */}
                {itemFormData.image && (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden bg-black/60 border border-slate-700 mt-2 flex items-center justify-center">
                    <img
                      src={itemFormData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = '/images/single-egg-burger.jpg';
                      }}
                    />
                    <span className="absolute top-1 left-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-amber-300">
                      Live Preview
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description (تفصیل)</label>
                <textarea
                  rows={2}
                  placeholder="Crispy patty, fresh salad, special raita and sauce..."
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, description: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white resize-none text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isAvailable}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, isAvailable: e.target.checked })
                    }
                    className="rounded bg-slate-950 border-slate-700 text-amber-500"
                  />
                  <span>دستیاب ہے (In Stock)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isFeatured}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, isFeatured: e.target.checked })
                    }
                    className="rounded bg-slate-950 border-slate-700 text-amber-500"
                  />
                  <span>اسپیشل فیچرڈ (Featured)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs active:scale-95"
                >
                  محفوظ کریں (Save Item)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN PRINTABLE RECEIPT TEMPLATE */}
      {receiptOrder && (
        <div id="printable-receipt" className="hidden">
          <div className="text-center pb-2 border-b border-black">
            <h2 className="font-bold text-base">{shopSetting.nameEn}</h2>
            <p className="text-xs">{shopSetting.nameUr}</p>
            <p className="text-[11px]">{shopSetting.locationEn}</p>
            <p className="text-[11px]">Tel: {shopSetting.phone}</p>
          </div>

          <div className="py-2 border-b border-black text-xs space-y-1">
            <div className="flex justify-between">
              <strong>Order #{receiptOrder.orderNumber}</strong>
              <span>{new Date(receiptOrder.createdAt).toLocaleTimeString()}</span>
            </div>
            <p>Customer: {receiptOrder.customerName}</p>
            <p>Phone: {receiptOrder.customerPhone}</p>
            <p>Address: {receiptOrder.customerAddress}</p>
            {receiptOrder.specialNotes && <p>Note: {receiptOrder.specialNotes}</p>}
          </div>

          <div className="py-2 border-b border-black text-xs space-y-1">
            {receiptOrder.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {i.nameEn} x{i.quantity}
                </span>
                <span>Rs. {i.price * i.quantity}</span>
              </div>
            ))}
          </div>

          <div className="py-2 text-xs flex justify-between font-bold text-sm">
            <span>TOTAL:</span>
            <span>Rs. {receiptOrder.totalAmount}</span>
          </div>

          <p className="text-center text-[10px] pt-2">
            Thank you for ordering with Ameer Muaviya Burger Point Nokhar!
          </p>
        </div>
      )}
    </div>
  );
}
