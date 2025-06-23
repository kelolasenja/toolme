import React, { useState, useEffect } from 'react';
import { ArrowLeft, Landmark, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoanPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

const LoanCalculator: React.FC = () => {
  // State for loan inputs
  const [loanAmount, setLoanAmount] = useState<number>(100000000);
  const [interestRate, setInterestRate] = useState<number>(10);
  const [loanTerm, setLoanTerm] = useState<number>(5);
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State for results
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [amortizationSchedule, setAmortizationSchedule] = useState<LoanPayment[]>([]);
  const [showFullSchedule, setShowFullSchedule] = useState<boolean>(false);

  // Calculate loan details
  useEffect(() => {
    if (loanAmount <= 0 || interestRate <= 0 || loanTerm <= 0) {
      return;
    }

    // Convert term to months if needed
    const termInMonths = termUnit === 'years' ? loanTerm * 12 : loanTerm;
    
    // Convert annual interest rate to monthly
    const monthlyInterestRate = interestRate / 100 / 12;
    
    // Calculate monthly payment using the formula: P = L[i(1+i)^n]/[(1+i)^n-1]
    // Where:
    // P = Monthly payment
    // L = Loan amount
    // i = Monthly interest rate
    // n = Number of payments (term in months)
    
    const monthlyPaymentAmount = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonths)) / 
      (Math.pow(1 + monthlyInterestRate, termInMonths) - 1);
    
    setMonthlyPayment(monthlyPaymentAmount);
    
    // Calculate total payment and interest
    const totalPaymentAmount = monthlyPaymentAmount * termInMonths;
    setTotalPayment(totalPaymentAmount);
    setTotalInterest(totalPaymentAmount - loanAmount);
    
    // Generate amortization schedule
    const schedule: LoanPayment[] = [];
    let remainingBalance = loanAmount;
    
    for (let month = 1; month <= termInMonths; month++) {
      // Calculate interest for this month
      const interestPayment = remainingBalance * monthlyInterestRate;
      
      // Calculate principal for this month
      const principalPayment = monthlyPaymentAmount - interestPayment;
      
      // Update remaining balance
      remainingBalance -= principalPayment;
      
      // Add to schedule
      schedule.push({
        month,
        payment: monthlyPaymentAmount,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance) // Ensure we don't go below zero due to rounding
      });
    }
    
    setAmortizationSchedule(schedule);
    
  }, [loanAmount, interestRate, loanTerm, termUnit]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate payment date
  const getPaymentDate = (month: number): string => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    });
  };

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-900/20 rounded-full mb-4">
            <Landmark className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Bunga Pinjaman
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung estimasi cicilan bulanan untuk pinjaman Anda.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-3">
            Fitur Kalkulator Pinjaman:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-cyan-800 dark:text-cyan-200">
            <li>Hitung cicilan bulanan untuk pinjaman dengan bunga tetap</li>
            <li>Lihat jadwal pembayaran lengkap (amortisasi)</li>
            <li>Analisis total bunga yang dibayarkan</li>
            <li>Bandingkan berbagai skenario pinjaman</li>
            <li>Simulasi pembayaran ekstra untuk mempercepat pelunasan</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Detail Pinjaman
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jumlah Pinjaman
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">Rp</span>
                  </div>
                  <input
                    type="number"
                    placeholder="100000000"
                    value={loanAmount || ''}
                    onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suku Bunga Tahunan (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="10"
                    value={interestRate || ''}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jangka Waktu
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="5"
                    value={loanTerm || ''}
                    onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <select 
                    value={termUnit}
                    onChange={(e) => setTermUnit(e.target.value as 'years' | 'months')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="years">Tahun</option>
                    <option value="months">Bulan</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Mulai Pinjaman
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ringkasan Pinjaman
              </h3>
              
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-6 border border-cyan-200 dark:border-cyan-800 mb-4">
                <div className="text-center">
                  <div className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">
                    Cicilan Bulanan
                  </div>
                  <div className="text-3xl font-bold text-cyan-800 dark:text-cyan-200">
                    {formatCurrency(monthlyPayment)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jumlah Pinjaman</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Bunga</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Pembayaran</span>
                  <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(totalPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jumlah Cicilan</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {termUnit === 'years' ? loanTerm * 12 : loanTerm} bulan
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Jadwal Pembayaran
              </h3>
              
              {amortizationSchedule.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left">Bulan</th>
                        <th className="px-4 py-2 text-left">Tanggal</th>
                        <th className="px-4 py-2 text-right">Cicilan</th>
                        <th className="px-4 py-2 text-right">Pokok</th>
                        <th className="px-4 py-2 text-right">Bunga</th>
                        <th className="px-4 py-2 text-right">Sisa Pinjaman</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showFullSchedule ? amortizationSchedule : amortizationSchedule.slice(0, 3)).map((payment) => (
                        <tr key={payment.month} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2">{payment.month}</td>
                          <td className="px-4 py-2">{getPaymentDate(payment.month - 1)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(payment.payment)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(payment.principal)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(payment.interest)}</td>
                          <td className="px-4 py-2 text-right">{formatCurrency(payment.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {!showFullSchedule && amortizationSchedule.length > 3 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setShowFullSchedule(true)}
                        className="text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline"
                      >
                        Lihat Jadwal Pembayaran Lengkap
                      </button>
                    </div>
                  )}
                  
                  {showFullSchedule && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setShowFullSchedule(false)}
                        className="text-cyan-600 dark:text-cyan-400 text-sm font-medium hover:underline"
                      >
                        Sembunyikan Jadwal Lengkap
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analisis Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lihat rincian pembayaran pokok dan bunga setiap bulan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Simulasi Pelunasan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lihat berapa yang bisa dihemat dengan pembayaran ekstra
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🏦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Jenis Pinjaman</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mendukung KPR, KTA, dan berbagai jenis pinjaman lainnya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;