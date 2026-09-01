'use client';

import React from 'react';
import { CheckCircle2, Clock, MapPin, Phone, MessageSquare, X, ChefHat } from 'lucide-react';
import { Order, ShopSetting } from '@/lib/types';

interface OrderSuccessModalProps {
  order: Order | null;
  shopSetting: ShopSetting;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  shopSetting,
  onClose,
}) => {
  if (!order) return null;

  const whatsappMsg = `السلام علیکم! میرا آرڈر نمبر #${order.orderNumber} ہے (${order.customerName}). کیا آرڈر تیار ہو رہا ہے؟`;
  const cleanPhone = shopSetting.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
  const whatsappUrl = `https://wa.me/92${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
            <CheckCircle2 className="w-9 h-9 animate-bounce-short" />
          </div>
          <h3 className="text-2xl font-black text-white">آرڈر موصول ہو گیا ہے!</h3>
          <p className="text-sm font-bold text-amber-400">
            Order #{order.orderNumber} Placed Successfully
          </p>
          <p className="text-xs text-slate-300 font-urdu">
            امیر معاویہ برگر پوائنٹ کے کچن میں آپ کا آرڈر پہنچ چکا ہے اور باورچی تیاری شروع کر رہے ہیں۔
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="text-slate-400">گاہک کا نام (Customer):</span>
            <span className="font-bold text-white">{order.customerName}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="text-slate-400">فون نمبر (Phone):</span>
            <span className="font-mono font-bold text-amber-300">{order.customerPhone}</span>
          </div>

          <div className="flex items-start justify-between pb-2 border-b border-slate-800 text-xs gap-2">
            <span className="text-slate-400 shrink-0">پتہ (Address):</span>
            <span className="font-medium text-right text-slate-200">{order.customerAddress}</span>
          </div>

          {/* Items */}
          <div className="pt-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              آرڈر شدہ آئٹمز:
            </p>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-300">
                  <span>
                    {item.nameEn} <span className="text-amber-400 font-bold">x{item.quantity}</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    Rs. {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          <div className="flex justify-between items-center text-sm font-black text-white">
            <span>کل بل (Total Bill):</span>
            <span className="text-amber-400 font-mono text-lg">Rs. {order.totalAmount}</span>
          </div>
        </div>

        {/* Live Status Progression */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
          <div className="text-xs">
            <p className="font-bold text-amber-300">تخمینی وقت (Estimated Time): 15 - 25 منٹ</p>
            <p className="text-slate-300 mt-0.5">
              ڈلیوری بوائے آرڈر لے کر سیدھا آپ کے نوکھر کے پتے پر پہنچے گا۔
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold py-2.5 rounded-xl text-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>واٹس ایپ پر پوچھیں</span>
          </a>

          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs transition-colors"
          >
            ٹھیک ہے، شکریہ! (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
