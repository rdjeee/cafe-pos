'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  Banknote,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useReportStore } from '@/store/useReportStore';

type PeriodType = 'daily' | 'weekly' | 'monthly';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function ReportDashboard() {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Weekly range
  const [weeklyStartDate, setWeeklyStartDate] = useState(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    return weekAgo.toISOString().split('T')[0];
  });
  const [weeklyEndDate, setWeeklyEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reportStore = useReportStore();
  const { 
    getDailyReport, 
    getMenuPerformance,
    getPaymentMethodReport,
    getOrderTypeReport
  } = reportStore;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateStr));
  };

  const formatMonthYear = (month: number, year: number) => {
    return `${MONTH_NAMES[month]} ${year}`;
  };

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Calculate date range for selected month
  const getMonthDateRange = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    return { startDate, endDate };
  };

  // Get reports based on period
  const currentReport = activePeriod === 'daily' 
    ? getDailyReport(selectedDate)
    : activePeriod === 'weekly'
    ? reportStore.getReportByDateRange(weeklyStartDate, weeklyEndDate)
    : reportStore.getReportByDateRange(getMonthDateRange().startDate, getMonthDateRange().endDate);

  const menuPerformance = getMenuPerformance();
  const paymentReport = getPaymentMethodReport();
  const orderTypeReport = getOrderTypeReport();

  // Get trend data
  const getTrendData = () => {
    if (activePeriod === 'daily') {
      return [currentReport];
    } else if (activePeriod === 'weekly') {
      const data = [];
      const start = new Date(weeklyStartDate);
      const end = new Date(weeklyEndDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dailyReport = getDailyReport(dateStr);
        data.push({ ...dailyReport });
      }
      return data;
    } else {
      const data = [];
      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dailyReport = getDailyReport(dateStr);
        data.push({ ...dailyReport });
      }
      return data;
    }
  };

  const trendData = getTrendData();

  const totalPayment = paymentReport.cash + paymentReport.qris;
  const cashPercentage = totalPayment > 0 ? (paymentReport.cash / totalPayment) * 100 : 0;
  const qrisPercentage = totalPayment > 0 ? (paymentReport.qris / totalPayment) * 100 : 0;

  const totalOrderType = orderTypeReport.dine_in + orderTypeReport.take_away;
  const dineInPercentage = totalOrderType > 0 ? (orderTypeReport.dine_in / totalOrderType) * 100 : 0;
  const takeAwayPercentage = totalOrderType > 0 ? (orderTypeReport.take_away / totalOrderType) * 100 : 0;

  // Handle weekly date change
  const handleWeeklyStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setWeeklyStartDate(newStart);
    
    // Auto-set end date to 6 days after start
    const startDate = new Date(newStart);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    setWeeklyEndDate(endDate.toISOString().split('T')[0]);
  };

  // Navigate months
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

