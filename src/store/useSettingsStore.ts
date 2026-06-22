import { create } from 'zustand';

interface SettingsState {
  wifiSSID: string;
  wifiPassword: string;
  cafeName: string;
  cafeAddress: string;
  cafePhone: string;
  setWifiSSID: (ssid: string) => void;
  setWifiPassword: (password: string) => void;
  setCafeName: (name: string) => void;
  setCafeAddress: (address: string) => void;
  setCafePhone: (phone: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  wifiSSID: '',
  wifiPassword: '',
  cafeName: 'CAFE POS',
  cafeAddress: 'Jl. Contoh No. 123',
  cafePhone: '0812-3456-7890',

  setWifiSSID: (ssid) => set({ wifiSSID: ssid }),
  setWifiPassword: (password) => set({ wifiPassword: password }),
  setCafeName: (name) => set({ cafeName: name }),
  setCafeAddress: (address) => set({ cafeAddress: address }),
  setCafePhone: (phone) => set({ cafePhone: phone }),
}));