'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX,
  Save,
  X,
  Key,
  UtensilsCrossed,
  Plus
} from 'lucide-react';
import { useCashierStore, Cashier } from '@/store/useCashierStore';
import { useTableStore, Table } from '@/store/useTableStore';

interface CashierManagementProps {
  onBack: () => void;
}

type TabType = 'cashiers' | 'tables';

export default function CashierManagement({ onBack }: CashierManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cashiers');
  
  // Cashier States
  const { 
    cashiers, 
    addCashier, 
    updateCashierName, 
    toggleCashierStatus, 
    deleteCashier,
    changeOwnerPin
  } = useCashierStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCashierName, setNewCashierName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  // Table States
  const { tables, addTable, updateTable, deleteTable } = useTableStore();
  const [showAddTableForm, setShowAddTableForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('');

  const activeCount = cashiers.filter(c => c.is_active).length;
  const inactiveCount = cashiers.filter(c => !c.is_active).length;

  // Cashier Handlers
  const handleAddCashier = () => {
    if (newCashierName.trim()) {
      addCashier(newCashierName);
      setNewCashierName('');
      setShowAddForm(false);
    }
  };

  const handleEditStart = (cashier: Cashier) => {
    setEditingId(cashier.id);
    setEditName(cashier.name);
  };

  const handleEditSave = (id: string) => {
    if (editName.trim()) {
      updateCashierName(id, editName);
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (cashier: Cashier) => {
    if (cashier.is_active) {
      alert(`⚠️ "${cashier.name}" masih aktif! Nonaktifkan terlebih dahulu sebelum menghapus.`);
      return;
    }
    if (confirm(`Yakin ingin menghapus "${cashier.name}" secara permanen?\n\nData transaksi terkait akan tetap tersimpan.`)) {
      deleteCashier(cashier.id);
    }
  };

  const handleChangePin = () => {
    if (newPin.length < 4) {
      setPinMessage('❌ PIN minimal 4 digit');
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage('❌ PIN tidak cocok!');
      return;
    }
    changeOwnerPin(newPin);
    setPinMessage('✅ PIN berhasil diubah!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => {
      setShowChangePin(false);
      setPinMessage('');
    }, 1500);
  };

  // Table Handlers
  const handleAddTable = () => {
    if (!newTableNumber.trim()) {
      alert('Nomor meja wajib diisi!');
      return;
    }
    const capacity = parseInt(newTableCapacity) || 2;
    addTable(newTableNumber.toUpperCase(), capacity);
    setNewTableNumber('');
    setNewTableCapacity('');
    setShowAddTableForm(false);
  };

  const handleEditTableStart = (table: Table) => {
    setEditingTableId(table.id);
    setEditTableNumber(table.table_number);
    setEditTableCapacity(table.capacity.toString());
  };

  const handleEditTableSave = (id: string) => {
    if (!editTableNumber.trim()) {
      alert('Nomor meja tidak boleh kosong!');
      return;
    }
    const capacity = parseInt(editTableCapacity) || 2;
    updateTable(id, {
      table_number: editTableNumber.toUpperCase(),
      capacity,
    });
    setEditingTableId(null);
  };

  const handleDeleteTable = (table: Table) => {
    if (table.status === 'occupied') {
      alert(`⚠️ Meja "${table.table_number}" sedang terisi! Tidak bisa dihapus.`);
      return;
    }
    if (confirm(`Yakin ingin menghapus meja "${table.table_number}"?`)) {
      deleteTable(table.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {activeTab === 'cashiers' ? 'Kelola Kasir' : 'Kelola Meja'}
              </h1>
              <p className="text-xs text-gray-500">
                {activeTab === 'cashiers' ? 'Manajemen data pengguna kasir' : 'Manajemen meja dan QR ordering'}
              </p>
            </div>
          </div>
          {activeTab === 'cashiers' && (
          <button
            onClick={() => setShowChangePin(true)}
            className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Key className="w-4 h-4" />
            Ganti PIN
          </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('cashiers')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'cashiers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Kelola Kasir
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Kelola Meja
          </button>
        </div>

        {/* Stats */}
        {activeTab === 'cashiers' && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-600">Total Kasir</p>
            <p className="text-lg font-bold text-blue-700">{cashiers.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-600">Aktif</p>
            <p className="text-lg font-bold text-green-700">{activeCount}</p>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
            <UserX className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Non-Aktif</p>
            <p className="text-lg font-bold text-gray-700">{inactiveCount}</p>
          </div>
        </div>
        )}

        {activeTab === 'tables' && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <UtensilsCrossed className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-600">Total Meja</p>
            <p className="text-lg font-bold text-purple-700">{tables.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-600">Tersedia</p>
            <p className="text-lg font-bold text-green-700">{tables.filter(t => t.status === 'available').length}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <UserX className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="text-xs text-red-600">Terisi</p>
            <p className="text-lg font-bold text-red-700">{tables.filter(t => t.status === 'occupied').length}</p>
          </div>
        </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'cashiers' ? (
          <div className="space-y-3">
            {/* Add Cashier Form */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Tambah Kasir Baru
              </h3>
              {showAddForm ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCashierName}
                    onChange={(e) => setNewCashierName(e.target.value)}
                    placeholder="Nama Kasir (misal: Budi Santoso)"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCashier()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCashier}
                      disabled={!newCashierName.trim()}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Simpan
                    </button>
                    <button
                      onClick={() => { setShowAddForm(false); setNewCashierName(''); }}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kasir
                </button>
              )}
            </div>

            {/* Cashier List */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Daftar Kasir ({cashiers.length})
              </h3>
              
              {cashiers.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Belum ada kasir</p>
                  <p className="text-xs text-gray-400 mt-1">Tambahkan kasir pertama Anda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cashiers.map((cashier) => (
                    <div
                      key={cashier.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        cashier.is_active
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {editingId === cashier.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && handleEditSave(cashier.id)}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(cashier.id)}
                              className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                            >
                              <Save className="w-3 h-3 inline mr-1" />
                              Simpan
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditName(''); }}
                              className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                            >
                              <X className="w-3 h-3 inline mr-1" />
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${cashier.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={`font-medium text-sm ${cashier.is_active ? 'text-green-800' : 'text-gray-700'}`}>
                              {cashier.name}
                            </span>
                            {cashier.is_active && (
                              <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditStart(cashier)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Edit Nama"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleCashierStatus(cashier.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                cashier.is_active
                                  ? 'text-amber-600 hover:bg-amber-100'
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={cashier.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              {cashier.is_active ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(cashier)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Kasir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                💡 <strong>Tips:</strong> Nonaktifkan kasir yang sudah tidak bertugas. Kasir yang aktif bisa dipilih saat membuat pesanan.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Add Table Form */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tambah Meja Baru
              </h3>
              {showAddTableForm ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Nomor Meja</label>
                      <input
                        type="text"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        placeholder="C3, VIP-1, dll"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Kapasitas</label>
                      <input
                        type="number"
                        value={newTableCapacity}
                        onChange={(e) => setNewTableCapacity(e.target.value)}
                        placeholder="2"
                        min="1"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTable}
                      disabled={!newTableNumber.trim()}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <Save className="w-4 h-4 inline mr-1" />
                      Simpan
                    </button>
                    <button
                      onClick={() => { 
                        setShowAddTableForm(false); 
                        setNewTableNumber(''); 
                        setNewTableCapacity('');
                      }}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTableForm(true)}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Meja
                </button>
              )}
            </div>

            {/* Table List */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Daftar Meja ({tables.length})
              </h3>
              
              {tables.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Belum ada meja</p>
                  <p className="text-xs text-gray-400 mt-1">Tambahkan meja pertama Anda</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        table.status === 'available'
                          ? 'bg-green-50 border-green-300'
                          : table.status === 'occupied'
                          ? 'bg-red-50 border-red-300'
                          : 'bg-yellow-50 border-yellow-300'
                      }`}
                    >
                      {editingTableId === table.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTableNumber}
                            onChange={(e) => setEditTableNumber(e.target.value)}
                            placeholder="Nomor Meja"
                            className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            autoFocus
                          />
                          <input
                            type="number"
                            value={editTableCapacity}
                            onChange={(e) => setEditTableCapacity(e.target.value)}
                            placeholder="Kapasitas"
                            className="w-full px-2 py-1 border border-purple-300 rounded text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTableSave(table.id)}
                              className="flex-1 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
                            >
                              <Save className="w-3 h-3 inline" />
                            </button>
                            <button
                              onClick={() => { 
                                setEditingTableId(null); 
                                setEditTableNumber(''); 
                                setEditTableCapacity('');
                              }}
                              className="flex-1 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
                            >
                              <X className="w-3 h-3 inline" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">Meja {table.table_number}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              table.status === 'available'
                                ? 'bg-green-200 text-green-700'
                                : table.status === 'occupied'
                                ? 'bg-red-200 text-red-700'
                                : 'bg-yellow-200 text-yellow-700'
                            }`}>
                              {table.status === 'available' ? 'Tersedia' : table.status === 'occupied' ? 'Terisi' : 'Reserved'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Kapasitas: {table.capacity} orang
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTableStart(table)}
                              className="flex-1 py-1 text-purple-600 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors text-xs font-medium"
                            >
                              <Edit3 className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table)}
                              className="flex-1 py-1 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors text-xs font-medium"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-700 leading-relaxed">
                💡 <strong>Tips:</strong> Tambahkan semua meja di cafe Anda. Nomor meja bisa bebas (C3, VIP-1, dll). Gunakan menu QR Ordering untuk generate QR per meja.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Change PIN Modal */}
      {showChangePin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center relative rounded-t-2xl">
              <button
                onClick={() => {
                  setShowChangePin(false);
                  setNewPin('');
                  setConfirmPin('');
                  setPinMessage('');
                }}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Ganti PIN Owner</h2>
              <p className="text-sm text-white/80 mt-1">
                PIN digunakan untuk akses fitur khusus
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">PIN Baru</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Minimal 4 digit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Konfirmasi PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Ketik ulang PIN baru"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && handleChangePin()}
                />
              </div>

              {pinMessage && (
                <div className={`p-3 rounded-lg text-center text-sm font-medium ${
                  pinMessage.includes('✅') 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {pinMessage}
                </div>
              )}

              <button
                onClick={handleChangePin}
                disabled={!newPin || !confirmPin}
                className="w-full py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Simpan PIN Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
