'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X, QrCode, Plus, Trash2 } from 'lucide-react';
import { useTableStore } from '@/store/useTableStore';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeGenerator({ isOpen, onClose }: QRCodeGeneratorProps) {
  const { tables, addTable, deleteTable } = useTableStore();
  const [selectedTable, setSelectedTable] = useState('');
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/order?table=${selectedTable}`
    : `http://localhost:3000/order?table=${selectedTable}`;

  const handleAddTable = () => {
    if (newTableNumber.trim()) {
      addTable(newTableNumber, parseInt(newTableCapacity) || 4);
      setNewTableNumber('');
      setNewTableCapacity('4');
      setShowAddTable(false);
      setSelectedTable(newTableNumber);
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-code-${selectedTable}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-Meja-${selectedTable}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Generate QR Code Meja</h2>
          <p className="text-sm text-white/80 mt-1">
            Scan untuk pesan sendiri
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Existing Tables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Pilih Meja yang Sudah Ada
              </label>
              <button
                onClick={() => setShowAddTable(!showAddTable)}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Tambah Meja Baru
              </button>
            </div>
            
            {showAddTable && (
              <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    placeholder="Nomor Meja (misal: C3)"
                    className="flex-1 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    autoFocus
                  />
                  <input
                    type="number"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    placeholder="Kapasitas"
                    className="w-24 px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTable}
                    disabled={!newTableNumber.trim()}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => { setShowAddTable(false); setNewTableNumber(''); }}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">-- Pilih Meja --</option>
              {tables.map((table) => (
                <option key={table.id} value={table.table_number}>
                  Meja {table.table_number} ({table.capacity} orang)
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Display */}
          {selectedTable && (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="bg-white inline-block p-4 rounded-xl shadow-lg mb-3">
                <QRCodeSVG
                  id={`qr-code-${selectedTable}`}
                  value={baseUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">Meja {selectedTable}</p>
              <p className="text-xs text-gray-400 break-all px-2">{baseUrl}</p>
            </div>
          )}

          {/* Download Button */}
          {selectedTable && (
            <button
              onClick={downloadQRCode}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          )}

          {/* Table List Management */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Daftar Meja ({tables.length})</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Meja {table.table_number}</span>
                    <span className="text-xs text-gray-500">({table.capacity} org)</span>
                  </div>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 Cetak dan tempel QR code di meja. Pelanggan bisa scan untuk pesan sendiri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}