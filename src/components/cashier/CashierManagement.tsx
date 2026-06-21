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
  Key
} from 'lucide-react';
import { useCashierStore, Cashier } from '@/store/useCashierStore';

interface CashierManagementProps {
  onBack: () => void;
}

export default function CashierManagement({ onBack }: CashierManagementProps) {
  const { 
    cashiers, 
    addCashier, 
    updateCashierName, 
    toggleCashierStatus, 
    deleteCashier,
    ownerPin,
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

  const activeCount = cashiers.filter(c => c.is_active).length;
  const inactiveCount = cashiers.filter(c => !c.is_active).length;

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

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Kelola Kasir</h1>
              <p className="text-xs text-gray-500">Manajemen data pengguna kasir</p>
            </div>
          </div>
          <button
            onClick={() => setShowChangePin(true)}
            className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium hover:bg-amber-200 transition-colors flex items-center gap-2 text-sm"
          >
            <Key className="w-4 h-4" />
            Ganti PIN
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
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
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add Cashier Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Tambah Kasir Baru
        </button>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="bg-white border-2 border-green-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Kasir Baru</h3>
            <input
              type="text"
              value={newCashierName}
              onChange={(e) => setNewCashierName(e.target.value)}
              placeholder="Nama lengkap kasir"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCashier()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewCashierName(''); }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleAddCashier}
                disabled={!newCashierName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        )}

        {/* Cashier List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Daftar Kasir ({cashiers.length})
          </h3>
          
          {cashiers.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada kasir terdaftar</p>
            </div>
          ) : (
            cashiers.map((cashier) => (
              <div
                key={cashier.id}
                className={`bg-white rounded-lg border p-3 transition-all ${
                  cashier.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'
                }`}
              >
                {editingId === cashier.id ? (
                  // Edit Mode
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleEditSave(cashier.id)}
                    />
                    <button
                      onClick={() => handleEditSave(cashier.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        cashier.is_active ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        {cashier.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{cashier.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            cashier.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {cashier.is_active ? '● Aktif' : '○ Non-Aktif'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditStart(cashier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit nama"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleCashierStatus(cashier.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          cashier.is_active 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={cashier.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {cashier.is_active ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(cashier)}
                        disabled={cashier.is_active}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Hapus (hanya non-aktif)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 text-sm mb-2">ℹ️ Informasi Penting</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Kasir <strong>Non-Aktif</strong> tidak akan muncul di dropdown POS</li>
            <li>• Riwayat transaksi kasir yang dihapus tetap tersimpan</li>
            <li>• Hapus hanya bisa dilakukan pada kasir Non-Aktif</li>
            <li>• Ganti PIN Owner secara berkala untuk keamanan</li>
          </ul>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showChangePin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Ganti PIN Owner
              </h3>
              <button
                onClick={() => { setShowChangePin(false); setPinMessage(''); }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">PIN Baru (min 4 digit)</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Konfirmasi PIN</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              {pinMessage && (
                <p className={`text-sm text-center ${pinMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {pinMessage}
                </p>
              )}
              <button
                onClick={handleChangePin}
                disabled={!newPin || !confirmPin}
                className="w-full py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
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