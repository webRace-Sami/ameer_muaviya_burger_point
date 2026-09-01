'use client';

import React from 'react';
import { Phone, MessageSquare, Flame, MapPin, Zap, Award } from 'lucide-react';
import { ShopSetting } from '@/lib/types';

interface ShopBannerProps {
  shopSetting: ShopSetting;
}

export const ShopBanner: React.FC<ShopBannerProps> = ({ shopSetting }) => {
  const whatsappUrl = `https://wa.me/92${shopSetting.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}?text=${encodeURIComponent('السلام علیکم! مجھے امیر معاویہ برگر پوائنٹ نوکھر سے فاسٹ فوڈ آرڈر کرنا ہے۔')}`;

  return (
    <section className="relative overflow-hidden pt-4 pb-6 px-4 sm:px-6">
      {/* Background ambient glow circles */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-flame-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-[#161f33]/90 border border-amber-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Top Urdu Announcement Bar */}
          {shopSetting.announcement && (
            <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-flame-500/20 to-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-2xl w-full">
              <Flame className="w-5 h-5 text-flame-400 shrink-0 animate-bounce-short" />
              <p className="font-urdu font-semibold text-amber-200 text-sm sm:text-base leading-relaxed tracking-wide text-right w-full">
                {shopSetting.announcement}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Big Brand Headlines */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-flame-600/30 text-flame-300 border border-flame-500/40 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-flame-400" /> نوکھر کا مشہور و معروف ذائقہ
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> فاسٹ ہوم ڈلیوری (15-25 منٹ)
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Fresh, Crispy & Delicious{' '}
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-flame-400 bg-clip-text text-transparent">
                  Burgers & Shawarma
                </span>
              </h2>

              <p className="font-urdu text-lg sm:text-2xl text-amber-300 font-bold leading-relaxed">
                سنگل انڈہ برگر • ڈبل انڈہ برگر • چکن زنگر برگر • اسپیشل چکن شاورما
              </p>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Taste the most delicious and crispy Pakistani street-style burgers, freshly toasted buns, authentic secret green chutneys, and juicy grilled shawarma in Nokhar. No registration needed—simply choose your food, enter your address, and enjoy!
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${shopSetting.phone}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-900/40 active:scale-95 transition-all text-sm sm:text-base"
                >
                  <Phone className="w-4 h-4 text-emerald-200" />
                  <span>فون پر آرڈر کریں: {shopSetting.phone}</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/50 font-bold px-5 py-3 rounded-2xl active:scale-95 transition-all text-sm sm:text-base"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>واٹس ایپ پر رابطہ</span>
                </a>
              </div>
            </div>

            {/* Right Column: Location & Highlights Card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700/70 p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">لوکیشن / Location</h3>
                    <p className="text-xs text-slate-400">{shopSetting.locationEn}</p>
                    <p className="text-xs font-urdu text-amber-300 font-bold">{shopSetting.locationUr}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-700/50" />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                    <p className="text-[11px] text-slate-400 font-medium">اوقات کار (Timings)</p>
                    <p className="text-xs font-bold text-amber-300 mt-0.5">
                      {shopSetting.openTime} – {shopSetting.closeTime}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/40">
                    <p className="text-[11px] text-slate-400 font-medium">حالت (Live Status)</p>
                    <p
                      className={`text-xs font-black mt-0.5 ${
                        shopSetting.isOpen ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {shopSetting.isOpen ? 'کھلا ہے • OPEN' : 'بند ہے • CLOSED'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-urdu pt-1">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>100% حلال اور روزانہ کا تازہ گوشت، صاف ستھرا آئل اور انڈے!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
