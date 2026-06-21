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
  status: 'processing' | 'completed' | 'cancelled';
  created_at: Date;
  completed_at?: Date;
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getProcessingOrders: () => Order[];
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

  getProcessingOrders: () => {
    return get().orders.filter(
      (order) => order.status === 'processing'
    );
  },

  getCompletedOrders: () => {
    return get().orders
      .filter((order) => order.status === 'completed')
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  getOrderById: (orderId) => {
    return get().orders.find((order) => order.id === orderId);
  },
}));