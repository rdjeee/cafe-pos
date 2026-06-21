import { create } from 'zustand';
import { useCashierStore } from './useCashierStore';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  orderType: 'dine_in' | 'take_away';
  tableNumber: string;
  customerName: string;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  setOrderType: (type: 'dine_in' | 'take_away') => void;
  setTableNumber: (num: string) => void;
  setCustomerName: (name: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  isReadyToPay: () => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine_in',
  tableNumber: '',
  customerName: '',
  
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    });
  },

  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (num) => set({ tableNumber: num }),
  setCustomerName: (name) => set({ customerName: name }),
  
  clearCart: () => set({ 
    items: [], 
    tableNumber: '', 
    customerName: '', 
    orderType: 'dine_in' 
  }),
  
  getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  // Validasi siap bayar: Customer name WAJIB, nomor meja OPSIONAL
  isReadyToPay: () => {
  const state = get();
  if (state.items.length === 0) return false;
  if (!state.customerName.trim()) return false;
  // Tambahkan: cek apakah kasir aktif dipilih
  const { getActiveCashier } = useCashierStore.getState();
  if (!getActiveCashier()) return false;
  return true;
},
}));