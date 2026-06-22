'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, UtensilsCrossed, User, AlertCircle, Minus, Plus, Wallet, QrCode, CheckCircle } from 'lucide-react';
import { menus, categories } from '@/data/mockData';
import { useCartStore } from '@/store/useCartStore';
import { useTableStore } from '@/store/useTableStore';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CustomerOrderPage() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  
  const [activeCategory, setActiveCategory] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cashier' | 'qris'>('cashier');
  const [showCart, setShowCart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showQRIS, setShowQRIS] = useState(false);
  const [qrisSimulated, setQrisSimulated] = useState(false);
  
  // Store payment method untuk success message
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState<'cashier' | 'qris'>('cashier');
  const [completedOrderTotal, setCompletedOrderTotal] = useState(0);

  const { getTableByNumber } = useTableStore();
  const table = getTableByNumber(tableNumber);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const addToCart = (menu: typeof menus[0]) => {
    const existing = cart.find(item => item.id === menu.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...menu, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: qty } : item
      ));
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (!customerName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    // Jika pilih QRIS, tampilkan modal QRIS dulu
    if (paymentMethod === 'qris') {
      setShowQRIS(true);
      return;
    }

    // Jika bayar di kasir, langsung submit
    submitOrderToKasir();
  };

  const submitOrderToKasir = () => {
    // Generate order number
    const newOrderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    const orderData = {
      id: `order-${Date.now()}`,
      order_number: newOrderNumber,
      customer_name: customerName,
      cashier_name: 'QR Order',
      shift_id: 'qr_order',
      table_number: tableNumber,
      order_type: 'dine_in' as const,
      items: cart.map(item => ({
        id: item.id,
        menu_id: item.id,
        menu_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: totalPrice,
      tax: 0,
      total: totalPrice,
      payment_method: paymentMethod === 'cashier' ? 'cash' as const : 'qris' as const,
      payment_amount: 0,
      change: 0,
      payment_status: 'pending' as const,
      status: paymentMethod === 'cashier' ? 'pending_confirmation' as const : 'pending_payment' as const,
      created_at: new Date(),
      completed_at: undefined,
      source: 'qr_order',
    };

    // Simpan ke localStorage
    const existingOrders = JSON.parse(localStorage.getItem('qr_orders') || '[]');
    localStorage.setItem('qr_orders', JSON.stringify([...existingOrders, orderData]));

    // Trigger storage event untuk immediate sync
    window.dispatchEvent(new Event('storage'));

    setOrderNumber(newOrderNumber);
    setCompletedPaymentMethod(paymentMethod); // Save payment method
    setCompletedOrderTotal(totalPrice); // Save total before clearing
    setOrderSuccess(true);
    setCart([]);
    setCustomerName('');
    setShowCart(false);
    setShowQRIS(false);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
          {completedPaymentMethod === 'cashier' ? (
            // Untuk Bayar di Kasir - Instruksi ke kasir
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Diterima!</h2>
              <p className="text-gray-600 mb-4">
                Silakan tunjukkan nomor pesanan ini ke kasir untuk pembayaran.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Nomor Pesanan</p>
                <p className="text-2xl font-bold text-blue-600 mb-2">{orderNumber}</p>
                <div className="border-t border-blue-200 my-3"></div>
                <p className="text-sm text-gray-600">Total Pembayaran</p>
                <p className="text-xl font-bold text-gray-800">{formatRupiah(completedOrderTotal)}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800 font-medium">
                  💳 Menunggu Pembayaran di Kasir
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Pesanan akan diproses setelah pembayaran dikonfirmasi
                </p>
              </div>
            </>
          ) : (
            // Untuk QRIS - Pembayaran sudah lunas
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
              <p className="text-gray-600 mb-4">
                Pesanan Anda telah dibayar dan akan segera diproses.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Nomor Pesanan</p>
                <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Pesanan akan segera diproses. Terima kasih!
              </p>
            </>
          )}
          
          {/* Button Kembali ke Menu */}
          <button
            onClick={() => {
              setOrderSuccess(false);
              setOrderNumber('');
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-xl font-bold">Menu Digital</h1>
            <p className="text-sm text-blue-100">Scan & Pesan Sendiri</p>
            </div>
            {tableNumber && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {table ? `Meja ${table.table_number}` : `Meja: ${tableNumber}`}
            </div>
            )}
        </div>
        </div>

      {/* Categories */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {menus
            .filter(menu => activeCategory === 1 || menu.category_id === activeCategory)
            .map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="h-32 bg-gray-200 flex items-center justify-center">
                  {menu.image ? (
                    <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2">
                    {menu.name}
                  </h3>
                  <p className="text-blue-600 font-bold text-sm mb-2">
                    {formatRupiah(menu.price)}
                  </p>
                  <button
                    onClick={() => addToCart(menu)}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-blue-600 text-white rounded-xl shadow-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{totalItems} item</p>
                <p className="text-lg font-bold">{formatRupiah(totalPrice)}</p>
              </div>
            </div>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Pesanan Anda</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xs text-gray-400">Img</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-xs text-blue-600 font-bold mb-2">{formatRupiah(item.price)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 bg-white border rounded hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 bg-white border rounded hover:bg-gray-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{formatRupiah(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Info */}
            <div className="p-4 border-t space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Anda <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('cashier')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      paymentMethod === 'cashier'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Wallet className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-xs font-medium">Bayar di Kasir</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11v2m-6 0a6 6 0 110-12 6 6 0 010 12z" />
                    </svg>
                    <p className="text-xs font-medium">QRIS</p>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatRupiah(totalPrice)}</span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || !customerName.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Pesan Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Payment Modal */}
      {showQRIS && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Scan QRIS untuk Bayar</h2>
              <p className="text-sm text-gray-600 mb-4">
                Total: <span className="font-bold text-blue-600">{formatRupiah(totalPrice)}</span>
              </p>
              
              {/* QR Code Placeholder */}
              <div className="bg-gray-100 w-48 h-48 mx-auto mb-4 flex items-center justify-center rounded-lg border-2 border-gray-300">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">QR Code QRIS</p>
                </div>
              </div>

              {!qrisSimulated ? (
                <>
                  <p className="text-xs text-gray-500 mb-4">
                    Simulasi: Klik tombol di bawah untuk simulasi pembayaran berhasil
                  </p>
                  <button
                    onClick={() => setQrisSimulated(true)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mb-2"
                  >
                    ✓ Simulasi Pembayaran Berhasil
                  </button>
                  <button
                    onClick={() => {
                      setShowQRIS(false);
                      setQrisSimulated(false);
                    }}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">Pembayaran Berhasil!</p>
                    <p className="text-xs text-green-600">Mengirim pesanan ke kasir...</p>
                  </div>
                  <button
                    onClick={() => {
                      submitOrderToKasir();
                      setQrisSimulated(false);
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    Lanjutkan
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}