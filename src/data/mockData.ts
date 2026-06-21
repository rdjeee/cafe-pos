export const categories = [
  { id: 1, name: 'Semua' },
  { id: 2, name: 'Makanan' },
  { id: 3, name: 'Minuman' },
  { id: 4, name: 'Snack' },
];

export const menus = [
  { id: 1, category_id: 2, name: 'Nasi Goreng Spesial', price: 25000, image: '/placeholder.jpg' },
  { id: 2, category_id: 2, name: 'Mie Ayam Bakso', price: 20000, image: '/placeholder.jpg' },
  { id: 3, category_id: 3, name: 'Es Teh Manis', price: 5000, image: '/placeholder.jpg' },
  { id: 4, category_id: 3, name: 'Kopi Susu Gula Aren', price: 18000, image: '/placeholder.jpg' },
  { id: 5, category_id: 4, name: 'Kentang Goreng', price: 15000, image: '/placeholder.jpg' },
  { id: 6, category_id: 2, name: 'Ayam Geprek', price: 22000, image: '/placeholder.jpg' },
];

// Data meja (simulasi dari database)
export const tables = [
  { id: 1, table_number: 'A1', capacity: 2, status: 'available' },
  { id: 2, table_number: 'A2', capacity: 2, status: 'available' },
  { id: 3, table_number: 'A3', capacity: 4, status: 'available' },
  { id: 4, table_number: 'A4', capacity: 4, status: 'occupied' },
  { id: 5, table_number: 'B1', capacity: 6, status: 'available' },
  { id: 6, table_number: 'B2', capacity: 6, status: 'available' },
  { id: 7, table_number: 'C1', capacity: 8, status: 'available' },
  { id: 8, table_number: 'C2', capacity: 8, status: 'occupied' },
  { id: 9, table_number: 'VIP-1', capacity: 10, status: 'available' },
  { id: 10, table_number: 'VIP-2', capacity: 10, status: 'available' },
];