'use client';

import { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, BarChart3, Lock, Play, LogOut, Clock, QrCode, RefreshCw, Bell } from 'lucide-react';
import MenuPanel from '@/components/cashier/MenuPanel';
import CartPanel from '@/components/cashier/cartPanel';
import OrderList from '@/components/cashier/OrderList';
import ReportDashboard from '@/components/cashier/ReportDashboard';
import CashierManagement from '@/components/cashier/CashierManagement';
import OwnerPinModal from '@/components/cashier/OwnerPinModal';
import OpenShiftModal from '@/components/cashier/OpenShiftModal';
import CloseShiftModal from '@/components/cashier/CloseShiftModal';
import QRCodeGenerator from '@/components/cashier/QRCodeGenerator';
import { useShiftStore } from '@/store/useShiftStore';
import { useQROrdersSync } from '@/hooks/useQRordersSync';

type ActiveView = 'pos' | 'orders' | 'reports' | 'cashier_mgmt';

export default function CashierPage() {
  const [activeView, setActiveView] = useState<ActiveView>('pos');
  const [previousView, setPreviousView] = useState<ActiveView>('pos');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);

  const { currentShift, isShiftOpen } = useShiftStore();

  const [showQRGenerator, setShowQRGenerator] = useState(false);
  
  // Sync QR orders to cashier with real-time notification
  const { newOrdersNotification, lastSyncTime, syncNow } = useQROrdersSync();

  // Paksa buka shift jika belum ada saat pertama load
  useEffect(() => {
    if (!isShiftOpen()) {
      setShowOpenShift(true);
    }
  }, [isShiftOpen]);

  const handleCashierMgmtClick = () => {
    setPreviousView(activeView);
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setActiveView('cashier_mgmt');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Belum sync';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 5) return 'Baru saja';
    if (diffSeconds < 60) return `${diffSeconds} detik lalu`;
    return formatTime(date);
  };

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* QR Orders Notification */}
      {newOrdersNotification > 0 && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg">Pesanan Baru dari QR!</p>
              <p className="text-sm">{newOrdersNotification} pesanan menunggu konfirmasi</p>
            </div>
          </div>
        </div>
      )}

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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors relative ${
              activeView === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ShoppingCart className="w-5 h-5" /> Pesanan
            {newOrdersNotification > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {newOrdersNotification}
              </span>
            )}
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

          <button
            onClick={() => setShowQRGenerator(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Ordering
          </button>

          <button
            onClick={syncNow}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors group"
            title={`Terakhir sync: ${formatSyncTime(lastSyncTime)}`}
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xs hidden md:inline">{formatSyncTime(lastSyncTime)}</span>
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
      <QRCodeGenerator
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
      />
    </main>
  );
}