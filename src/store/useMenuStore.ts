import { create } from 'zustand';

export interface Menu {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  is_available: boolean;
}

interface MenuState {
  menus: Menu[];
  addMenu: (menu: Omit<Menu, 'id' | 'is_available'>) => void;
  updateMenu: (id: number, menu: Partial<Menu>) => void;
  deleteMenu: (id: number) => void;
  toggleAvailability: (id: number) => void;
}

// Data awal (sama dengan mockData)
const initialMenus: Menu[] = [
  { id: 1, category_id: 2, name: 'Nasi Goreng Spesial', price: 25000, description: '', image:'', is_available: true },
  { id: 2, category_id: 2, name: 'Mie Ayam Bakso', price: 20000, description: '', image:'', is_available: true },
  { id: 3, category_id: 3, name: 'Es Teh Manis', price: 5000, description: '', image:'', is_available: true },
  { id: 4, category_id: 3, name: 'Kopi Susu Gula Aren', price: 18000, description: '', image:'', is_available: true },
  { id: 5, category_id: 4, name: 'Kentang Goreng', price: 15000, description: '', image:'', is_available: true },
  { id: 6, category_id: 2, name: 'Ayam Geprek', price: 22000, description: '', image:'', is_available: true },
];

export const useMenuStore = create<MenuState>((set, get) => ({
  menus: initialMenus,

  addMenu: (menu) => {
    const currentMenus = get().menus;
    const newId = currentMenus.length > 0 
      ? Math.max(...currentMenus.map((m) => m.id)) + 1 
      : 1;
    
    set({
      menus: [...currentMenus, { ...menu, id: newId, is_available: true }],
    });
  },

  updateMenu: (id, updatedMenu) => {
    set({
      menus: get().menus.map((m) => (m.id === id ? { ...m, ...updatedMenu } : m)),
    });
  },

  deleteMenu: (id) => {
    set({ menus: get().menus.filter((m) => m.id !== id) });
  },

  toggleAvailability: (id) => {
    set({
      menus: get().menus.map((m) =>
        m.id === id ? { ...m, is_available: !m.is_available } : m
      ),
    });
  },
}));