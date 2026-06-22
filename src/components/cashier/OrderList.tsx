'use client';

import { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  Search, 
  Receipt as ReceiptIcon,
  User,
  MapPin,
  X,
  UtensilsCrossed,
  ShoppingBag,
  Printer
} from 'lucide-react';
import { useOrderStore, Order } from '@/store/useOrderStore';
import Receipt from './Receipt';

type TabType = 'pending' | 'processing' | 'completed';

export default function OrderList() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const { 
    getProcessingOrders, 
    getPendingOrders,
    getCompletedOrders, 
    updateOrderStatus,
    confirmOrder,
  } = useOrderStore();

  const pendingOrders = getPendingOrders();
  const processingOrders = getProcessingOrders();
  const completedOrders = getCompletedOrders();
  const [pendingQRCount, setPendingQRCount] = useState(0);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(dateObj);
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    setSelectedOrder(null);
  };

  const handleConfirmOrder = (orderId: string, paymentAmount?: number) => {
    confirmOrder(orderId, paymentAmount);
    setSelectedOrder(null);
  };

  const filteredOrders = activeTab === 'pending'
    ? pendingOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTab === 'processing'
    ? processingOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : completedOrders.filter(order => 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Manajemen Pesanan</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            Menunggu ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'processing'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Package className="w-5 h-5" />
            Diproses ({processingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'completed'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            Selesai ({completedOrders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nomor pesanan atau nama pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Order List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            {activeTab === 'pending' ? (
              <>
                <Clock className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-sm">Belum ada pesanan yang menunggu</p>
              </>
            ) : activeTab === 'processing' ? (
              <>
                <Package className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-sm">Belum ada pesanan yang diproses</p>
              </>
            ) : (
              <>
                <ReceiptIcon className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-sm">Belum ada riwayat pesanan</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Header dengan Badge Tipe Pesanan */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-800">{order.order_number}</h3>
                      
                      {/* Badge Dine In / Take Away */}
                      {order.order_type === 'dine_in' ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <UtensilsCrossed className="w-3 h-3" />
                          Dine In
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          Take Away
                        </span>
                      )}

                      {/* Badge Status Order */}
                      {order.status === 'pending_confirmation' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Menunggu Konfirmasi
                        </span>
                      )}
                      {order.status === 'pending_payment' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Menunggu Pembayaran
                        </span>
                      )}
                      {activeTab === 'processing' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Diproses
                        </span>
                      )}
                      {activeTab === 'completed' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Selesai
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{formatTime(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{formatRupiah(order.total)}</p>
                    <p className="text-xs text-gray-500 capitalize">{order.payment_method}</p>
                  </div>
                </div>

                {/* Info Pelanggan & Meja */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{order.customer_name}</span>
                  </div>
                  {order.table_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>Meja {order.table_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
  <User className="w-4 h-4 text-amber-500" />
  <span className="font-medium text-amber-700">Kasir: {order.cashier_name}</span>
</div>
                </div>

                {/* Items */}
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    {order.items.length} item • {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {item.quantity}x {item.menu_name}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        +{order.items.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={(paymentAmount) => handleConfirmOrder(selectedOrder.id, paymentAmount)}
          onComplete={activeTab === 'processing' ? () => handleCompleteOrder(selectedOrder.id) : undefined}
          onPrintOrder={(order) => setPrintOrder(order)}
          formatRupiah={formatRupiah}
          formatTime={formatTime}
          isPending={activeTab === 'pending'}
        />
      )}

      {/* Receipt Modal */}
      {printOrder && (
        <Receipt
          order={printOrder}
          onClose={() => setPrintOrder(null)}
          onPrint={() => {
            const receiptContent = document.getElementById('receipt-content');
            if (receiptContent) {
              const printWindow = window.open('', '', 'width=300,height=600');
              if (printWindow) {
                printWindow.document.write('<html><head><title>Cetak Struk</title>');
                printWindow.document.write('<style>body{font-family:monospace;font-size:12px;margin:0;padding:10px;}</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(receiptContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
              }
            }
          }}
        />
      )}
    </div>
  );
}

// Modal Detail Pesanan
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onConfirm?: (paymentAmount?: number) => void; // New
  onComplete?: () => void;
  onPrintOrder: (order: Order) => void;
  formatRupiah: (num: number) => string;
  formatTime: (date: Date | string) => string;
  isPending?: boolean; // New
}

function OrderDetailModal({ order, onClose, onConfirm, onComplete, onPrintOrder, formatRupiah, formatTime, isPending }: OrderDetailModalProps) {
  const [paymentAmount, setPaymentAmount] = useState(order.total.toString());
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Detail Pesanan</h2>
            <p className="text-sm text-gray-600">{order.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Info Pelanggan & Tipe Pesanan */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between mb-2">
              {/* Badge Tipe Pesanan */}
              {order.order_type === 'dine_in' ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4" />
                  Dine In
                </span>
              ) : (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  Take Away
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">{order.customer_name}</span>
            </div>
            {order.table_number && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Meja {order.table_number}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{formatTime(order.created_at)}</span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Item Pesanan</h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.quantity}x {item.menu_name}
                    </p>
                    <p className="text-xs text-gray-500">{formatRupiah(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatRupiah(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pajak (10%)</span>
                <span className="font-medium">{formatRupiah(order.tax)}</span>
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="text-lg font-bold text-blue-600">{formatRupiah(order.total)}</span>
            </div>
            {order.payment_amount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pembayaran</span>
                  <span className="font-medium">{formatRupiah(order.payment_amount)}</span>
                </div>
                {order.change !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kembalian</span>
                    <span className="font-medium text-green-600">{formatRupiah(order.change)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 space-y-2">
          {/* Jika pending & bayar di kasir - Input jumlah uang */}
          {isPending && order.payment_method === 'cash' && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Uang Diterima
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Masukkan jumlah uang"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {Number(paymentAmount) >= order.total && (
                <p className="text-sm text-green-600 mt-1">
                  Kembalian: {formatRupiah(Number(paymentAmount) - order.total)}
                </p>
              )}
            </div>
          )}

          {/* Status info untuk pending QRIS */}
          {isPending && order.payment_method === 'qris' && order.status === 'pending_payment' && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⏳ Menunggu pembayaran QRIS dari pelanggan
              </p>
            </div>
          )}

          {/* Tombol Konfirmasi untuk pending orders */}
          {onConfirm && isPending && (
            <button
              onClick={() => {
                if (order.payment_method === 'cash' && Number(paymentAmount) < order.total) {
                  alert('Jumlah uang tidak cukup!');
                  return;
                }
                onConfirm(order.payment_method === 'cash' ? Number(paymentAmount) : undefined);
              }}
              disabled={order.payment_method === 'cash' && Number(paymentAmount) < order.total}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Konfirmasi Pesanan
            </button>
          )}

          {/* Tombol Selesai untuk processing orders */}
          {onComplete && !isPending && (
            <button
              onClick={onComplete}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Tandai Selesai
            </button>
          )}

          {/* Tombol Cetak Struk */}
          <button
            onClick={() => onPrintOrder(order)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            {onComplete || isPending ? 'Cetak Struk' : 'Cetak Ulang Struk'}
          </button>

          {!onComplete && !isPending && (
            <div className="text-center text-xs text-gray-500 pt-2">
              ✓ Pesanan Selesai
            </div>
          )}
        </div>
      </div>
    </div>
  );
}