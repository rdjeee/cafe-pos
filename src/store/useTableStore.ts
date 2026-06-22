import { create } from 'zustand';

export interface Table {
  id: string;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  created_at: Date;
}

interface TableState {
  tables: Table[];
  addTable: (tableNumber: string, capacity: number) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  getTableByNumber: (number: string) => Table | undefined;
}

// Data awal meja
const initialTables: Table[] = [
  { id: '1', table_number: 'A1', capacity: 2, status: 'available', created_at: new Date() },
  { id: '2', table_number: 'A2', capacity: 2, status: 'available', created_at: new Date() },
  { id: '3', table_number: 'A3', capacity: 4, status: 'available', created_at: new Date() },
  { id: '4', table_number: 'A4', capacity: 4, status: 'occupied', created_at: new Date() },
  { id: '5', table_number: 'B1', capacity: 6, status: 'available', created_at: new Date() },
  { id: '6', table_number: 'B2', capacity: 6, status: 'available', created_at: new Date() },
  { id: '7', table_number: 'C1', capacity: 8, status: 'available', created_at: new Date() },
  { id: '8', table_number: 'C2', capacity: 8, status: 'occupied', created_at: new Date() },
  { id: '9', table_number: 'VIP-1', capacity: 10, status: 'available', created_at: new Date() },
  { id: '10', table_number: 'VIP-2', capacity: 10, status: 'available', created_at: new Date() },
];

export const useTableStore = create<TableState>((set, get) => ({
  tables: initialTables,

  addTable: (tableNumber, capacity) => {
    const newTable: Table = {
      id: Date.now().toString(),
      table_number: tableNumber.trim(),
      capacity,
      status: 'available',
      created_at: new Date(),
    };
    set({ tables: [...get().tables, newTable] });
  },

  updateTable: (id, updates) => {
    set({
      tables: get().tables.map((table) =>
        table.id === id ? { ...table, ...updates } : table
      ),
    });
  },

  deleteTable: (id) => {
    set({ tables: get().tables.filter((table) => table.id !== id) });
  },

  getTableByNumber: (number) => {
    return get().tables.find((table) => table.table_number === number);
  },
}));