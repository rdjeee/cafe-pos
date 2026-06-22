# 🔔 Fitur QR Ordering Real-time

## Fitur Utama

### 1. **Real-time Sync Pesanan QR**
- ✅ Auto-sync setiap 3 detik
- ✅ Notifikasi visual saat ada pesanan baru
- ✅ Badge merah di tab "Pesanan" menunjukkan jumlah pesanan baru
- ✅ Tombol manual sync dengan timestamp terakhir
- ✅ Multi-tab support via localStorage events

### 2. **Notifikasi Visual**
- 🔔 **Floating notification** hijau muncul di kanan atas
- 📊 **Badge counter** merah di tombol "Pesanan"
- ⏱️ **Sync timer** menunjukkan kapan terakhir sync
- ✨ **Animasi bounce** untuk menarik perhatian

---

## 🚀 Cara Penggunaan

### A. Setup QR Code per Meja

1. **Buka Halaman Kasir**
   - Akses: `http://localhost:3000/cashier`

2. **Generate QR Code**
   - Klik tombol **"QR Ordering"** di header
   - Pilih atau tambah meja (contoh: A1, B2, VIP-1)
   - Klik **"Download QR Code"**
   - Print dan tempel di meja yang sesuai

### B. Proses Pemesanan via QR

1. **Pelanggan Scan QR Code**
   - Scan QR code di meja
   - Browser otomatis buka: `http://localhost:3000/order?table=A1`
   - Nomor meja sudah terisi otomatis

2. **Pelanggan Pilih Menu**
   - Browse menu yang tersedia
   - Klik item untuk tambah ke keranjang
   - Atur jumlah sesuai kebutuhan

3. **Submit Pesanan**
   - Isi nama pelanggan
   - Pilih metode pembayaran (Cash/QRIS/Transfer)
   - Klik **"Pesan Sekarang"**
   - Dapat nomor pesanan konfirmasi

### C. Kasir Terima Pesanan

**Otomatis (Auto-sync):**
- Pesanan otomatis masuk setiap 3 detik
- Notifikasi hijau muncul: "X pesanan baru dari QR!"
- Badge merah muncul di tab "Pesanan"
- Pesanan masuk ke status "Diproses"

**Manual (Sync Manual):**
- Klik tombol **refresh icon** (🔄) di header
- Melihat timestamp sync terakhir
- Hover untuk info detail

---

## 📋 Technical Flow

```
┌─────────────┐
│  Customer   │
│  Scan QR    │
└──────┬──────┘
       │
       v
┌─────────────────────────┐
│  /order?table=A1        │
│  - Auto-fill table      │
│  - Select menu items    │
│  - Submit order         │
└──────┬──────────────────┘
       │
       v
┌─────────────────────────┐
│  localStorage           │
│  key: 'qr_orders'       │
│  value: Order[]         │
└──────┬──────────────────┘
       │
       v
┌─────────────────────────┐
│  useQROrdersSync Hook   │
│  - Poll every 3s        │
│  - Storage event        │
│  - Manual sync          │
└──────┬──────────────────┘
       │
       v
┌─────────────────────────┐
│  useOrderStore          │
│  - addOrder()           │
│  - status: 'processing' │
└──────┬──────────────────┘
       │
       v
┌─────────────────────────┐
│  Cashier UI             │
│  - Badge notification   │
│  - Floating alert       │
│  - Order list updated   │
└─────────────────────────┘
```

---

## 🎨 UI Components

### 1. Badge Notification (Tab Pesanan)
```tsx
{newOrdersNotification > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
    {newOrdersNotification}
  </span>
)}
```

### 2. Floating Notification (Top Right)
```tsx
{newOrdersNotification > 0 && (
  <div className="fixed top-4 right-4 z-50 animate-bounce">
    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl">
      <Bell className="w-6 h-6" />
      <p className="font-bold text-lg">Pesanan Baru dari QR!</p>
      <p className="text-sm">{newOrdersNotification} pesanan menunggu konfirmasi</p>
    </div>
  </div>
)}
```

### 3. Manual Sync Button
```tsx
<button onClick={syncNow} title={`Terakhir sync: ${formatSyncTime(lastSyncTime)}`}>
  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
  <span>{formatSyncTime(lastSyncTime)}</span>
</button>
```

---

## 🔧 Files Modified

1. **`src/hooks/useQRordersSync.ts`**
   - Added: `pendingCount`, `lastSyncTime`, `newOrdersNotification`
   - Added: `syncNow()` manual function
   - Enhanced: Auto-clear notification after 5s

2. **`app/cashier/page.tsx`**
   - Added: Floating notification component
   - Added: Badge on "Pesanan" button
   - Added: Manual sync button with timestamp
   - Added: `formatSyncTime()` helper

---

## 🧪 Testing

### Test Scenario 1: Single Order
1. Open `http://localhost:3000/cashier` (Tab 1)
2. Open `http://localhost:3000/order?table=A1` (Tab 2)
3. In Tab 2: Add items → Submit order
4. In Tab 1: 
   - ✅ Notification appears within 3 seconds
   - ✅ Badge shows "1" on Pesanan button
   - ✅ Order appears in "Diproses" tab

### Test Scenario 2: Multiple Orders
1. Submit 3 orders from different tables (A1, A2, B1)
2. Check kasir:
   - ✅ Notification shows "3 pesanan baru"
   - ✅ Badge shows "3"
   - ✅ All 3 orders in list

### Test Scenario 3: Manual Sync
1. Submit order from QR
2. Click refresh button immediately
3. ✅ Order syncs instantly
4. ✅ Timestamp updates

### Test Scenario 4: Multi-tab Sync
1. Open kasir in 2 browser tabs
2. Submit order from QR
3. ✅ Both tabs receive update via storage event

---

## 💡 Future Enhancements

- [ ] WebSocket untuk real-time tanpa polling
- [ ] Push notification untuk kasir mobile
- [ ] Sound notification saat pesanan masuk
- [ ] Filter pesanan per meja
- [ ] History pesanan per QR session
- [ ] Analytics: popularitas meja, waktu order

---

## 🐛 Troubleshooting

**Q: Pesanan tidak muncul di kasir?**
- Cek localStorage: buka DevTools → Application → Local Storage
- Pastikan key `qr_orders` ada data
- Klik manual sync button
- Cek console untuk error logs

**Q: Notifikasi tidak hilang?**
- Notifikasi auto-clear setelah 5 detik
- Refresh halaman jika stuck

**Q: Multi-tab tidak sync?**
- Pastikan kedua tab same origin
- localStorage events hanya work same domain

---

## 📝 Developer Notes

**Storage Structure:**
```typescript
interface QROrder {
  id: string;
  order_number: string;
  table_number: string;
  customer_name: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  payment_status: string;
  order_type: 'dine_in';
  created_at: Date;
}

localStorage.setItem('qr_orders', JSON.stringify([order1, order2, ...]));
```

**Hook Return Values:**
```typescript
const {
  pendingCount,        // number - jumlah pending orders
  lastSyncTime,        // Date | null - waktu sync terakhir
  newOrdersNotification, // number - untuk badge & notif
  syncNow,             // () => void - manual sync function
} = useQROrdersSync();
```

---

**Created:** June 21, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready
