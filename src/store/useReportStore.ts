import { create } from 'zustand';
import { useOrderStore, Order } from './useOrderStore';

export interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  cash_payments: number;
  qris_payments: number;
  dine_in_orders: number;
  take_away_orders: number;
}

export interface MenuPerformance {
  menu_id: number;
  menu_name: string;
  total_sold: number;
  total_revenue: number;
  category: string;
}

interface ReportState {
  getDailyReport: (date?: string) => DailyReport;
  getReportByDateRange: (startDate: string, endDate: string) => DailyReport;
  getWeeklyReport: () => DailyReport[];
  getMonthlyReport: () => DailyReport[];
  getMenuPerformance: () => MenuPerformance[];
  getPaymentMethodReport: () => { cash: number; qris: number };
  getOrderTypeReport: () => { dine_in: number; take_away: number };
}

export const useReportStore = create<ReportState>((set, get) => ({
  getDailyReport: (date?: string) => {
    const orders = useOrderStore.getState().orders;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate === targetDate && order.status === 'completed';
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItemsSold = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const cashPayments = filteredOrders
      .filter(order => order.payment_method === 'cash')
      .reduce((sum, order) => sum + order.total, 0);
    const qrisPayments = filteredOrders
      .filter(order => order.payment_method === 'qris')
      .reduce((sum, order) => sum + order.total, 0);
    const dineInOrders = filteredOrders.filter(order => order.order_type === 'dine_in').length;
    const takeAwayOrders = filteredOrders.filter(order => order.order_type === 'take_away').length;

    return {
      date: targetDate,
      total_orders: filteredOrders.length,
      total_revenue: totalRevenue,
      total_items_sold: totalItemsSold,
      cash_payments: cashPayments,
      qris_payments: qrisPayments,
      dine_in_orders: dineInOrders,
      take_away_orders: takeAwayOrders,
    };
  },

  getReportByDateRange: (startDate: string, endDate: string) => {
    const orders = useOrderStore.getState().orders;
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate >= startDate && orderDate <= endDate && order.status === 'completed';
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalItemsSold = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const cashPayments = filteredOrders
      .filter(order => order.payment_method === 'cash')
      .reduce((sum, order) => sum + order.total, 0);
    const qrisPayments = filteredOrders
      .filter(order => order.payment_method === 'qris')
      .reduce((sum, order) => sum + order.total, 0);
    const dineInOrders = filteredOrders.filter(order => order.order_type === 'dine_in').length;
    const takeAwayOrders = filteredOrders.filter(order => order.order_type === 'take_away').length;

    return {
      date: `${startDate} - ${endDate}`,
      total_orders: filteredOrders.length,
      total_revenue: totalRevenue,
      total_items_sold: totalItemsSold,
      cash_payments: cashPayments,
      qris_payments: qrisPayments,
      dine_in_orders: dineInOrders,
      take_away_orders: takeAwayOrders,
    };
  },

  getWeeklyReport: () => {
    const orders = useOrderStore.getState().orders;
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const reports: DailyReport[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === dateStr && order.status === 'completed';
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalItemsSold = filteredOrders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const cashPayments = filteredOrders
        .filter(order => order.payment_method === 'cash')
        .reduce((sum, order) => sum + order.total, 0);
      const qrisPayments = filteredOrders
        .filter(order => order.payment_method === 'qris')
        .reduce((sum, order) => sum + order.total, 0);
      const dineInOrders = filteredOrders.filter(order => order.order_type === 'dine_in').length;
      const takeAwayOrders = filteredOrders.filter(order => order.order_type === 'take_away').length;

      reports.push({
        date: dateStr,
        total_orders: filteredOrders.length,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        cash_payments: cashPayments,
        qris_payments: qrisPayments,
        dine_in_orders: dineInOrders,
        take_away_orders: takeAwayOrders,
      });
    }

    return reports;
  },

  getMonthlyReport: () => {
    const orders = useOrderStore.getState().orders;
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const reports: DailyReport[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === dateStr && order.status === 'completed';
      });

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalItemsSold = filteredOrders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const cashPayments = filteredOrders
        .filter(order => order.payment_method === 'cash')
        .reduce((sum, order) => sum + order.total, 0);
      const qrisPayments = filteredOrders
        .filter(order => order.payment_method === 'qris')
        .reduce((sum, order) => sum + order.total, 0);
      const dineInOrders = filteredOrders.filter(order => order.order_type === 'dine_in').length;
      const takeAwayOrders = filteredOrders.filter(order => order.order_type === 'take_away').length;

      reports.push({
        date: dateStr,
        total_orders: filteredOrders.length,
        total_revenue: totalRevenue,
        total_items_sold: totalItemsSold,
        cash_payments: cashPayments,
        qris_payments: qrisPayments,
        dine_in_orders: dineInOrders,
        take_away_orders: takeAwayOrders,
      });
    }

    return reports;
  },

  getMenuPerformance: () => {
    const orders = useOrderStore.getState().orders.filter(o => o.status === 'completed');
    const menuMap = new Map<number, MenuPerformance>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = menuMap.get(item.menu_id);
        if (existing) {
          existing.total_sold += item.quantity;
          existing.total_revenue += item.subtotal;
        } else {
          menuMap.set(item.menu_id, {
            menu_id: item.menu_id,
            menu_name: item.menu_name,
            total_sold: item.quantity,
            total_revenue: item.subtotal,
            category: 'Unknown', // Bisa ditambahkan dari menu store
          });
        }
      });
    });

    return Array.from(menuMap.values()).sort((a, b) => b.total_sold - a.total_sold);
  },

  getPaymentMethodReport: () => {
    const orders = useOrderStore.getState().orders.filter(o => o.status === 'completed');
    const cash = orders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total, 0);
    const qris = orders.filter(o => o.payment_method === 'qris').reduce((sum, o) => sum + o.total, 0);
    return { cash, qris };
  },

  getOrderTypeReport: () => {
    const orders = useOrderStore.getState().orders.filter(o => o.status === 'completed');
    const dine_in = orders.filter(o => o.order_type === 'dine_in').length;
    const take_away = orders.filter(o => o.order_type === 'take_away').length;
    return { dine_in, take_away };
  },
}));