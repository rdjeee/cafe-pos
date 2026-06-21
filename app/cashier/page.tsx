'use client';

import { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, BarChart3, Users, Lock, Play, LogOut, Clock, Banknote } from 'lucide-react';
import MenuPanel from '@/components/cashier/MenuPanel';
import CartPanel from '@/components/cashier/cartPanel';
import OrderList from '@/components/cashier/OrderList';
import ReportDashboard from '@/components/cashier/ReportDashboard';
import CashierManagement from '@/components/cashier/CashierManagement';
import OwnerPinModal from '@/components/cashier/OwnerPinModal';
import OpenShiftModal from '@/components/cashier/OpenShiftModal';
import CloseShiftModal from '@/components/cashier/CloseShiftModal';
import { useShiftStore } from '@/store/useShiftStore';

type ActiveView = 'pos' | 'orders' | 'reports' | 'cashier_mgmt';

export default function CashierPage() {
  const [activeView, setActiveView] = useState<ActiveView>('pos');
  const [previousView, setPreviousView] = useState<ActiveView>('pos');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);

  const { currentShift, isShiftOpen } = useShiftStore();

  // Paksa buka shift jika belum ada saat pertama load
  useEffect(() => {
    if (!isShiftOpen()) {
      setShowOpenShift(true);
    }
  }, []);

  const handleCashierMgmtClick = () => {
    setPreviousView(activeView);
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setActiveView('cashier_mgmt');
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('pos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'pos' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChefHat className="w-5 h-5" /> Kasir
          </button>
          <button
            onClick={() => setActiveView('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart className="w-5 h-5" /> Pesanan
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> Pembukuan
          </button>
          <button
            onClick={handleCashierMgmtClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'cashier_mgmt' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
          >
            <Lock className="w-4 h-4" /> Kelola Kasir
          </button>
          {!isShiftOpen() && (
          <button
            onClick={() => setShowOpenShift(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <Play className="w-4 h-4" />
            Buka Shift
          </button>
        )}
        </div>
        

        {/* Shift Status Bar */}
        {currentShift && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-1.5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-800">
                Shift Aktif: <span className="font-bold">{currentShift.cashier_name}</span>
              </span>
            </div>
            <div className="h-4 w-px bg-green-300"></div>
            <div className="flex items-center gap-1 text-xs text-green-700">
              <Clock className="w-3 h-3" />
              <span>{formatTime(currentShift.start_time)}</span>
            </div>
            <button
              onClick={() => setShowCloseShift(true)}
              className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Tutup
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'pos' && (
          <>
            <MenuPanel />
            <CartPanel />
          </>
        )}
        {activeView === 'orders' && <OrderList />}
        {activeView === 'reports' && <ReportDashboard />}
        {activeView === 'cashier_mgmt' && (
          <CashierManagement onBack={() => setActiveView(previousView)} />
        )}
      </div>

      {/* Modals */}
      <OwnerPinModal
        isOpen={showPinModal}
        onSuccess={handlePinSuccess}
        onCancel={() => setShowPinModal(false)}
      />
      <OpenShiftModal
        isOpen={showOpenShift}
        onClose={() => setShowOpenShift(false)}
      />
      <CloseShiftModal
        isOpen={showCloseShift}
        onClose={() => setShowCloseShift(false)}
      />
    </main>
  );
}