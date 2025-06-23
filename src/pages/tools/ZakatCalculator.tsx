import React, { useState, useEffect } from 'react';
import { ArrowLeft, PiggyBank, Calculator, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ZakatPenghasilanResult {
  totalPenghasilan: number;
  totalPengeluaran: number;
  penghasilanBersih: number;
  nisab: number;
  zakatBulanan: number;
  zakatTahunan: number;
  mencapaiNisab: boolean;
}

interface ZakatMaalResult {
  totalHarta: number;
  totalHutang: number;
  hartaBersih: number;
  nisab: number;
  zakatMaal: number;
  mencapaiNisab: boolean;
}

interface ZakatEmasPerakResult {
  beratEmas: number;
  beratPerak: number;
  nilaiEmas: number;
  nilaiPerak: number;
  totalNilai: number;
  nisabEmas: number;
  nisabPerak: number;
  zakatEmasPerak: number;
  mencapaiNisabEmas: boolean;
  mencapaiNisabPerak: boolean;
}

const ZakatCalculator: React.FC = () => {
  // Common state
  const [activeTab, setActiveTab] = useState<'penghasilan' | 'maal' | 'emas' | 'perdagangan'>('penghasilan');
  const [hargaEmas, setHargaEmas] = useState<number>(1000000); // Rp per gram
  const [hargaPerak, setHargaPerak] = useState<number>(15000); // Rp per gram
  
  // Zakat Penghasilan state
  const [penghasilanBulanan, setPenghasilanBulanan] = useState<number>(10000000);
  const [pendapatanLain, setPendapatanLain] = useState<number>(0);
  const [pengeluaranPokok, setPengeluaranPokok] = useState<number>(5000000);
  const [hutangCicilan, setHutangCicilan] = useState<number>(0);
  const [hasilZakatPenghasilan, setHasilZakatPenghasilan] = useState<ZakatPenghasilanResult | null>(null);
  
  // Zakat Maal state
  const [uangTunai, setUangTunai] = useState<number>(0);
  const [tabungan, setTabungan] = useState<number>(0);
  const [investasi, setInvestasi] = useState<number>(0);
  const [emasPerak, setEmasPerak] = useState<number>(0);
  const [properti, setProperti] = useState<number>(0);
  const [kendaraan, setKendaraan] = useState<number>(0);
  const [hutang, setHutang] = useState<number>(0);
  const [kebutuhanPokok, setKebutuhanPokok] = useState<number>(0);
  const [hasilZakatMaal, setHasilZakatMaal] = useState<ZakatMaalResult | null>(null);
  
  // Zakat Emas & Perak state
  const [beratEmas, setBeratEmas] = useState<number>(0);
  const [beratPerak, setBeratPerak] = useState<number>(0);
  const [hasilZakatEmasPerak, setHasilZakatEmasPerak] = useState<ZakatEmasPerakResult | null>(null);
  
  // Constants
  const NISAB_EMAS_GRAM = 85; // 85 gram emas
  const NISAB_PERAK_GRAM = 595; // 595 gram perak
  const ZAKAT_RATE = 0.025; // 2.5%
  
  // Calculate Zakat Penghasilan
  const hitungZakatPenghasilan = () => {
    const totalPenghasilan = penghasilanBulanan + pendapatanLain;
    const totalPengeluaran = pengeluaranPokok + hutangCicilan;
    const penghasilanBersih = totalPenghasilan - totalPengeluaran;
    
    // Nisab is equivalent to 85 grams of gold
    const nisab = NISAB_EMAS_GRAM * hargaEmas;
    
    // Calculate monthly zakat (2.5% of net income)
    const zakatBulanan = penghasilanBersih * ZAKAT_RATE;
    
    // Calculate annual zakat
    const zakatTahunan = zakatBulanan * 12;
    
    // Check if annual income reaches nisab
    const mencapaiNisab = penghasilanBersih * 12 >= nisab;
    
    setHasilZakatPenghasilan({
      totalPenghasilan,
      totalPengeluaran,
      penghasilanBersih,
      nisab,
      zakatBulanan,
      zakatTahunan,
      mencapaiNisab
    });
  };
  
  // Calculate Zakat Maal
  const hitungZakatMaal = () => {
    const totalHarta = uangTunai + tabungan + investasi + emasPerak + properti + kendaraan;
    const totalHutang = hutang + kebutuhanPokok;
    const hartaBersih = totalHarta - totalHutang;
    
    // Nisab is equivalent to 85 grams of gold
    const nisab = NISAB_EMAS_GRAM * hargaEmas;
    
    // Calculate zakat (2.5% of net assets)
    const zakatMaal = hartaBersih * ZAKAT_RATE;
    
    // Check if net assets reach nisab
    const mencapaiNisab = hartaBersih >= nisab;
    
    setHasilZakatMaal({
      totalHarta,
      totalHutang,
      hartaBersih,
      nisab,
      zakatMaal,
      mencapaiNisab
    });
  };
  
  // Calculate Zakat Emas & Perak
  const hitungZakatEmasPerak = () => {
    const nilaiEmas = beratEmas * hargaEmas;
    const nilaiPerak = beratPerak * hargaPerak;
    const totalNilai = nilaiEmas + nilaiPerak;
    
    // Nisab for gold and silver
    const nisabEmas = NISAB_EMAS_GRAM * hargaEmas;
    const nisabPerak = NISAB_PERAK_GRAM * hargaPerak;
    
    // Check if gold or silver reaches nisab
    const mencapaiNisabEmas = beratEmas >= NISAB_EMAS_GRAM;
    const mencapaiNisabPerak = beratPerak >= NISAB_PERAK_GRAM;
    
    // Calculate zakat (2.5% of total value)
    const zakatEmasPerak = totalNilai * ZAKAT_RATE;
    
    setHasilZakatEmasPerak({
      beratEmas,
      beratPerak,
      nilaiEmas,
      nilaiPerak,
      totalNilai,
      nisabEmas,
      nisabPerak,
      zakatEmasPerak,
      mencapaiNisabEmas,
      mencapaiNisabPerak
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate zakat when inputs change
  useEffect(() => {
    if (activeTab === 'penghasilan') {
      hitungZakatPenghasilan();
    } else if (activeTab === 'maal') {
      hitungZakatMaal();
    } else if (activeTab === 'emas') {
      hitungZakatEmasPerak();
    }
  }, [
    activeTab, hargaEmas, hargaPerak,
    penghasilanBulanan, pendapatanLain, pengeluaranPokok, hutangCicilan,
    uangTunai, tabungan, investasi, emasPerak, properti, kendaraan, hutang, kebutuhanPokok,
    beratEmas, beratPerak
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full mb-4">
            <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Kalkulator Zakat Profesional
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bantu hitung zakat penghasilan dan maal sesuai aturan.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Tentang Zakat
              </h3>
              <p className="text-emerald-800 dark:text-emerald-200 mb-2">
                Zakat adalah kewajiban finansial dalam Islam yang mengharuskan individu untuk menyumbangkan sebagian dari kekayaan mereka kepada yang membutuhkan jika telah mencapai nisab (batas minimum).
              </p>
              <p className="text-emerald-800 dark:text-emerald-200">
                Kalkulator ini membantu Anda menghitung zakat penghasilan (2.5% dari penghasilan bersih) dan zakat maal (2.5% dari aset yang telah dimiliki selama 1 tahun dan mencapai nisab).
              </p>
            </div>
          </div>
        </div>

        {/* Harga Emas Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Harga Emas & Perak Saat Ini
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga Emas per Gram
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">Rp</span>
                </div>
                <input
                  type="number"
                  placeholder="1000000"
                  value={hargaEmas || ''}
                  onChange={(e) => setHargaEmas(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nisab Zakat: {NISAB_EMAS_GRAM} gram emas = {formatCurrency(NISAB_EMAS_GRAM * hargaEmas)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harga Perak per Gram
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400">Rp</span>
                </div>
                <input
                  type="number"
                  placeholder="15000"
                  value={hargaPerak || ''}
                  onChange={(e) => setHargaPerak(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Nisab Zakat: {NISAB_PERAK_GRAM} gram perak = {formatCurrency(NISAB_PERAK_GRAM * hargaPerak)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
            <button 
              onClick={() => setActiveTab('penghasilan')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'penghasilan'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Zakat Penghasilan
            </button>
            <button 
              onClick={() => setActiveTab('maal')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'maal'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Zakat Maal
            </button>
            <button 
              onClick={() => setActiveTab('emas')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'emas'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Zakat Emas & Perak
            </button>
            <button 
              onClick={() => setActiveTab('perdagangan')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'perdagangan'
                  ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Zakat Perdagangan
            </button>
          </div>

          {/* Zakat Penghasilan Form */}
          {activeTab === 'penghasilan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Penghasilan Bulanan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="10000000"
                      value={penghasilanBulanan || ''}
                      onChange={(e) => setPenghasilanBulanan(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pendapatan Lain (Bonus, THR, dll)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={pendapatanLain || ''}
                      onChange={(e) => setPendapatanLain(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pengeluaran Pokok Bulanan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="5000000"
                      value={pengeluaranPokok || ''}
                      onChange={(e) => setPengeluaranPokok(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hutang/Cicilan Bulanan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={hutangCicilan || ''}
                      onChange={(e) => setHutangCicilan(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={hitungZakatPenghasilan}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Zakat</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {hasilZakatPenghasilan && (
                  <>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-center">
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                          Zakat Penghasilan Bulanan
                        </div>
                        <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                          {formatCurrency(hasilZakatPenghasilan.zakatBulanan)}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          2.5% dari penghasilan bersih
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Penghasilan</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatPenghasilan.totalPenghasilan)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Pengeluaran</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatPenghasilan.totalPengeluaran)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700 dark:text-gray-300">Penghasilan Bersih</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatPenghasilan.penghasilanBersih)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Nisab ({NISAB_EMAS_GRAM} gram emas)</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatPenghasilan.nisab)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            hasilZakatPenghasilan.mencapaiNisab
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {hasilZakatPenghasilan.mencapaiNisab ? 'Mencapai Nisab' : 'Belum Mencapai Nisab'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Catatan:</strong> {hasilZakatPenghasilan.mencapaiNisab 
                          ? 'Penghasilan Anda telah mencapai nisab. Anda wajib membayar zakat penghasilan sebesar 2.5% dari penghasilan bersih.' 
                          : 'Meskipun penghasilan bulanan belum mencapai nisab, jika total penghasilan tahunan mencapai nisab, Anda tetap wajib membayar zakat.'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Zakat Maal Form */}
          {activeTab === 'maal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Uang Tunai
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={uangTunai || ''}
                      onChange={(e) => setUangTunai(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tabungan/Deposito
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={tabungan || ''}
                      onChange={(e) => setTabungan(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Investasi/Saham
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={investasi || ''}
                      onChange={(e) => setInvestasi(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emas/Perak (Nilai)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={emasPerak || ''}
                      onChange={(e) => setEmasPerak(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Properti (untuk Investasi)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={properti || ''}
                      onChange={(e) => setProperti(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kendaraan (untuk Investasi)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={kendaraan || ''}
                      onChange={(e) => setKendaraan(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hutang
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={hutang || ''}
                      onChange={(e) => setHutang(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kebutuhan Pokok
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">Rp</span>
                    </div>
                    <input
                      type="number"
                      placeholder="0"
                      value={kebutuhanPokok || ''}
                      onChange={(e) => setKebutuhanPokok(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={hitungZakatMaal}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Zakat Maal</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {hasilZakatMaal && (
                  <>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-center">
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                          Zakat Maal
                        </div>
                        <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                          {formatCurrency(hasilZakatMaal.zakatMaal)}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          2.5% dari harta bersih
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Harta</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatMaal.totalHarta)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Hutang & Kebutuhan</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatMaal.totalHutang)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700 dark:text-gray-300">Harta Bersih</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatMaal.hartaBersih)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Nisab ({NISAB_EMAS_GRAM} gram emas)</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatMaal.nisab)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            hasilZakatMaal.mencapaiNisab
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {hasilZakatMaal.mencapaiNisab ? 'Mencapai Nisab' : 'Belum Mencapai Nisab'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Catatan:</strong> Zakat maal wajib dikeluarkan jika harta telah mencapai nisab dan telah dimiliki selama 1 tahun hijriah (haul).
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Zakat Emas & Perak Form */}
          {activeTab === 'emas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Berat Emas (gram)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={beratEmas || ''}
                    onChange={(e) => setBeratEmas(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Berat Perak (gram)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={beratPerak || ''}
                    onChange={(e) => setBeratPerak(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <button 
                  onClick={hitungZakatEmasPerak}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Hitung Zakat Emas & Perak</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {hasilZakatEmasPerak && (
                  <>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-center">
                        <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                          Zakat Emas & Perak
                        </div>
                        <div className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
                          {formatCurrency(hasilZakatEmasPerak.zakatEmasPerak)}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                          2.5% dari total nilai
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nilai Emas</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatEmasPerak.nilaiEmas)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Nilai Perak</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatEmasPerak.nilaiPerak)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-700 dark:text-gray-300">Total Nilai</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatEmasPerak.totalNilai)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Nisab Emas ({NISAB_EMAS_GRAM} gram)</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatEmasPerak.nisabEmas)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Nisab Perak ({NISAB_PERAK_GRAM} gram)</span>
                          <span className="text-gray-900 dark:text-white">{formatCurrency(hasilZakatEmasPerak.nisabPerak)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status Emas</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            hasilZakatEmasPerak.mencapaiNisabEmas
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {hasilZakatEmasPerak.mencapaiNisabEmas ? 'Mencapai Nisab' : 'Belum Mencapai Nisab'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status Perak</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            hasilZakatEmasPerak.mencapaiNisabPerak
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {hasilZakatEmasPerak.mencapaiNisabPerak ? 'Mencapai Nisab' : 'Belum Mencapai Nisab'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Catatan:</strong> Zakat emas dan perak wajib dikeluarkan jika telah mencapai nisab dan telah dimiliki selama 1 tahun hijriah (haul).
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Zakat Perdagangan Form (Placeholder) */}
          {activeTab === 'perdagangan' && (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PiggyBank className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kalkulator Zakat Perdagangan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Fitur ini akan segera tersedia. Zakat perdagangan dihitung 2.5% dari modal dan keuntungan yang telah mencapai nisab dan dimiliki selama 1 tahun hijriah.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🕌</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sesuai Syariah</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Perhitungan berdasarkan ketentuan syariah yang berlaku
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi Jenis Zakat</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hitung zakat penghasilan, maal, emas, dan perdagangan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">💎</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Update Nisab</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nilai nisab selalu diperbarui sesuai harga emas terkini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZakatCalculator;