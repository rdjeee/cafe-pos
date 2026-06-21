'use client';

import { useState } from 'react';
import { Search, Plus, ChefHat, Trash2, MoreVertical, X } from 'lucide-react';
import { categories } from '@/data/mockData';
import { useMenuStore } from '@/store/useMenuStore';
import { useCartStore } from '@/store/useCartStore';
import AddMenuModal from './AddMenuModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function MenuPanel() {
  const [activeCategory, setActiveCategory] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<{ id: number; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  const { menus, deleteMenu } = useMenuStore();
  const { addItem } = useCartStore();

  const filteredMenus = menus.filter((menu) => {
    const matchCategory = activeCategory === 1 || menu.category_id === activeCategory;
    const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleDeleteClick = (id: number, name: string) => {
    setMenuToDelete({ id, name });
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = () => {
    if (menuToDelete) {
      deleteMenu(menuToDelete.id);
      setMenuToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setMenuToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const toggleMenu = (id: number) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Tutup menu saat klik di luar
  const closeAllMenus = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 p-4 overflow-hidden" onClick={closeAllMenus}>
      {/* Header dengan Tombol Tambah Menu */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-blue-600" />
          Menu Kasir
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tambah Menu
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari menu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        {filteredMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ChefHat className="w-16 h-16 mb-2 opacity-50" />
            <p className="text-sm">Tidak ada menu yang ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                onClick={(e) => e.stopPropagation()}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative ${
                  !menu.is_available ? 'opacity-50' : ''
                }`}
              >
                {/* Tombol Menu (⋮) - Selalu Terlihat */}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(menu.id);
                    }}
                    className="p-1.5 bg-white/90 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === menu.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(menu.id, menu.name);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-32 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {menu.image ? (
                        <img
                        src={menu.image}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-sm text-gray-400">No Image</span>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 pr-8">
                    {menu.name}
                  </h3>
                  {menu.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{menu.description}</p>
                  )}
                  <p className="text-blue-600 font-bold text-sm mt-auto mb-2">
                    {formatRupiah(menu.price)}
                  </p>
                  <button
                    onClick={() =>
                      addItem({
                        id: menu.id,
                        name: menu.name,
                        price: menu.price,
                        image: menu.image || '',
                      })
                    }
                    disabled={!menu.is_available}
                    className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 py-1.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Menu */}
      <AddMenuModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        menuName={menuToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}