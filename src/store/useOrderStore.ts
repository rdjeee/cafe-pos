import { create } from 'zustand';

export interface OrderItem {
  id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  cashier_name: string; // ← TAMBAHKAN INI
  shift_id: string; // ← TAMBAHKAN INI
  table_number?: string;
  order_type: 'dine_in' | 'take_away';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'qris';
  payment_amount?: number;
  change?: number;
  payment_status: 'pending' | 'paid' | 'confirmed'; // Status pembayaran
  status: 'pending_confirmation' | 'pending_payment' | 'processing' | 'completed' | 'cancelled';
  created_at: Date | string; // Allow both Date and string from localStorage
  completed_at?: Date | string;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  confirmOrder: (orderId: string, paymentAmount?: number) => void; // New function
  getProcessingOrders: () => Order[];
  getPendingOrders: () => Order[]; // New function
  getCompletedOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],

  addOrder: (order) => {
    set({ orders: [order, ...get().orders] });
  },

  updateOrderStatus: (orderId, status) => {
    set({
      orders: get().orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              completed_at: status === 'completed' ? new Date() : undefined,
            }
          : order
      ),
    });
  },

  confirmOrder: (orderId, paymentAmount) => {
    set({
      orders: get().orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'processing',
              payment_status: 'confirmed',
              payment_amount: paymentAmount || order.payment_amount,
              change: paymentAmount 
                ? paymentAmount - order.total 
                : order.change,
            }
          : order
      ),
    });
  },

  getPendingOrders: () => {
    return get().orders.filter(
      (order) => order.status === 'pending_confirmation' || order.status === 'pending_payment'
    );
  },

  getProcessingOrders: () => {
    return get().orders.filter(
      (order) => order.status === 'processing'
    );
  },

  getCompletedOrders: () => {
    return get().orders
      .filter((order) => order.status === 'completed')
      .sort((a, b) => {
        // Handle both Date objects and strings
        const dateA = typeof a.created_at === 'string' ? new Date(a.created_at) : a.created_at;
        const dateB = typeof b.created_at === 'string' ? new Date(b.created_at) : b.created_at;
        return dateB.getTime() - dateA.getTime();
      });
  },

  getOrderById: (orderId) => {
    return get().orders.find((order) => order.id === orderId);
  },
}));