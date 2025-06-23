import React, { useState, useEffect } from 'react';
import { ArrowLeft, Receipt, Calculator, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

interface TaxCalculation {
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  brackets: {
    rate: number;
    amount: number;
    tax: number;
  }[];
}

const TaxCalculator: React.FC = () => {
  // Form state
  const [status, setStatus] = useState<string>('TK/0');
  const [grossIncome, setGrossIncome] = useState<number>(120000000);
  const [positionAllowanceRate, setPositionAllowanceRate] = useState<number>(5);
  const [pensionContribution, setPensionContribution] = useState<number>(0);
  
  // Result state
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  
  // Constants
  const PTKP: Record<string, number> = {
    'TK/0': 54000000, // Tidak Kawin, 0 tanggungan
    'K/0': 58500000,  // Kawin, 0 tanggungan
    'K/1': 63000000,  // Kawin, 1 tanggungan
    'K/2': 67500000,  // Kawin, 2 tanggungan
    'K/3': 72000000,  // Kawin, 3 tanggungan
  };
  
  const TAX_BRACKETS: TaxBracket[] = [
    { min: 0, max: 50000000, rate: 5 },
    { min: 50000000, max: 250000000, rate: 15 },
    { min: 250000000, max: 500000000, rate: 25 },
    { min: 500000000, max: 5000000000, rate: 30 },
    { min: 5000000000, max: null, rate: 35 },
  ];
  
  const MAX_POSITION_ALLOWANCE = 6000000; // Maximum position allowance per year
  
  // Calculate tax
  const calculateTax = () => {
    // Calculate position allowance (5% of gross income, max 6 million per year)
    const positionAllowance = Math.min(
      (grossIncome * positionAllowanceRate) / 100,
      MAX_POSITION_ALLOWANCE
    );
    
    // Calculate net income
    const netIncome = grossIncome - positionAllowance - pensionContribution;
    
    // Get PTKP based on status
    const ptkpAmount = PTKP[status] || PTKP['TK/0'];
    
    // Calculate taxable income (PKP)
    const taxableIncome = Math.max(0, netIncome - ptkpAmount);
    
    // Calculate tax per bracket
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const brackets = [];
    
    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break;
      
      const bracketSize = bracket.max === null 
        ? remainingIncome 
        : Math.min(remainingIncome, bracket.max - bracket.min);
      
      const taxForBracket = bracketSize * (bracket.rate / 100);
      
      brackets.push({
        rate: bracket.rate,
        amount: bracketSize,
        tax: taxForBracket
      });
      
      totalTax += taxForBracket;
      remainingIncome -= bracketSize;
    }
    
    // Calculate effective tax rate
    const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;
    
    setTaxCalculation({
      taxableIncome,
      totalTax,
      effectiveRate,
      brackets
    });
  };
  
  // Calculate tax when inputs change
  useEffect(() => {
    calculateTax();
  }, [grossIncome, positionAllowanceRate, pensionContribution, status]);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
            <Receipt className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Pajak (Sederhana)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Estimasi perhitungan pajak penghasilan pribadi.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Disclaimer
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                Kalkulator ini hanya untuk estimasi dan referensi. Untuk perhitungan pajak yang akurat dan sesuai dengan peraturan terbaru, silakan konsultasikan dengan konsultan pajak atau Direktorat Jenderal Pajak.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Penghasilan
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status Wajib Pajak
                </label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="TK/0">TK/0 - Tidak Kawin, Tanpa Tanggungan</option>
                  <option value="K/0">K/0 - Kawin, Tanpa Tanggungan</option>
                  <option value="K/1">K/1 - Kawin, 1 Tanggungan</option>
                  <option value="K/2">K/2 - Kawin, 2 Tanggungan</option>
                  <option value="K/3">K/3 - Kawin, 3 Tanggungan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Penghasilan Bruto Tahunan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">Rp</span>
                  </div>
                  <input
                    type="number"
                    placeholder="120000000"
                    value={grossIncome || ''}
                    onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Biaya Jabatan (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="5"
                    value={positionAllowanceRate || ''}
                    onChange={(e) => setPositionAllowanceRate(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Maksimal Rp 6.000.000 per tahun
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Iuran Pensiun/BPJS Ketenagakerjaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">Rp</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={pensionContribution || ''}
                    onChange={(e) => setPensionContribution(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
              
              <button 
                onClick={calculateTax}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Calculator className="w-5 h-5" />
                <span>Hitung Pajak</span>
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hasil Perhitungan
              </h3>
              
              {taxCalculation && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                        Pajak Penghasilan (PPh 21) Tahunan
                      </div>
                      <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">
                        {formatCurrency(taxCalculation.totalTax)}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Pajak Bulanan: {formatCurrency(taxCalculation.totalTax / 12)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Penghasilan Bruto</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(grossIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Biaya Jabatan</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(Math.min((grossIncome * positionAllowanceRate) / 100, MAX_POSITION_ALLOWANCE))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Iuran Pensiun/BPJS</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(pensionContribution)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Penghasilan Neto</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(grossIncome - Math.min((grossIncome * positionAllowanceRate) / 100, MAX_POSITION_ALLOWANCE) - pensionContribution)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">PTKP ({status})</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(PTKP[status])}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">PKP</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatCurrency(taxCalculation.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tarif Pajak Efektif</span>
                      <span className="text-gray-900 dark:text-white font-medium">{formatPercentage(taxCalculation.effectiveRate)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Rincian Tarif Pajak
              </h3>
              
              {taxCalculation && (
                <div className="space-y-3 text-sm">
                  {taxCalculation.brackets.map((bracket, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {bracket.rate}% x {formatCurrency(bracket.amount)}
                      </span>
                      <span className="text-gray-900 dark:text-white">{formatCurrency(bracket.tax)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700 dark:text-gray-300">Total PPh 21 Tahunan</span>
                      <span className="text-blue-600 dark:text-blue-400">{formatCurrency(taxCalculation.totalTax)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mudah Digunakan</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Interface sederhana untuk perhitungan cepat
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rincian Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Lihat breakdown perhitungan pajak per lapisan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Update Regulasi</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Mengikuti peraturan perpajakan terbaru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;