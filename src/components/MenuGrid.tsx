'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Minus, Search, Sparkles, Check, Flame, UtensilsCrossed } from 'lucide-react';
import { MenuItem, CartItem } from '@/lib/types';

interface MenuGridProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
}

const CATEGORIES = [
  { id: 'ALL', nameEn: 'All Foods', nameUr: 'تمام آئٹمز', icon: '🍔' },
  { id: 'Burgers', nameEn: 'Burgers', nameUr: 'برگرز', icon: '🍔' },
  { id: 'Shawarma', nameEn: 'Shawarma', nameUr: 'شاورما', icon: '🌯' },
  { id: 'Fries & Sides', nameEn: 'Fries & Sides', nameUr: 'فرائز اور دیگر', icon: '🍟' },
  { id: 'Drinks', nameEn: 'Cold Drinks', nameUr: 'مشروبات', icon: '🥤' },
];

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  cart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameUr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const getItemQuantityInCart = (itemId: string): number => {
    const found = cart.find((c) => c.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="menu-section">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400 mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" /> مینو کارڈ / Fast Food Menu
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Choose Your Favorite{' '}
            <span className="text-amber-400">Meal</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-urdu text-amber-200/80 mt-1">
            اپنی پسند کا برگر یا شاورما منتخب کریں اور آرڈر بٹن دبائیں
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search / کھانا تلاش کریں..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-6 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-flame-500 text-black shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.nameEn}</span>
              <span className="font-urdu text-xs opacity-90">({cat.nameUr})</span>
            </button>
          );
        })}
      </div>

      {/* Menu Grid Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-bold text-white">کوئی کھانا نہیں ملا (No items found)</h3>
          <p className="text-slate-400 text-sm mt-1">
            براہ کرم کوئی دوسرا نام تلاش کریں یا زمرہ تبدیل کریں۔
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const qty = getItemQuantityInCart(item.id);
            const isAvailable = item.isAvailable !== false;

            return (
              <div
                key={item.id}
                className={`group relative rounded-3xl overflow-hidden glass-card flex flex-col justify-between ${
                  !isAvailable ? 'opacity-60 grayscale-[40%]' : ''
                }`}
              >
                {/* Image Container */}
                <div className="relative w-full h-52 sm:h-56 bg-slate-950 overflow-hidden">
                  <Image
                    src={item.image || '/images/single-egg-burger.jpg'}
                    alt={item.nameEn}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => {
                      e.target.src = '/images/single-egg-burger.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {item.isFeatured && (
                      <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow">
                        <Sparkles className="w-3 h-3 text-black" /> اسپیشل
                      </span>
                    )}
                    <span className="bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {item.category}
                    </span>
                  </div>

                  {/* Stock status tag */}
                  <div className="absolute top-3 right-3">
                    {isAvailable ? (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        دستیاب ہے
                      </span>
                    ) : (
                      <span className="bg-red-950/90 text-red-300 border border-red-500/40 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        ختم ہے (Sold Out)
                      </span>
                    )}
                  </div>

                  {/* Price Tag in Image */}
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md border border-amber-500/40 px-3 py-1 rounded-xl">
                    <span className="text-xs text-amber-400 font-bold">Rs. </span>
                    <span className="text-lg font-black text-white font-mono">{item.price}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-400 transition-colors leading-tight">
                      {item.nameEn}
                    </h3>
                    <p className="font-urdu font-bold text-amber-300 text-sm mt-0.5 leading-snug">
                      {item.nameUr}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Cart Action Buttons */}
                  <div className="pt-2">
                    {!isAvailable ? (
                      <button
                        disabled
                        className="w-full bg-slate-800 text-slate-500 text-xs font-bold py-2.5 rounded-xl cursor-not-allowed text-center"
                      >
                        فی الوقت دستیاب نہیں
                      </button>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => onAddToCart(item)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-flame-600 hover:from-amber-400 hover:to-flame-500 text-black font-extrabold text-xs sm:text-sm py-2.5 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4 text-black stroke-[3]" />
                        <span>آرڈر میں شامل کریں</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-slate-900 border border-amber-500/50 p-1 rounded-xl shadow-inner">
                        <button
                          onClick={() => onRemoveFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-300 text-white flex items-center justify-center font-bold transition-colors active:scale-90"
                          title="کم کریں"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-sm font-black text-amber-300">
                            {qty}
                          </span>
                          <span className="text-[10px] text-slate-400 font-urdu font-bold">عدد</span>
                        </div>
                        <button
                          onClick={() => onAddToCart(item)}
                          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-colors active:scale-90"
                          title="مزید شامل کریں"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
