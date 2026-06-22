'use client';

import { useEffect, useState, useCallback } from 'react';
import { useOrderStore } from '@/store/useOrderStore';

export function useQROrdersSync() {
  const { addOrder } = useOrderStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [newOrdersNotification, setNewOrdersNotification] = useState<number>(0);

  // Manual sync function
  const syncNow = useCallback(() => {
    const qrOrders = JSON.parse(localStorage.getItem('qr_orders') || '[]');
    
    if (qrOrders.length > 0) {
      // Add each order to the order store - KEEP ORIGINAL STATUS
      qrOrders.forEach((order: any) => {
        addOrder({
          ...order,
          // Don't override status - keep as pending_confirmation or pending_payment
        });
      });

      // Set notification for new orders
      setNewOrdersNotification(qrOrders.length);

      // Clear localStorage after syncing
      localStorage.removeItem('qr_orders');
      setLastSyncTime(new Date());
      setPendingCount(0);
      
      console.log(`✅ ${qrOrders.length} pesanan dari QR berhasil disinkronkan`);

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNewOrdersNotification(0);
      }, 5000);
    } else {
      setLastSyncTime(new Date());
    }
  }, [addOrder]);

  // Check pending orders without syncing
  const checkPending = useCallback(() => {
    const qrOrders = JSON.parse(localStorage.getItem('qr_orders') || '[]');
    setPendingCount(qrOrders.length);
  }, []);

  useEffect(() => {
    // Sync immediately on mount
    syncNow();

    // Polling every 3 seconds
    const interval = setInterval(() => {
      checkPending();
      syncNow();
    }, 3000);

    // Also listen for storage events (for multi-tab sync)
    const handleStorageChange = () => {
      checkPending();
      syncNow();
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncNow, checkPending]);

  return {
    pendingCount,
    lastSyncTime,
    newOrdersNotification,
    syncNow,
  };
}