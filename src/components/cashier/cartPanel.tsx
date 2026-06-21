'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, UtensilsCrossed, User, AlertCircle, Lock } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useCashierStore } from '@/store/useCashierStore';
import { useShiftStore } from '@/store/useShiftStore';
import { tables } from '@/data/mockData';
import PaymentModal from './PaymentModal';

export default function CartPanel() {
  const [showManualInput, setShowManualInput] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { 
    items, orderType, tableNumber, customerName,
    setOrderType, setTableNumber, setCustomerName,
    updateQuantity, removeItem, clearCart, getTotal, isReadyToPay
  } = useCartStore();

  const { getActiveCashiers, activeCashierId, setActiveCashier, getActiveCashier } = useCashierStore();
  const { isShiftOpen, currentShift } = useShiftStore();

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const total = getTotal();

  const availableTables = tables.filter(t => t.status === 'available');
  const isDineIn = orderType === 'dine_in';
  const isCustomerNameEmpty = !customerName.trim();
  const activeCashier = getActiveCashier();

  const handleTableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__manual__') {
      setShowManualInput(true);
      setTableNumber('');
    } else {
      setShowManualInput(false);
      setTableNumber(value);
    }
  };

  const handlePayClick = () => {
    if (isReadyToPay()) {
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="w-full md:w-[400px] lg:w-[420px] bg-white border-l border-gray-200 flex flex-col h-screen max-h-screen shadow-lg overflow-hidden">
      {/* Header & Order Type - SCROLLABLE */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0 overflow-y-auto max-h-[45vh]">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Pesanan Baru</h2>
        
        {/* Info Kasir - LOCKED saat shift aktif */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Kasir Bertugas {isShiftOpen() && <span className="text-green-600">(Terkunci)</span>}
          </label>
          
          {isShiftOpen() ? (
            <div className="w-full px-3 py-2 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-800 flex-1">
                {activeCashier?.name || currentShift?.cashier_name}
              </span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                Aktif
              </span>
            </div>
          ) : (
            <select
              value={activeCashierId || ''}
              onChange={(e) => setActiveCashier(e.target.value || null)}
              className="w-full px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="">-- Pilih Kasir --</option>
              {getActiveCashiers().map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
            </select>
          )}
          
          {!activeCashierId && !isShiftOpen() && (
            <p className="text-xs text-amber-600 mt-1">
               Pilih kasir sebelum membuat pesanan
            </p>
          )}
          {isShiftOpen() && (
            <p className="text-xs text-green-600 mt-1">
               Untuk mengganti kasir, tutup shift terlebih dahulu
            </p>
          )}
        </div>

        {/* Order Type Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setOrderType('dine_in')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              orderType === 'dine_in' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" /> Dine In
          </button>
          <button
            onClick={() => setOrderType('take_away')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              orderType === 'take_away' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Take Away
          </button>
        </div>

        {/* Form Dine In */}
        {isDineIn && (
          <div className="space-y-2">
            {/* Username Pelanggan - WAJIB */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  isCustomerNameEmpty ? 'text-red-400' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Masukkan nama pelanggan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                    isCustomerNameEmpty 
                      ? 'border-red-500 bg-red-50 ring-1 ring-red-200' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
              {isCustomerNameEmpty && (
                <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Nama pelanggan wajib diisi</span>
                </div>
              )}
            </div>

            {/* Nomor Meja - OPSIONAL */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nomor Meja <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              
              <div className="relative">
                <select
                  value={showManualInput ? '__manual__' : tableNumber}
                  onChange={handleTableChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Nomor Meja --</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.table_number}>
                      Meja {table.table_number} (Kapasitas: {table.capacity} orang)
                    </option>
                  ))}
                  <option value="__manual__">✏️ Input Manual...</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {showManualInput && (
                <div className="mt-2 animate-fadeIn">
                  <input
                    type="text"
                    placeholder="Ketik nomor meja (misal: A5)"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    autoFocus
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                     Kosongkan jika tidak ada nomor meja
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Take Away - Customer Name WAJIB */}
        {orderType === 'take_away' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Pelanggan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isCustomerNameEmpty ? 'text-red-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Masukkan nama pelanggan"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                  isCustomerNameEmpty 
                    ? 'border-red-500 bg-red-50 ring-1 ring-red-200' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              />
            </div>
            {isCustomerNameEmpty && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Nama pelanggan wajib diisi</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Items - FLEX-1 dengan scrollable */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {/* Sticky Header untuk Item */}
        <div className="sticky top-0 bg-white pb-2 mb-2 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="text-sm font-bold text-gray-800">Item Pesanan</h3>
          {items.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {items.length} item
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400 py-12">
            <ShoppingBag className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm font-medium">Keranjang masih kosong</p>
            <p className="text-xs text-gray-400 mt-1">Pilih menu untuk memulai pesanan</p>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 bg-gradient-to-br from-gray-50 to-white p-2.5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                {/* Thumbnail Compact */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400 overflow-hidden shadow-sm">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-semibold">Img</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Nama & Harga */}
                  <div className="mb-1">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-1 leading-tight">{item.name}</h4>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">{formatRupiah(item.price)}</p>
                  </div>
                  
                  {/* Controls - Lebih Compact */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-lg px-1 shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="p-1 hover:bg-blue-50 rounded transition-colors active:scale-95"
                      >
                        <Minus className="w-3 h-3 text-gray-700" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="p-1 hover:bg-blue-50 rounded transition-colors active:scale-95"
                      >
                        <Plus className="w-3 h-3 text-gray-700" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900 bg-blue-50 px-2 py-1 rounded">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer & Checkout - STICKY BOTTOM, SELALU TERLIHAT */}
      <div className="border-t-2 border-gray-200 p-3 bg-white flex-shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {items.length > 0 && (customerName || tableNumber) && (
          <div className="mb-2 space-y-0.5 text-xs text-gray-600">
            {customerName && (
              <p className="flex items-center gap-1">
                <span className="text-blue-600">👤</span>
                <span className="font-medium truncate">{customerName}</span>
              </p>
            )}
            {isDineIn && tableNumber && (
              <p className="flex items-center gap-1">
                <span className="text-blue-600">📍</span>
                <span className="font-medium">Meja {tableNumber}</span>
              </p>
            )}
            {orderType === 'take_away' && (
              <p className="flex items-center gap-1">
                <span className="text-blue-600">🛍️</span>
                <span className="font-medium">Take Away</span>
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-3 py-2 border-t border-gray-100">
          <span className="text-gray-700 font-bold text-sm">Total Pembayaran</span>
          <span className="text-2xl font-bold text-blue-600">{formatRupiah(total)}</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={clearCart}
            disabled={items.length === 0}
            className="px-3 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Batal
          </button>
          <button 
            onClick={handlePayClick}
            disabled={!isReadyToPay()}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md text-sm"
          >
            💳 Bayar ({items.length} Item)
          </button>
        </div>

        {items.length > 0 && !isReadyToPay() && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-center text-red-700 font-medium">
              ⚠️ {!activeCashierId ? 'Pilih kasir dan masukkan nama pelanggan' : 'Masukkan nama pelanggan untuk melanjutkan'}
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
      />
    </div>
  );
}