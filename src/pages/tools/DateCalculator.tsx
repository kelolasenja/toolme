import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarClock, Calculator, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DateDifference {
  days: number;
  months: number;
  years: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  weekdays: number;
  weekends: number;
}

interface DateAddResult {
  resultDate: Date;
  dayOfWeek: string;
  weekOfYear: number;
}

const DateCalculator: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'difference' | 'add' | 'workdays' | 'age'>('difference');
  
  // State for date difference calculator
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [dateDifference, setDateDifference] = useState<DateDifference | null>(null);
  
  // State for date add/subtract calculator
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState<number>(30);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [dateAddResult, setDateAddResult] = useState<DateAddResult | null>(null);
  
  // Calculate date difference
  const calculateDateDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return;
    }
    
    // Adjust end date if including end date
    const adjustedEnd = includeEndDate 
      ? new Date(end.getTime() + 24 * 60 * 60 * 1000) 
      : end;
    
    // Calculate total days difference
    const diffTime = Math.abs(adjustedEnd.getTime() - start.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate years, months, days
    let years = adjustedEnd.getFullYear() - start.getFullYear();
    let months = adjustedEnd.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Calculate remaining days
    const yearMonthDate = new Date(start);
    yearMonthDate.setFullYear(yearMonthDate.getFullYear() + years);
    yearMonthDate.setMonth(yearMonthDate.getMonth() + months);
    
    const diffDays = Math.floor(
      (adjustedEnd.getTime() - yearMonthDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Calculate weekdays and weekends
    let weekdays = 0;
    let weekends = 0;
    
    const tempDate = new Date(start);
    while (tempDate < adjustedEnd) {
      const day = tempDate.getDay();
      if (day === 0 || day === 6) {
        weekends++;
      } else {
        weekdays++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    setDateDifference({
      days: diffDays,
      months,
      years,
      totalDays,
      totalWeeks: Math.floor(totalDays / 7),
      totalMonths: years * 12 + months + (diffDays > 0 ? diffDays / 30 : 0),
      weekdays,
      weekends
    });
  };
  
  // Calculate date after adding/subtracting
  const calculateDateAddSubtract = () => {
    const date = new Date(baseDate);
    
    if (isNaN(date.getTime())) {
      return;
    }
    
    const multiplier = operation === 'add' ? 1 : -1;
    
    switch (unit) {
      case 'days':
        date.setDate(date.getDate() + (amount * multiplier));
        break;
      case 'weeks':
        date.setDate(date.getDate() + (amount * 7 * multiplier));
        break;
      case 'months':
        date.setMonth(date.getMonth() + (amount * multiplier));
        break;
      case 'years':
        date.setFullYear(date.getFullYear() + (amount * multiplier));
        break;
    }
    
    // Get day of week
    const dayOfWeek = date.toLocaleDateString('id-ID', { weekday: 'long' });
    
    // Get week of year (approximate)
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekOfYear = Math.ceil(days / 7);
    
    setDateAddResult({
      resultDate: date,
      dayOfWeek,
      weekOfYear
    });
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate on input change
  useEffect(() => {
    if (activeTab === 'difference') {
      calculateDateDifference();
    } else if (activeTab === 'add') {
      calculateDateAddSubtract();
    }
  }, [
    activeTab, 
    startDate, endDate, includeEndDate,
    baseDate, operation, amount, unit
  ]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full mb-4">
            <CalendarClock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Durasi & Tanggal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung selisih antar tanggal atau tanggal di masa depan/masa lalu.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-3">
            Fitur Kalkulator Tanggal:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-teal-800 dark:text-teal-200">
            <li>Hitung selisih hari, bulan, dan tahun antara dua tanggal</li>
            <li>Tambah atau kurangi hari, bulan, atau tahun dari tanggal tertentu</li>
            <li>Hitung hari kerja antara dua tanggal (tidak termasuk akhir pekan)</li>
            <li>Konversi tanggal ke berbagai format</li>
            <li>Hitung usia berdasarkan tanggal lahir</li>
          </ul>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('difference')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'difference'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Selisih Tanggal
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'add'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tambah/Kurang Tanggal
            </button>
            <button 
              onClick={() => setActiveTab('workdays')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'workdays'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Hari Kerja
            </button>
            <button 
              onClick={() => setActiveTab('age')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'age'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Kalkulator Usia
            </button>
          </div>

          {/* Date Difference Calculator */}
          {activeTab === 'difference' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Awal
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Termasuk Tanggal Akhir
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include-end-date"
                      checked={includeEndDate}
                      onChange={(e) => setIncludeEndDate(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label htmlFor="include-end-date" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Ya, sertakan tanggal akhir dalam perhitungan
                    </label>
                  </div>
                </div>
                
                <button 
                  onClick={calculateDateDifference}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Selisih</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {dateDifference && (
                  <>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                      <div className="text-center">
                        <div className="text-sm text-teal-700 dark:text-teal-300 mb-1">
                          Selisih Tanggal
                        </div>
                        <div className="text-3xl font-bold text-teal-800 dark:text-teal-200">
                          {dateDifference.totalDays.toLocaleString()} hari
                        </div>
                        <div className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                          ({dateDifference.years} tahun, {dateDifference.months} bulan, {dateDifference.days} hari)
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Hari</span>
                          <span className="text-gray-900 dark:text-white font-medium">{dateDifference.totalDays.toLocaleString()} hari</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Minggu</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {Math.floor(dateDifference.totalDays / 7).toLocaleString()} minggu, {dateDifference.totalDays % 7} hari
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Bulan</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {dateDifference.totalMonths.toFixed(1)} bulan
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hari Kerja</span>
                          <span className="text-gray-900 dark:text-white font-medium">{dateDifference.weekdays.toLocaleString()} hari</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Akhir Pekan</span>
                          <span className="text-gray-900 dark:text-white font-medium">{dateDifference.weekends.toLocaleString()} hari</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Add/Subtract Date Calculator */}
          {activeTab === 'add' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Awal
                  </label>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Operasi
                    </label>
                    <div className="flex">
                      <button 
                        onClick={() => setOperation('add')}
                        className={`flex-1 p-2 ${
                          operation === 'add'
                            ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        } rounded-l`}
                      >
                        <Plus className="w-4 h-4 mx-auto" />
                      </button>
                      <button 
                        onClick={() => setOperation('subtract')}
                        className={`flex-1 p-2 ${
                          operation === 'subtract'
                            ? 'bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                        } rounded-r`}
                      >
                        <Minus className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      placeholder="30"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as 'days' | 'weeks' | 'months' | 'years')}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="days">Hari</option>
                      <option value="weeks">Minggu</option>
                      <option value="months">Bulan</option>
                      <option value="years">Tahun</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={calculateDateAddSubtract}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Tanggal</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {dateAddResult && (
                  <>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                      <div className="text-center">
                        <div className="text-sm text-teal-700 dark:text-teal-300 mb-1">
                          Hasil Tanggal
                        </div>
                        <div className="text-3xl font-bold text-teal-800 dark:text-teal-200">
                          {formatDate(dateAddResult.resultDate)}
                        </div>
                        <div className="text-sm text-teal-600 dark:text-teal-400 mt-1">
                          (Setelah {operation === 'add' ? 'menambahkan' : 'mengurangi'} {amount} {
                            unit === 'days' ? 'hari' : 
                            unit === 'weeks' ? 'minggu' : 
                            unit === 'months' ? 'bulan' : 'tahun'
                          })
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tanggal Awal</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {new Date(baseDate).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Operasi</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {operation === 'add' ? 'Tambah' : 'Kurang'} {amount} {
                              unit === 'days' ? 'hari' : 
                              unit === 'weeks' ? 'minggu' : 
                              unit === 'months' ? 'bulan' : 'tahun'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Hari dalam Minggu</span>
                          <span className="text-gray-900 dark:text-white font-medium">{dateAddResult.dayOfWeek}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Minggu dalam Tahun</span>
                          <span className="text-gray-900 dark:text-white font-medium">Minggu ke-{dateAddResult.weekOfYear}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Workdays Calculator (Placeholder) */}
          {activeTab === 'workdays' && (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarClock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kalkulator Hari Kerja
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Fitur ini akan segera tersedia. Kalkulator ini akan menghitung jumlah hari kerja antara dua tanggal, dengan mempertimbangkan akhir pekan dan hari libur nasional.
                </p>
              </div>
            </div>
          )}

          {/* Age Calculator (Placeholder) */}
          {activeTab === 'age' && (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarClock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kalkulator Usia
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Fitur ini akan segera tersedia. Kalkulator ini akan menghitung usia seseorang berdasarkan tanggal lahir, dengan detail tahun, bulan, dan hari.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📅</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Kalkulator</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              4 kalkulator tanggal dalam 1 tool
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hasil kalkulasi instan saat Anda memilih tanggal
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Detail Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hasil dalam hari, minggu, bulan, dan tahun
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💼</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hari Kerja</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hitung hari kerja dengan mengecualikan akhir pekan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateCalculator;