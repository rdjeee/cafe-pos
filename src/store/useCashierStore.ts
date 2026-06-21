import { create } from 'zustand';

export interface Cashier {
  id: string;
  name: string;
  is_active: boolean;
  created_at: Date;
}

interface CashierState {
  cashiers: Cashier[];
  activeCashierId: string | null;
  ownerPin: string;
  
  setActiveCashier: (id: string | null) => void;
  addCashier: (name: string) => void;
  updateCashierName: (id: string, newName: string) => void;
  toggleCashierStatus: (id: string) => void;
  deleteCashier: (id: string) => void;
  getActiveCashiers: () => Cashier[];
  getActiveCashier: () => Cashier | undefined;
  verifyOwnerPin: (pin: string) => boolean;
  changeOwnerPin: (newPin: string) => void;
}

// Data awal kasir
const initialCashiers: Cashier[] = [
  { id: '1', name: 'Budi Santoso', is_active: true, created_at: new Date() },
  { id: '2', name: 'Siti Aminah', is_active: true, created_at: new Date() },
  { id: '3', name: 'Andi Pratama', is_active: false, created_at: new Date() },
];

export const useCashierStore = create<CashierState>((set, get) => ({
  cashiers: initialCashiers,
  activeCashierId: null,
  ownerPin: '1234', // PIN default owner

  setActiveCashier: (id) => set({ activeCashierId: id }),

  addCashier: (name) => {
    const newId = Date.now().toString();
    set({
      cashiers: [
        ...get().cashiers,
        {
          id: newId,
          name: name.trim(),
          is_active: true,
          created_at: new Date(),
        },
      ],
    });
  },

  updateCashierName: (id, newName) => {
    set({
      cashiers: get().cashiers.map((c) =>
        c.id === id ? { ...c, name: newName.trim() } : c
      ),
    });
  },

  toggleCashierStatus: (id) => {
    set({
      cashiers: get().cashiers.map((c) =>
        c.id === id ? { ...c, is_active: !c.is_active } : c
      ),
    });
  },

  deleteCashier: (id) => {
    set({
      cashiers: get().cashiers.filter((c) => c.id !== id),
      activeCashierId: get().activeCashierId === id ? null : get().activeCashierId,
    });
  },

  getActiveCashiers: () => {
    return get().cashiers.filter((c) => c.is_active);
  },

  getActiveCashier: () => {
    const state = get();
    return state.cashiers.find((c) => c.id === state.activeCashierId);
  },

  verifyOwnerPin: (pin) => {
    return get().ownerPin === pin;
  },

  changeOwnerPin: (newPin) => {
    set({ ownerPin: newPin });
  },
}));