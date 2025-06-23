import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Percent, Target, BarChart3, PieChart, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfitData {
  hargaModal: number;
  biayaLainnya: number;
  feeMarketplace: number;
  targetProfitPersen: number;
  targetProfitRupiah: number;
}

interface HasilKalkulasi {
  totalBiayaModal: number;
  profitRupiah: number;
  hargaJualMinimum: number;
  hargaJualSetelahFee: number;
  marginKeuntungan: number;
  breakEvenPoint: number;
  roiPersen: number;
}

const ProfitCalculator: React.FC = () => {
  const [inputData, setInputData] = useState<ProfitData>({
    hargaModal: 0,
    biayaLainnya: 0,
    feeMarketplace: 5,
    targetProfitPersen: 30,
    targetProfitRupiah: 0
  });

  const [hasil, setHasil] = useState<HasilKalkulasi>({
    totalBiayaModal: 0,
    profitRupiah: 0,
    hargaJualMinimum: 0,
    hargaJualSetelahFee: 0,
    marginKeuntungan: 0,
    breakEvenPoint: 0,
    roiPersen: 0
  });

  const [modeProfitAktif, setModeProfitAktif] = useState<'persen' | 'rupiah'>('persen');
  const [simulasiHarga, setSimulasiHarga] = useState<number>(0);
  const [hasilSimulasi, setHasilSimulasi] = useState<any>(null);

  // Fungsi kalkulasi utama
  const hitungProfit = () => {
    const { hargaModal, biayaLainnya, feeMarketplace, targetProfitPersen, targetProfitRupiah } = inputData;

    // 1. Hitung Total Biaya Modal
    const totalBiayaModal = hargaModal + biayaLainnya;

    // 2. Tentukan Profit yang Diinginkan
    let profitRupiah: number;
    if (modeProfitAktif === 'persen') {
      profitRupiah = totalBiayaModal * (targetProfitPersen / 100);
    } else {
      profitRupiah = targetProfitRupiah;
    }

    // 3. Hitung Rekomendasi Harga Jual Minimum
    const feeDecimal = feeMarketplace / 100;
    const hargaJualMinimum = (totalBiayaModal + profitRupiah) / (1 - feeDecimal);

    // 4. Hitung harga setelah dipotong fee
    const hargaJualSetelahFee = hargaJualMinimum * (1 - feeDecimal);

    // 5. Hitung margin keuntungan
    const marginKeuntungan = (profitRupiah / totalBiayaModal) * 100;

    // 6. Hitung Break Even Point (tanpa profit)
    const breakEvenPoint = totalBiayaModal / (1 - feeDecimal);

    // 7. Hitung ROI (Return on Investment)
    const roiPersen = (profitRupiah / totalBiayaModal) * 100;

    setHasil({
      totalBiayaModal,
      profitRupiah,
      hargaJualMinimum,
      hargaJualSetelahFee,
      marginKeuntungan,
      breakEvenPoint,
      roiPersen
    });
  };

  // Fungsi simulasi harga jual
  const simulasiHargaJual = (hargaJual: number) => {
    const { hargaModal, biayaLainnya, feeMarketplace } = inputData;
    const totalBiayaModal = hargaModal + biayaLainnya;
    const feeDecimal = feeMarketplace / 100;
    
    const pendapatanBersih = hargaJual * (1 - feeDecimal);
    const profitAktual = pendapatanBersih - totalBiayaModal;
    const marginAktual = totalBiayaModal > 0 ? (profitAktual / totalBiayaModal) * 100 : 0;
    const roiAktual = totalBiayaModal > 0 ? (profitAktual / totalBiayaModal) * 100 : 0;
    const feeYangDibayar = hargaJual * feeDecimal;

    return {
      hargaJual,
      pendapatanBersih,
      profitAktual,
      marginAktual,
      roiAktual,
      feeYangDibayar,
      statusProfit: profitAktual > 0 ? 'Untung' : profitAktual < 0 ? 'Rugi' : 'Break Even'
    };
  };

  // Update hasil saat input berubah
  useEffect(() => {
    hitungProfit();
  }, [inputData, modeProfitAktif]);

  // Update simulasi saat harga simulasi berubah
  useEffect(() => {
    if (simulasiHarga > 0) {
      setHasilSimulasi(simulasiHargaJual(simulasiHarga));
    } else {
      setHasilSimulasi(null);
    }
  }, [simulasiHarga, inputData]);

  const updateInput = (field: keyof ProfitData, value: number) => {
    setInputData(prev => ({ ...prev, [field]: value }));
  };

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPersen = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Preset contoh produk
  const presetProduk = [
    { nama: 'Kaos Polos', modal: 25000, biaya: 5000, target: 40 },
    { nama: 'Aksesoris HP', modal: 15000, biaya: 3000, target: 50 },
    { nama: 'Makanan Ringan', modal: 8000, biaya: 2000, target: 60 },
    { nama: 'Produk Digital', modal: 50000, biaya: 0, target: 80 }
  ];

  const gunakanPreset = (preset: typeof presetProduk[0]) => {
    setInputData(prev => ({
      ...prev,
      hargaModal: preset.modal,
      biayaLainnya: preset.biaya,
      targetProfitPersen: preset.target
    }));
    setModeProfitAktif('persen');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Profit Bisnis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung harga jual ideal, analisis keuntungan, dan simulasi profit untuk bisnis Anda.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
            Fitur Kalkulator Profit:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-emerald-800 dark:text-emerald-200">
            <li>Perhitungan harga jual otomatis berdasarkan modal dan target profit</li>
            <li>Analisis margin keuntungan dan ROI (Return on Investment)</li>
            <li>Simulasi profit dengan berbagai harga jual</li>
            <li>Preset contoh produk untuk referensi</li>
            <li>Perhitungan fee marketplace dan break even point</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Preset Produk */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contoh Produk
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {presetProduk.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => gunakanPreset(preset)}
                    className="p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {preset.nama}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Modal: {formatRupiah(preset.modal)} • Target: {preset.target}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Data */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Produk
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Harga Modal / Beli Produk (per item)
                  </label>
                  <input
                    type="number"
                    value={inputData.hargaModal || ''}
                    onChange={(e) => updateInput('hargaModal', Number(e.target.value) || 0)}
                    placeholder="Contoh: 50000"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Biaya Lain-lain (per item)
                  </label>
                  <input
                    type="number"
                    value={inputData.biayaLainnya || ''}
                    onChange={(e) => updateInput('biayaLainnya', Number(e.target.value) || 0)}
                    placeholder="Packing, stiker, dll"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fee Marketplace (%)
                  </label>
                  <input
                    type="number"
                    value={inputData.feeMarketplace || ''}
                    onChange={(e) => updateInput('feeMarketplace', Number(e.target.value) || 0)}
                    placeholder="Contoh: 5"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Target Profit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Target Keuntungan
              </h3>
              
              <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setModeProfitAktif('persen')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    modeProfitAktif === 'persen'
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Persen (%)
                </button>
                <button
                  onClick={() => setModeProfitAktif('rupiah')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    modeProfitAktif === 'rupiah'
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Rupiah (Rp)
                </button>
              </div>

              {modeProfitAktif === 'persen' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Profit (%)
                  </label>
                  <input
                    type="number"
                    value={inputData.targetProfitPersen || ''}
                    onChange={(e) => updateInput('targetProfitPersen', Number(e.target.value) || 0)}
                    placeholder="Contoh: 30"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Profit (Rp)
                  </label>
                  <input
                    type="number"
                    value={inputData.targetProfitRupiah || ''}
                    onChange={(e) => updateInput('targetProfitRupiah', Number(e.target.value) || 0)}
                    placeholder="Contoh: 15000"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Results */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Hasil Kalkulasi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Biaya Modal
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatRupiah(hasil.totalBiayaModal)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Profit yang Akan Didapat
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(hasil.profitRupiah)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Break Even Point
                      </span>
                    </div>
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatRupiah(hasil.breakEvenPoint)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Rekomendasi Harga Jual
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                      {formatRupiah(hasil.hargaJualMinimum)}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Setelah fee: {formatRupiah(hasil.hargaJualSetelahFee)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Percent className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Margin Keuntungan
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPersen(hasil.marginKeuntungan)}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        ROI (Return on Investment)
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatPersen(hasil.roiPersen)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulasi Harga */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Simulasi Harga Jual
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coba Harga Jual Lain
                </label>
                <input
                  type="number"
                  value={simulasiHarga || ''}
                  onChange={(e) => setSimulasiHarga(Number(e.target.value) || 0)}
                  placeholder="Masukkan harga untuk simulasi..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {hasilSimulasi && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pendapatan Bersih</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatRupiah(hasilSimulasi.pendapatanBersih)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit Aktual</div>
                      <div className={`font-semibold ${
                        hasilSimulasi.profitAktual > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : hasilSimulasi.profitAktual < 0 
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {formatRupiah(hasilSimulasi.profitAktual)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Margin</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPersen(hasilSimulasi.marginAktual)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
                      <div className={`font-semibold text-xs px-2 py-1 rounded-full ${
                        hasilSimulasi.statusProfit === 'Untung' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : hasilSimulasi.statusProfit === 'Rugi'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {hasilSimulasi.statusProfit}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tips & Info */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
                    Tips Menentukan Harga Jual
                  </h3>
                  <ul className="space-y-2 text-emerald-800 dark:text-emerald-200 text-sm">
                    <li>• <strong>Riset Kompetitor:</strong> Bandingkan harga dengan produk serupa di pasar</li>
                    <li>• <strong>Nilai Produk:</strong> Pertimbangkan kualitas dan keunikan produk Anda</li>
                    <li>• <strong>Target Market:</strong> Sesuaikan harga dengan daya beli target konsumen</li>
                    <li>• <strong>Volume Penjualan:</strong> Harga lebih rendah bisa meningkatkan volume</li>
                    <li>• <strong>Margin Aman:</strong> Sisakan ruang untuk diskon dan promosi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Akurat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perhitungan presisi dengan rumus bisnis yang tepat
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hasil kalkulasi otomatis saat Anda mengetik
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analisis Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ROI, margin, break even, dan simulasi harga
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preset Produk</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Contoh perhitungan untuk berbagai jenis produk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;