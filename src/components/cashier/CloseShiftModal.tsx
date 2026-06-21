'use client';

import { useState, useMemo } from 'react';
import { X, Lock, Banknote, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { useShiftStore } from '@/store/useShiftStore';
import { useOrderStore } from '@/store/useOrderStore';

interface CloseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloseShiftModal({ isOpen, onClose }: CloseShiftModalProps) {
  const { currentShift, closeShift } = useShiftStore();
  const { orders } = useOrderStore();
  
  const [closingBalance, setClosingBalance] = useState('');
  const [displayBalance, setDisplayBalance] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Format angka ke Rupiah dengan pemisah ribuan
  const formatToRupiah = (value: string): string => {
    if (!value) return '';
    const number = parseInt(value.replace(/\D/g, ''), 10);
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('id-ID').format(number);
  };

  // Parse dari format ke angka murni
  const parseToNumber = (value: string): number => {
    return parseInt(value.replace(/\D/g, ''), 10) || 0;
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Hanya angka
    setClosingBalance(rawValue);
    setDisplayBalance(formatToRupiah(rawValue));
  };

  // Hitung total penjualan tunai di shift ini - PINDAHKAN KE ATAS sebelum conditional
  const cashSales = useMemo(() => {
    if (!currentShift) return 0;
    return orders
      .filter(o => o.shift_id === currentShift.id && o.payment_method === 'cash' && o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders, currentShift?.id]);

  // Format helpers
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  // Early return untuk modal - HARUS SETELAH semua hooks
  if (!isOpen || !currentShift) return null;

  const expectedCash = currentShift.opening_balance + cashSales;
  const actualCash = parseToNumber(closingBalance);
  const discrepancy = actualCash - expectedCash;

  const handleClose = () => {
    if (!closingBalance || parseToNumber(closingBalance) < 0) return;
    closeShift(parseToNumber(closingBalance));
    setClosingBalance('');
    setDisplayBalance('');
    setShowSummary(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Tutup Shift</h2>
          <p className="text-sm text-white/80 mt-1">
            {currentShift.cashier_name} • {formatTime(currentShift.start_time)}
          </p>
        </div>

        {!showSummary ? (
          <div className="p-6 space-y-4">
            {/* Summary Cepat */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Modal Awal</span>
                <span className="font-bold">{formatRupiah(currentShift.opening_balance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Penjualan Tunai</span>
                <span className="font-bold text-green-600">+ {formatRupiah(cashSales)}</span>
              </div>
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Uang Seharusnya</span>
                <span className="font-bold text-lg text-blue-600">{formatRupiah(expectedCash)}</span>
              </div>
            </div>

            {/* Input Uang Fisik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                 💵 Uang Fisik di Laci (Hasil Hitung)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                <input
                  type="text"
                  value={displayBalance}
                  onChange={handleBalanceChange}
                  placeholder="0"
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-xl font-bold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSummary(true)}
              disabled={!closingBalance || parseToNumber(closingBalance) <= 0}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Hitung Selisih
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Hasil Perhitungan */}
            <div className={`rounded-lg p-4 border-2 ${
              discrepancy === 0 ? 'bg-green-50 border-green-200' :
              discrepancy > 0 ? 'bg-blue-50 border-blue-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {discrepancy === 0 ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
                <div>
                  <p className="font-bold text-lg">
                    {discrepancy === 0 ? 'Uang Pas (Selisih 0)' : 
                     discrepancy > 0 ? `Uang Lebih ${formatRupiah(discrepancy)}` : 
                     `Uang Kurang ${formatRupiah(Math.abs(discrepancy))}`}
                  </p>
                </div>
              </div>
              <p className="text-xs opacity-80">
                Seharusnya: {formatRupiah(expectedCash)} | Fisik: {formatRupiah(actualCash)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSummary(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Koreksi
              </button>
              <button
                onClick={handleClose}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                Tutup Shift
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}