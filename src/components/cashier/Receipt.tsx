'use client';

import { Printer, X, Download } from 'lucide-react';
import { Order } from '@/store/useOrderStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ReceiptProps {
  order: Order;
  onClose: () => void;
  onPrint: () => void;
}

export default function Receipt({ order, onClose, onPrint }: ReceiptProps) {
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validasi date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };
  const { wifiSSID, wifiPassword, cafeName, cafeAddress, cafePhone } = useSettingsStore();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Struk Pembayaran
            </h2>
            <p className="text-sm text-white/80">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Struk */}
        <div className="p-6 bg-gray-100">
          <div id="receipt-content" className="bg-white p-4 font-mono text-xs max-w-[280px] mx-auto shadow-lg">
            {/* Header Struk */}
            <div className="text-center mb-3">
                <h1 className="text-base font-bold">{cafeName}</h1>
                <p className="text-[10px]">{cafeAddress}</p>
                <p className="text-[10px]">Telp: {cafePhone}</p>
                <div className="border-b border-dashed border-gray-400 my-2"></div>
            </div>

            {/* Info Transaksi */}
            <div className="mb-3 text-[10px]">
              <div className="flex justify-between">
                <span>No:</span>
                <span>{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Tgl:</span>
                <span>{formatDateTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{order.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{order.customer_name}</span>
              </div>
              {order.table_number && (
                <div className="flex justify-between">
                  <span>Meja:</span>
                  <span>{order.table_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span>{order.order_type === 'dine_in' ? 'Dine In' : 'Take Away'}</span>
              </div>
              <div className="border-b border-dashed border-gray-400 my-2"></div>
            </div>

            {/* Item Pesanan */}
            <div className="mb-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-bold">{item.menu_name}</div>
                  <div className="flex justify-between text-[10px]">
                    <span>{item.quantity} x {formatRupiah(item.price)}</span>
                    <span>{formatRupiah(item.subtotal)}</span>
                  </div>
                </div>
              ))}
              <div className="border-b border-dashed border-gray-400 my-2"></div>
            </div>

            {/* Total */}
            <div className="mb-3 text-[10px]">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Bayar ({order.payment_method === 'cash' ? 'Tunai' : 'QRIS'})</span>
                <span>{formatRupiah(order.payment_amount || 0)}</span>
              </div>
              {order.change !== undefined && order.change > 0 && (
                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{formatRupiah(order.change)}</span>
                </div>
              )}
            </div>

            {/* WiFi Info */}
            {wifiSSID && (
            <>
                <div className="border-b border-dashed border-gray-400 my-2"></div>
                <div className="text-center mb-2">
                <p className="font-bold text-[11px]">WiFi: </p>
                <p className="text-[10px]">SSID: <span className="font-bold">{wifiSSID}</span></p>
                {wifiPassword && <p className="text-[10px]">Password: <span className="font-bold">{wifiPassword}</span></p>}
                </div>
            </>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] mt-4">
              <div className="border-b border-dashed border-gray-400 mb-2"></div>
              <p>Terima Kasih</p>
              <p>Atas Kunjungan Anda</p>
              <p className="mt-2">--- *** ---</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={onPrint}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Cetak Struk
            </button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            💡 Pastikan printer thermal sudah terhubung
          </p>
        </div>
      </div>
    </div>
  );
}