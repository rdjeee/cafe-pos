'use client';

import { useState, useEffect } from 'react';
import { X, Play, ShieldAlert, User } from 'lucide-react';
import { useShiftStore } from '@/store/useShiftStore';
import { useCashierStore } from '@/store/useCashierStore';

interface OpenShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenShiftModal({ isOpen, onClose }: OpenShiftModalProps) {
  const { openShift } = useShiftStore();
  const { getActiveCashiers, setActiveCashier, activeCashierId } = useCashierStore();
  
  const [selectedCashierId, setSelectedCashierId] = useState<string>('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [displayBalance, setDisplayBalance] = useState(''); // Untuk tampilan dengan format
  const [error, setError] = useState('');
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const activeCashiers = getActiveCashiers();

  // Reset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Auto-select kasir jika sudah ada yang dipilih di POS
      if (activeCashierId) {
        setSelectedCashierId(activeCashierId);
      }
      setOpeningBalance('');
      setDisplayBalance('');
      setError('');
      setPin('');
      setPinError('');
      setShowPinVerification(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
    setOpeningBalance(rawValue);
    setDisplayBalance(formatToRupiah(rawValue));
    setError('');
  };

  const handleCashierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCashierId(id);
    setActiveCashier(id); // Sinkronkan dengan store kasir
    setError('');
  };

  const selectedCashier = activeCashiers.find(c => c.id === selectedCashierId);

  const handleRequestOpenShift = () => {
    if (!selectedCashierId || !selectedCashier) {
      setError('⚠️ Pilih kasir terlebih dahulu!');
      return;
    }
    const amount = parseToNumber(openingBalance);
    if (amount < 0) {
      setError('⚠️ Modal awal tidak boleh negatif!');
      return;
    }
    if (amount > 5000000) {
      setError('⚠️ Modal awal terlalu besar! Harap konfirmasi dengan Owner.');
      return;
    }

    setShowPinVerification(true);
    setError('');
  };

  const handlePinVerify = () => {
    const { verifyOwnerPin } = useCashierStore.getState();
    
    if (pin.length !== 4) {
      setPinError('PIN harus 4 digit!');
      return;
    }
    if (!verifyOwnerPin(pin)) {
      setPinError('❌ PIN salah! Akses ditolak.');
      setPin('');
      return;
    }

    // PIN benar, buka shift
    openShift(selectedCashier.id, selectedCashier.name, parseToNumber(openingBalance));
    
    // Reset
    setSelectedCashierId('');
    setOpeningBalance('');
    setDisplayBalance('');
    setPin('');
    setError('');
    setPinError('');
    setShowPinVerification(false);
    onClose();
  };

  const handlePinCancel = () => {
    setShowPinVerification(false);
    setPin('');
    setPinError('');
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const isButtonDisabled = !selectedCashierId || !openingBalance || parseToNumber(openingBalance) <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {!showPinVerification ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center relative">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Buka Shift Baru</h2>
              <p className="text-sm text-white/80 mt-1">
                Mulai sesi kerja dan catat modal awal
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Dropdown Kasir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Pilih Kasir Bertugas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCashierId}
                    onChange={handleCashierChange}
                    className="w-full pl-10 pr-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-medium text-blue-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer appearance-none"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                      backgroundPosition: `right 0.75rem center`, 
                      backgroundRepeat: `no-repeat`, 
                      backgroundSize: `1.5em 1.5em`,
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">-- Pilih Kasir --</option>
                    {activeCashiers.map((cashier) => (
                      <option key={cashier.id} value={cashier.id}>
                        {cashier.name}
                      </option>
                    ))}
                  </select>
                </div>
                {activeCashiers.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Tidak ada kasir aktif. Hubungi Owner untuk menambahkan kasir.
                  </p>
                )}
              </div>

              {/* Input Modal Awal dengan Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Uang Modal Awal (di Laci) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                  <input
                    type="text"
                    value={displayBalance}
                    onChange={handleBalanceChange}
                    placeholder="0"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-xl font-bold text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none tracking-wide"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                   Masukkan jumlah uang tunai di laci sebelum mulai berjualan.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Info Keamanan */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Verifikasi Owner Diperlukan</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Setelah input modal awal, Owner harus memverifikasi dengan PIN untuk mencegah manipulasi data.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRequestOpenShift}
                disabled={isButtonDisabled}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Lanjut ke Verifikasi
              </button>
            </div>
          </>
        ) : (
          <>
            {/* PIN Verification Screen */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white text-center relative">
              <button
                onClick={handlePinCancel}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Verifikasi Owner</h2>
              <p className="text-sm text-white/80 mt-1">
                Konfirmasi modal awal: <span className="font-bold">{formatRupiah(parseToNumber(openingBalance))}</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kasir</span>
                  <span className="font-bold">{selectedCashier?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Modal Awal</span>
                  <span className="font-bold text-green-600">{formatRupiah(parseToNumber(openingBalance))}</span>
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔒 Masukkan PIN Owner
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                  placeholder="••••"
                  maxLength={4}
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handlePinVerify()}
                />
              </div>

              {pinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-sm text-red-600 font-medium">{pinError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handlePinCancel}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={handlePinVerify}
                  disabled={pin.length !== 4}
                  className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Verifikasi & Buka Shift
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}