'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Calendar, MapPin, Phone, ShoppingBag, Shield, Sparkles } from 'lucide-react';
import { ShopSetting } from '@/lib/types';

interface HeaderProps {
  shopSetting: ShopSetting;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopSetting,
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Format 12-hour time with AM/PM
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      // Format date e.g. "Mon, 31 Aug 2026"
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
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-header shadow-2xl transition-all">
      {/* Top Ticker Bar: Live Date & Time + Shop Status */}
      <div className="bg-gradient-to-r from-amber-600 via-flame-600 to-amber-700 text-white text-xs sm:text-sm py-1.5 px-3 sm:px-6 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Live Date & Time with Icons */}
          <div className="flex items-center gap-3 font-mono font-medium">
            <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20">
              <Calendar className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{currentDate || 'Loading date...'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span className="font-bold tracking-wider">{currentTime || 'Loading time...'}</span>
            </div>
          </div>

          {/* Shop Timings & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-0.5 rounded-full border border-amber-400/30">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-200 font-semibold">
                ٹائمنگ: {shopSetting.openTime} تا {shopSetting.closeTime}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  shopSetting.isOpen
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-red-400 animate-pulse'
                }`}
              />
              <span
                className={`font-bold px-2 py-0.5 rounded text-xs ${
                  shopSetting.isOpen
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-950/80 text-red-300 border border-red-500/40'
                }`}
              >
                {shopSetting.isOpen ? 'کھلا ہے • OPEN' : 'فی الوقت بند ہے • CLOSED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-flame-500 to-amber-400 p-0.5 shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center text-2xl">
                🍔
              </div>
              <div className="absolute -bottom-1 -right-1 bg-flame-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black shadow">
                NOKHAR
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {shopSetting.nameEn}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold">
                  <Sparkles className="w-3 h-3" /> نوکھر
                </span>
              </div>
              <p className="text-xs sm:text-sm font-urdu font-bold text-amber-300/90 -mt-0.5">
                {shopSetting.nameUr}
              </p>
            </div>
          </Link>

          {/* Quick Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Location Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-flame-400 shrink-0" />
              <div className="truncate max-w-[180px]">
                <p className="font-semibold text-white truncate">{shopSetting.locationEn}</p>
                <p className="text-[11px] font-urdu text-amber-300 truncate">{shopSetting.locationUr}</p>
              </div>
            </div>

            {/* Call Phone Button */}
            <a
              href={`tel:${shopSetting.phone}`}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Call for Order"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 animate-bounce-short" />
              <span>{shopSetting.phone}</span>
            </a>

            {/* Admin Portal Button */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
              title="Admin Panel / ایڈمن پینل"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">ایڈمن پینل</span>
              <span className="md:hidden">Admin</span>
            </Link>

            {/* Shopping Cart Trigger Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-flame-600 hover:from-amber-400 hover:to-flame-500 text-black font-extrabold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              <span className="hidden sm:inline font-bold">آرڈر پلیٹ</span>
              <div className="flex items-center gap-1">
                <span className="bg-black text-amber-300 font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
                {cartTotal > 0 && (
                  <span className="text-xs font-black text-black ml-1">
                    Rs. {cartTotal}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