const currentYear = new Date().getFullYear();
const startYear = 2024; // Tahun awal sistem berjalan (sesuaikan dengan tahun cafe berdiri)
const endYear = currentYear + 5; // Selalu sediakan 5 tahun ke depan secara otomatis
const yearRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pembukuan & Laporan</h1>
            <p className="text-sm text-gray-600">Analisis performa bisnis cafe Anda</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActivePeriod('daily')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activePeriod === 'daily'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Harian
          </button>
          <button
            onClick={() => setActivePeriod('weekly')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activePeriod === 'weekly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Mingguan
          </button>
          <button
            onClick={() => setActivePeriod('monthly')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              activePeriod === 'monthly'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Bulanan
          </button>
        </div>

        {/* Date Controls */}
        {activePeriod === 'daily' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pilih Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500">{formatDate(selectedDate)}</p>
          </div>
        )}

        {activePeriod === 'weekly' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={weeklyStartDate}
                onChange={handleWeeklyStartChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Tanggal Akhir (Otomatis +6 hari)</label>
              <input
                type="date"
                value={weeklyEndDate}
                onChange={(e) => setWeeklyEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-700 font-medium">
                📅 Periode: {formatDate(weeklyStartDate)} - {formatDate(weeklyEndDate)}
              </p>
            </div>
          </div>
        )}

        {activePeriod === 'monthly' && (
          <div className="space-y-3">
            {/* Dropdown Bulan & Tahun */}
            <div className="flex gap-2">
              {/* Dropdown Bulan */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Bulan</label>
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: `right 0.5rem center`, 
                    backgroundRepeat: `no-repeat`, 
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: '2.5rem'
                  }}
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={index} value={index}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown Tahun */}
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tahun</label>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: `right 0.5rem center`, 
                    backgroundRepeat: `no-repeat`, 
                    backgroundSize: `1.5em 1.5em`,
                    paddingRight: '2.5rem'
                  }}
                >
                  {yearRange.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Info Bar & Quick Navigation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <span className="text-lg">📅</span>
                 <p className="text-sm text-blue-800 font-medium">
                   {formatMonthYear(selectedMonth, selectedYear)}
                 </p>
              </div>
              
              <div className="flex items-center gap-1 text-blue-600">
                 <p className="text-xs mr-2">{getDaysInMonth(selectedMonth, selectedYear)} Hari</p>
                 <button onClick={prevMonth} className="p-1 hover:bg-blue-100 rounded transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <button onClick={nextMonth} className="p-1 hover:bg-blue-100 rounded transition-colors">
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Pendapatan</p>
            <p className="text-xl font-bold">{formatRupiah(currentReport.total_revenue)}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Pesanan</p>
            <p className="text-xl font-bold">{currentReport.total_orders}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Banknote className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Pembayaran Tunai</p>
            <p className="text-xl font-bold">{formatRupiah(currentReport.cash_payments)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Pembayaran QRIS</p>
            <p className="text-xl font-bold">{formatRupiah(currentReport.qris_payments)}</p>
          </div>
        </div>

        {/* Payment Method Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">Metode Pembayaran</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tunai</span>
                <span className="font-medium">{cashPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${cashPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatRupiah(paymentReport.cash)}</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">QRIS</span>
                <span className="font-medium">{qrisPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${qrisPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatRupiah(paymentReport.qris)}</p>
            </div>
          </div>
        </div>

        {/* Order Type Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">Tipe Pesanan</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center gap-1">
                  <UtensilsCrossed className="w-4 h-4" />
                  Dine In
                </span>
                <span className="font-medium">{dineInPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${dineInPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{orderTypeReport.dine_in} pesanan</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  Take Away
                </span>
                <span className="font-medium">{takeAwayPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${takeAwayPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{orderTypeReport.take_away} pesanan</p>
            </div>
          </div>
        </div>

        {/* Top Menu Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">Menu Terlaris</h3>
          {menuPerformance.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {menuPerformance.slice(0, 5).map((menu, idx) => (
                <div key={menu.menu_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{menu.menu_name}</p>
                      <p className="text-xs text-gray-500">{menu.total_sold} terjual</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-blue-600">{formatRupiah(menu.total_revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend Data */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 mb-3">
              Tren Pendapatan {
                activePeriod === 'daily' ? formatDate(selectedDate) :
                activePeriod === 'weekly' ? `${formatDate(weeklyStartDate)} - ${formatDate(weeklyEndDate)}` :
                formatMonthYear(selectedMonth, selectedYear)
              }
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trendData.map((report, idx) => (
                report.total_orders > 0 && (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{formatDate(report.date)}</p>
                      <p className="text-xs text-gray-500">{report.total_orders} pesanan • {report.total_items_sold} item</p>
                    </div>
                    <p className="text-sm font-bold text-blue-600">{formatRupiah(report.total_revenue)}</p>
                  </div>
                )
              ))}
              {trendData.filter(t => t.total_orders > 0).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada data pesanan</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}