'use client';

import { useState, useEffect } from 'react';
import { X, Delete, ShieldAlert } from 'lucide-react';
import { useCashierStore } from '@/store/useCashierStore';

interface OwnerPinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
}

export default function OwnerPinModal({ isOpen, onSuccess, onCancel, title = 'Verifikasi PIN Owner' }: OwnerPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const PIN_LENGTH = 4;

  // Import useCashierStore di dalam component untuk menghindari SSR issues
  const verifyOwnerPin = useCashierStore(state => state.verifyOwnerPin);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setShake(false);
    }
  }, [isOpen]);

  // Early return jika modal tidak terbuka
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isOpen]);

  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto verify saat PIN mencapai 4 digit
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          if (verifyOwnerPin(newPin)) {
            onSuccess();
          } else {
            setError('PIN salah! Akses ditolak.');
            setShake(true);
            setTimeout(() => {
              setPin('');
              setShake(false);
            }, 800);
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ${shake ? 'animate-shake' : ''}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center relative">
          <button
            onClick={handleCancel}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-white/80 mt-1">
            Masukkan PIN untuk melanjutkan
          </p>
        </div>

        {/* PIN Display */}
        <div className="p-6">
          <div className="flex justify-center gap-3 mb-6">
            {[...Array(PIN_LENGTH)].map((_, idx) => (
              <div
                key={idx}
                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                  idx < pin.length
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                {pin[idx] && <div className="w-3 h-3 bg-gray-800 rounded-full" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-14 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xl font-bold text-gray-800 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleCancel}
              className="h-14 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-600 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-14 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg text-xl font-bold text-gray-800 transition-colors"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-14 bg-orange-100 hover:bg-orange-200 rounded-lg flex items-center justify-center text-orange-600 transition-colors"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            💡 PIN default: <span className="font-mono font-bold">1234</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}