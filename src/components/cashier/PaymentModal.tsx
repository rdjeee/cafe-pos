'use client';

import { useState } from 'react';
import { X, Banknote, QrCode, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useCashierStore } from '@/store/useCashierStore';
import { useShiftStore } from '@/store/useShiftStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { items, customerName, tableNumber, orderType, getTotal, clearCart } = useCartStore();
  
  const total = getTotal();
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'qris' | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addOrder } = useOrderStore();
  const activeCashier = useCashierStore(state => state.getActiveCashier());
  const { getCurrentShift } = useShiftStore();
  const currentShift = getCurrentShift();

  if (!isOpen) return null;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const change = selectedMethod === 'cash' && cashAmount 
    ? Number(cashAmount) - total 
    : 0;

  const handlePayment = () => {
  if (!selectedMethod) return;
  if (selectedMethod === 'cash' && Number(cashAmount) < total) return;
  
  setIsProcessing(true);
  
  // Simulasi proses pembayaran
  setTimeout(() => {
    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Create order object
    const newOrder: import('@/store/useOrderStore').Order = {
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      customer_name: customerName,
      cashier_name: activeCashier?.name || 'Tidak Diketahui', // ← TAMBAHKAN INI
      shift_id: currentShift?.id || 'unknown', // ← TAMBAHKAN INI
      table_number: tableNumber,
      order_type: orderType,
      items: items.map(item => ({
        id: item.id,
        menu_id: item.id,
        menu_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: total,
      tax: 0, // Bisa ditambah jika ada pajak
      total: total,
      payment_method: selectedMethod,
      payment_amount: selectedMethod === 'cash' ? Number(cashAmount) : total,
      change: selectedMethod === 'cash' ? Number(cashAmount) - total : 0,
      status: 'processing',
      created_at: new Date(),
    };

    // Save to order store
    addOrder(newOrder);

    setIsProcessing(false);
    setIsSuccess(true);
    
    // Reset setelah 2 detik
    setTimeout(() => {
      clearCart();
      onClose();
      setIsSuccess(false);
      setSelectedMethod(null);
      setCashAmount('');
    }, 2000);
  }, 1500);
};

  const quickCashAmounts = [50000, 100000, 150000, 200000];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Pembayaran</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {isSuccess ? (
          // Success State
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h3>
            <p className="text-gray-600 text-center">
              Pesanan untuk <span className="font-semibold">{customerName}</span> sedang diproses
            </p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pelanggan</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                {orderType === 'dine_in' && tableNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Meja</span>
                    <span className="font-medium">{tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipe</span>
                  <span className="font-medium">{orderType === 'dine_in' ? 'Dine In' : 'Take Away'}</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-blue-600">{formatRupiah(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Metode Pembayaran <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setSelectedMethod('cash')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === 'cash'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Banknote className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'cash' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium text-center ${
                    selectedMethod === 'cash' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    Tunai
                  </p>
                </button>

                <button
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedMethod === 'qris'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <QrCode className={`w-8 h-8 mx-auto mb-2 ${
                    selectedMethod === 'qris' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium text-center ${
                    selectedMethod === 'qris' ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    QRIS
                  </p>
                </button>
              </div>

              {/* Cash Input */}
              {selectedMethod === 'cash' && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Jumlah Uang Diterima
                    </label>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {quickCashAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCashAmount(amount.toString())}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        {formatRupiah(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Change Display */}
                  {cashAmount && Number(cashAmount) >= total && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700 font-medium">Kembalian</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatRupiah(change)}
                        </span>
                      </div>
                    </div>
                  )}

                  {cashAmount && Number(cashAmount) < total && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Uang kurang {formatRupiah(total - Number(cashAmount))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* QRIS Info */}
              {selectedMethod === 'qris' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center animate-fadeIn">
                  <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    QRIS Dinamis
                  </p>
                  <p className="text-xs text-blue-600">
                    QR Code akan digenerate setelah konfirmasi
                  </p>
                  <p className="text-lg font-bold text-blue-700 mt-2">
                    {formatRupiah(total)}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || (selectedMethod === 'cash' && (!cashAmount || Number(cashAmount) < total)) || isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Konfirmasi Bayar
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}