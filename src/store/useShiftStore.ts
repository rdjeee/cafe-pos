import { create } from 'zustand';

export interface Shift {
  id: string;
  cashier_id: string;
  cashier_name: string;
  start_time: Date;
  end_time?: Date;
  opening_balance: number;
  closing_balance?: number;
  status: 'open' | 'closed';
}

interface ShiftState {
  currentShift: Shift | null;
  shiftHistory: Shift[];
  
  openShift: (cashierId: string, cashierName: string, openingBalance: number) => void;
  closeShift: (closingBalance: number) => void;
  getCurrentShift: () => Shift | null;
  isShiftOpen: () => boolean;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  shiftHistory: [],

  openShift: (cashierId, cashierName, openingBalance) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      cashier_id: cashierId,
      cashier_name: cashierName,
      start_time: new Date(),
      opening_balance: openingBalance,
      status: 'open',
    };
    set({ currentShift: newShift });
  },

  closeShift: (closingBalance) => {
    const current = get().currentShift;
    if (!current) return;

    const closedShift: Shift = {
      ...current,
      end_time: new Date(),
      closing_balance: closingBalance,
      status: 'closed',
    };

    set({
      currentShift: null,
      shiftHistory: [closedShift, ...get().shiftHistory],
    });
  },

  getCurrentShift: () => get().currentShift,
  isShiftOpen: () => get().currentShift !== null,
}));