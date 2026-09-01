'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, MapPin, User, Phone, FileText, Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { CartItem, ShopSetting, Order } from '@/lib/types';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  shopSetting: ShopSetting;
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  shopSetting,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('آپ کی پلیٹ خالی ہے! برائے مہربانی پہلے کھانا شامل کریں۔');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage('براہ کرم اپنا نام، فون نمبر اور نوکھر کا پتہ درج کریں۔');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerAddress: customerAddress.trim(),
          specialNotes: specialNotes.trim() || null,
          items: cart.map((i) => ({
            id: i.id,
            nameEn: i.nameEn,
            nameUr: i.nameUr,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Confetti explosion
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        onClearCart();
        onClose();
        onOrderSuccess(result.data);
      } else {
        setErrorMessage(result.error || 'آرڈر بھیجنے میں مسئلہ آیا ہے۔ دوبارہ کوشش کریں۔');
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage('کنکشن میں مسئلہ ہے۔ براہ کرم کال یا واٹس ایپ کے ذریعے آرڈر کریں۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Direct WhatsApp formatted message
  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map((i) => `• ${i.nameEn} (${i.nameUr}) x ${i.quantity} = Rs. ${i.price * i.quantity}`)
      .join('\n');

    const msg = `*نئے برگر آرڈر - امیر معاویہ برگر پوائنٹ نوکھر*\n\n*گاہک کا نام:* ${customerName || 'مذکور نہیں'}\n*فون نمبر:* ${customerPhone || 'مذکور نہیں'}\n*پتہ (نوکھر):* ${customerAddress || 'مذکور نہیں'}\n\n*آرڈر آئٹمز:*\n${itemsList}\n\n*کل رقم:* Rs. ${totalAmount}\n*خصوصی ہدایات:* ${specialNotes || 'کوئی نہیں'}\n\nبراہ کرم میرا آرڈر تیار کریں!`;

    const cleanPhone = shopSetting.phone.replace(/[^0-9]/g, '').replace(/^0/, '');
    window.open(`https://wa.me/92${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-amber-500/30 text-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Your Order Plate (آرڈر پلیٹ)
                </h2>
                <p className="text-xs text-amber-300 font-urdu">
                  {cart.length} مختلف آئٹمز شامل ہیں
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content: Scrollable Items & Customer Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-5xl">🍔</p>
                <h3 className="text-lg font-bold text-white">پلیٹ خالی ہے!</h3>
                <p className="text-xs text-slate-400 font-urdu max-w-xs mx-auto">
                  آپ نے ابھی تک کوئی برگر یا شاورما شامل نہیں کیا۔ مینو سے اپنی پسند کا کھانا منتخب کریں۔
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 inline-flex items-center gap-2 bg-amber-500 text-black text-xs font-black px-4 py-2.5 rounded-xl shadow"
                >
                  مینو دیکھیں
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">منتخب کھانے (Items)</span>
                    <button
                      onClick={onClearCart}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3 h-3" /> تمام خالی کریں
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                          <Image
                            src={item.image || '/images/single-egg-burger.jpg'}
                            alt={item.nameEn}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.nameEn}
                          </h4>
                          <p className="text-[11px] font-urdu text-amber-300 truncate">
                            {item.nameUr}
                          </p>
                          <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                            Rs. {item.price}
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-1 rounded-xl">
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-red-900/60 text-white flex items-center justify-center active:scale-90"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-black text-amber-300 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onAddToCart(item)}
                            className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center active:scale-90 font-bold"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-500/20 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>کھانوں کی رقم (Food Subtotal):</span>
                    <span className="font-mono font-bold text-white">Rs. {totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>ڈلیوری چارجز (Nokhar Local Delivery):</span>
                    <span className="text-emerald-400 font-bold">مفت / فری</span>
                  </div>
                  <div className="h-px bg-slate-800 my-1" />
                  <div className="flex justify-between text-sm sm:text-base font-black text-white">
                    <span>کل بل (Total Bill):</span>
                    <span className="font-mono text-amber-400 text-lg">Rs. {totalAmount}</span>
                  </div>
                </div>

                {/* Customer Details Form (No Login Required) */}
                <form id="order-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                    <User className="w-3.5 h-3.5" />
                    <span>گاہک کی تفصیلات (No Login Needed - صرف نام و پتہ)</span>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-950/80 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="font-urdu leading-relaxed">{errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span>آپ کا نام (Your Name) *</span>
                      <span className="text-[11px] font-urdu text-amber-300">نام لکھیں</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ali Raza (علی رضا)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span>فون / واٹس ایپ نمبر (Phone Number) *</span>
                      <span className="text-[11px] font-urdu text-amber-300">موبائل نمبر</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        placeholder="0300-1234567"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span>نوکھر میں ڈلیوری پتہ (Address in Nokhar) *</span>
                      <span className="text-[11px] font-urdu text-amber-300">محلہ / گلی / دکان کا پتہ</span>
                    </label>
                    <div className="relative">
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. House # 12, Street 3, Near Al-Razi Chowk, Nokhar"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none"
                      />
                      <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                      <span>خصوصی نوٹ (Special Cooking Instructions)</span>
                      <span className="text-[11px] font-urdu text-slate-400">اختیاری</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. زیادہ مصالحہ / Extra Chutney / کم مرچ"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                      />
                      <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-2.5">
              <button
                type="submit"
                form="order-form"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-flame-600 hover:from-amber-400 hover:to-flame-500 text-black font-black py-3 rounded-2xl shadow-xl shadow-amber-500/25 active:scale-95 transition-all text-sm sm:text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>آرڈر بھیجا جا رہا ہے...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black stroke-[2.5]" />
                    <span>آرڈر مکمل کریں (Place Order - Rs. {totalAmount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold py-2.5 rounded-2xl active:scale-95 transition-all text-xs sm:text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>واٹس ایپ پر فوری بھیجیں (Direct WhatsApp)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
