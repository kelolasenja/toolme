import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, ArrowRightLeft, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';

// Struktur data lengkap untuk semua faktor konversi
const faktorKonversi = {
  panjang: { // Unit dasar: Meter
    meter: 1,
    kilometer: 1000,
    sentimeter: 0.01,
    milimeter: 0.001,
    mikrometer: 0.000001,
    nanometer: 0.000000001,
    mil: 1609.34,
    yard: 0.9144,
    kaki: 0.3048,
    inci: 0.0254,
    mil_laut: 1852,
    furlong: 201.168,
    chain: 20.1168,
    rod: 5.0292,
    fathom: 1.8288
  },
  
  luas: { // Unit dasar: Meter persegi
    meter_persegi: 1,
    kilometer_persegi: 1000000,
    sentimeter_persegi: 0.0001,
    milimeter_persegi: 0.000001,
    hektar: 10000,
    are: 100,
    acre: 4046.86,
    kaki_persegi: 0.092903,
    inci_persegi: 0.00064516,
    yard_persegi: 0.836127,
    mil_persegi: 2589988.11
  },
  
  volume: { // Unit dasar: Liter
    liter: 1,
    mililiter: 0.001,
    meter_kubik: 1000,
    sentimeter_kubik: 0.001,
    kiloliter: 1000,
    galon_us: 3.78541,
    galon_uk: 4.54609,
    quart_us: 0.946353,
    pint_us: 0.473176,
    cup_us: 0.236588,
    fluid_ounce_us: 0.0295735,
    tablespoon_us: 0.0147868,
    teaspoon_us: 0.00492892,
    barrel_oil: 158.987,
    kaki_kubik: 28.3168,
    inci_kubik: 0.0163871
  },
  
  berat_massa: { // Unit dasar: Kilogram
    kilogram: 1,
    gram: 0.001,
    miligram: 0.000001,
    mikrogram: 0.000000001,
    ton_metrik: 1000,
    pon: 0.453592,
    ons: 0.0283495,
    stone: 6.35029,
    hundredweight_us: 45.3592,
    hundredweight_uk: 50.8023,
    ton_us: 907.185,
    ton_uk: 1016.05,
    grain: 0.0000647989,
    dram: 0.00177185,
    carat: 0.0002,
    atomic_mass_unit: 1.66054e-27
  },
  
  suhu: { // Khusus - tidak menggunakan faktor konversi sederhana
    celsius: 'celsius',
    fahrenheit: 'fahrenheit',
    kelvin: 'kelvin',
    rankine: 'rankine',
    reaumur: 'reaumur'
  },
  
  kecepatan: { // Unit dasar: Meter per detik
    meter_per_detik: 1,
    kilometer_per_jam: 0.277778,
    mil_per_jam: 0.44704,
    kaki_per_detik: 0.3048,
    knot: 0.514444,
    mach: 343,
    kecepatan_cahaya: 299792458
  },
  
  waktu: { // Unit dasar: Detik
    detik: 1,
    menit: 60,
    jam: 3600,
    hari: 86400,
    minggu: 604800,
    bulan: 2629746, // rata-rata
    tahun: 31556952, // rata-rata
    dekade: 315569520,
    abad: 3155695200,
    milenium: 31556952000,
    milidetik: 0.001,
    mikrodetik: 0.000001,
    nanodetik: 0.000000001
  },
  
  penyimpanan_data: { // Unit dasar: Byte
    byte: 1,
    bit: 0.125,
    kilobyte: 1024,
    megabyte: 1048576,
    gigabyte: 1073741824,
    terabyte: 1099511627776,
    petabyte: 1125899906842624,
    exabyte: 1152921504606846976,
    kibibyte: 1024,
    mebibyte: 1048576,
    gibibyte: 1073741824,
    tebibyte: 1099511627776
  },
  
  kecepatan_transfer_data: { // Unit dasar: Bit per detik
    bit_per_detik: 1,
    byte_per_detik: 8,
    kilobit_per_detik: 1000,
    megabit_per_detik: 1000000,
    gigabit_per_detik: 1000000000,
    terabit_per_detik: 1000000000000,
    kilobyte_per_detik: 8000,
    megabyte_per_detik: 8000000,
    gigabyte_per_detik: 8000000000
  },
  
  tekanan: { // Unit dasar: Pascal
    pascal: 1,
    kilopascal: 1000,
    megapascal: 1000000,
    bar: 100000,
    millibar: 100,
    atmosphere: 101325,
    torr: 133.322,
    mmhg: 133.322,
    psi: 6894.76,
    ksi: 6894760
  },
  
  daya: { // Unit dasar: Watt
    watt: 1,
    kilowatt: 1000,
    megawatt: 1000000,
    gigawatt: 1000000000,
    horsepower_metric: 735.499,
    horsepower_mechanical: 745.7,
    horsepower_electrical: 746,
    btu_per_hour: 0.293071,
    calorie_per_second: 4.184
  },
  
  energi: { // Unit dasar: Joule
    joule: 1,
    kilojoule: 1000,
    megajoule: 1000000,
    gigajoule: 1000000000,
    calorie: 4.184,
    kilocalorie: 4184,
    btu: 1055.06,
    watt_hour: 3600,
    kilowatt_hour: 3600000,
    electron_volt: 1.60218e-19,
    therm: 105505600,
    foot_pound: 1.35582
  },
  
  sudut: { // Unit dasar: Radian
    radian: 1,
    degree: 0.0174533,
    gradian: 0.0157080,
    turn: 6.28319,
    arcminute: 0.000290888,
    arcsecond: 0.00000484814,
    mil: 0.000981748
  }
};

// Daftar unit untuk setiap kategori
const unitOptions = {
  panjang: [
    { value: 'meter', label: 'Meter (m)' },
    { value: 'kilometer', label: 'Kilometer (km)' },
    { value: 'sentimeter', label: 'Sentimeter (cm)' },
    { value: 'milimeter', label: 'Milimeter (mm)' },
    { value: 'mikrometer', label: 'Mikrometer (μm)' },
    { value: 'nanometer', label: 'Nanometer (nm)' },
    { value: 'mil', label: 'Mil (mi)' },
    { value: 'yard', label: 'Yard (yd)' },
    { value: 'kaki', label: 'Kaki (ft)' },
    { value: 'inci', label: 'Inci (in)' },
    { value: 'mil_laut', label: 'Mil Laut (nmi)' },
    { value: 'furlong', label: 'Furlong' },
    { value: 'chain', label: 'Chain' },
    { value: 'rod', label: 'Rod' },
    { value: 'fathom', label: 'Fathom' }
  ],
  
  luas: [
    { value: 'meter_persegi', label: 'Meter Persegi (m²)' },
    { value: 'kilometer_persegi', label: 'Kilometer Persegi (km²)' },
    { value: 'sentimeter_persegi', label: 'Sentimeter Persegi (cm²)' },
    { value: 'milimeter_persegi', label: 'Milimeter Persegi (mm²)' },
    { value: 'hektar', label: 'Hektar (ha)' },
    { value: 'are', label: 'Are' },
    { value: 'acre', label: 'Acre' },
    { value: 'kaki_persegi', label: 'Kaki Persegi (ft²)' },
    { value: 'inci_persegi', label: 'Inci Persegi (in²)' },
    { value: 'yard_persegi', label: 'Yard Persegi (yd²)' },
    { value: 'mil_persegi', label: 'Mil Persegi (mi²)' }
  ],
  
  volume: [
    { value: 'liter', label: 'Liter (L)' },
    { value: 'mililiter', label: 'Mililiter (mL)' },
    { value: 'meter_kubik', label: 'Meter Kubik (m³)' },
    { value: 'sentimeter_kubik', label: 'Sentimeter Kubik (cm³)' },
    { value: 'kiloliter', label: 'Kiloliter (kL)' },
    { value: 'galon_us', label: 'Galon US (gal)' },
    { value: 'galon_uk', label: 'Galon UK (gal)' },
    { value: 'quart_us', label: 'Quart US (qt)' },
    { value: 'pint_us', label: 'Pint US (pt)' },
    { value: 'cup_us', label: 'Cup US' },
    { value: 'fluid_ounce_us', label: 'Fluid Ounce US (fl oz)' },
    { value: 'tablespoon_us', label: 'Tablespoon US (tbsp)' },
    { value: 'teaspoon_us', label: 'Teaspoon US (tsp)' },
    { value: 'barrel_oil', label: 'Barrel Oil (bbl)' },
    { value: 'kaki_kubik', label: 'Kaki Kubik (ft³)' },
    { value: 'inci_kubik', label: 'Inci Kubik (in³)' }
  ],
  
  berat_massa: [
    { value: 'kilogram', label: 'Kilogram (kg)' },
    { value: 'gram', label: 'Gram (g)' },
    { value: 'miligram', label: 'Miligram (mg)' },
    { value: 'mikrogram', label: 'Mikrogram (μg)' },
    { value: 'ton_metrik', label: 'Ton Metrik (t)' },
    { value: 'pon', label: 'Pon (lb)' },
    { value: 'ons', label: 'Ons (oz)' },
    { value: 'stone', label: 'Stone (st)' },
    { value: 'hundredweight_us', label: 'Hundredweight US (cwt)' },
    { value: 'hundredweight_uk', label: 'Hundredweight UK (cwt)' },
    { value: 'ton_us', label: 'Ton US' },
    { value: 'ton_uk', label: 'Ton UK' },
    { value: 'grain', label: 'Grain (gr)' },
    { value: 'dram', label: 'Dram (dr)' },
    { value: 'carat', label: 'Carat (ct)' },
    { value: 'atomic_mass_unit', label: 'Atomic Mass Unit (u)' }
  ],
  
  suhu: [
    { value: 'celsius', label: 'Celsius (°C)' },
    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
    { value: 'kelvin', label: 'Kelvin (K)' },
    { value: 'rankine', label: 'Rankine (°R)' },
    { value: 'reaumur', label: 'Réaumur (°Ré)' }
  ],
  
  kecepatan: [
    { value: 'meter_per_detik', label: 'Meter per Detik (m/s)' },
    { value: 'kilometer_per_jam', label: 'Kilometer per Jam (km/h)' },
    { value: 'mil_per_jam', label: 'Mil per Jam (mph)' },
    { value: 'kaki_per_detik', label: 'Kaki per Detik (ft/s)' },
    { value: 'knot', label: 'Knot (kn)' },
    { value: 'mach', label: 'Mach' },
    { value: 'kecepatan_cahaya', label: 'Kecepatan Cahaya (c)' }
  ],
  
  waktu: [
    { value: 'detik', label: 'Detik (s)' },
    { value: 'menit', label: 'Menit (min)' },
    { value: 'jam', label: 'Jam (h)' },
    { value: 'hari', label: 'Hari' },
    { value: 'minggu', label: 'Minggu' },
    { value: 'bulan', label: 'Bulan' },
    { value: 'tahun', label: 'Tahun' },
    { value: 'dekade', label: 'Dekade' },
    { value: 'abad', label: 'Abad' },
    { value: 'milenium', label: 'Milenium' },
    { value: 'milidetik', label: 'Milidetik (ms)' },
    { value: 'mikrodetik', label: 'Mikrodetik (μs)' },
    { value: 'nanodetik', label: 'Nanodetik (ns)' }
  ],
  
  penyimpanan_data: [
    { value: 'byte', label: 'Byte (B)' },
    { value: 'bit', label: 'Bit (b)' },
    { value: 'kilobyte', label: 'Kilobyte (KB)' },
    { value: 'megabyte', label: 'Megabyte (MB)' },
    { value: 'gigabyte', label: 'Gigabyte (GB)' },
    { value: 'terabyte', label: 'Terabyte (TB)' },
    { value: 'petabyte', label: 'Petabyte (PB)' },
    { value: 'exabyte', label: 'Exabyte (EB)' },
    { value: 'kibibyte', label: 'Kibibyte (KiB)' },
    { value: 'mebibyte', label: 'Mebibyte (MiB)' },
    { value: 'gibibyte', label: 'Gibibyte (GiB)' },
    { value: 'tebibyte', label: 'Tebibyte (TiB)' }
  ],
  
  kecepatan_transfer_data: [
    { value: 'bit_per_detik', label: 'Bit per Detik (bps)' },
    { value: 'byte_per_detik', label: 'Byte per Detik (Bps)' },
    { value: 'kilobit_per_detik', label: 'Kilobit per Detik (kbps)' },
    { value: 'megabit_per_detik', label: 'Megabit per Detik (Mbps)' },
    { value: 'gigabit_per_detik', label: 'Gigabit per Detik (Gbps)' },
    { value: 'terabit_per_detik', label: 'Terabit per Detik (Tbps)' },
    { value: 'kilobyte_per_detik', label: 'Kilobyte per Detik (KBps)' },
    { value: 'megabyte_per_detik', label: 'Megabyte per Detik (MBps)' },
    { value: 'gigabyte_per_detik', label: 'Gigabyte per Detik (GBps)' }
  ],
  
  tekanan: [
    { value: 'pascal', label: 'Pascal (Pa)' },
    { value: 'kilopascal', label: 'Kilopascal (kPa)' },
    { value: 'megapascal', label: 'Megapascal (MPa)' },
    { value: 'bar', label: 'Bar' },
    { value: 'millibar', label: 'Millibar (mbar)' },
    { value: 'atmosphere', label: 'Atmosphere (atm)' },
    { value: 'torr', label: 'Torr' },
    { value: 'mmhg', label: 'mmHg' },
    { value: 'psi', label: 'PSI (psi)' },
    { value: 'ksi', label: 'KSI (ksi)' }
  ],
  
  daya: [
    { value: 'watt', label: 'Watt (W)' },
    { value: 'kilowatt', label: 'Kilowatt (kW)' },
    { value: 'megawatt', label: 'Megawatt (MW)' },
    { value: 'gigawatt', label: 'Gigawatt (GW)' },
    { value: 'horsepower_metric', label: 'Horsepower (Metric)' },
    { value: 'horsepower_mechanical', label: 'Horsepower (Mechanical)' },
    { value: 'horsepower_electrical', label: 'Horsepower (Electrical)' },
    { value: 'btu_per_hour', label: 'BTU per Hour' },
    { value: 'calorie_per_second', label: 'Calorie per Second' }
  ],
  
  energi: [
    { value: 'joule', label: 'Joule (J)' },
    { value: 'kilojoule', label: 'Kilojoule (kJ)' },
    { value: 'megajoule', label: 'Megajoule (MJ)' },
    { value: 'gigajoule', label: 'Gigajoule (GJ)' },
    { value: 'calorie', label: 'Calorie (cal)' },
    { value: 'kilocalorie', label: 'Kilocalorie (kcal)' },
    { value: 'btu', label: 'BTU' },
    { value: 'watt_hour', label: 'Watt Hour (Wh)' },
    { value: 'kilowatt_hour', label: 'Kilowatt Hour (kWh)' },
    { value: 'electron_volt', label: 'Electron Volt (eV)' },
    { value: 'therm', label: 'Therm' },
    { value: 'foot_pound', label: 'Foot-Pound (ft⋅lbf)' }
  ],
  
  sudut: [
    { value: 'radian', label: 'Radian (rad)' },
    { value: 'degree', label: 'Degree (°)' },
    { value: 'gradian', label: 'Gradian (gon)' },
    { value: 'turn', label: 'Turn' },
    { value: 'arcminute', label: 'Arcminute (\')' },
    { value: 'arcsecond', label: 'Arcsecond (\'\')' },
    { value: 'mil', label: 'Mil' }
  ]
};

const UnitConverter: React.FC = () => {
  const [kategori, setKategori] = useState('panjang');
  const [nilaiInput, setNilaiInput] = useState('');
  const [unitAsal, setUnitAsal] = useState('meter');
  const [unitTujuan, setUnitTujuan] = useState('kilometer');
  const [hasil, setHasil] = useState('');

  // Fungsi konversi suhu khusus
  const konversiSuhu = (nilai: number, dari: string, ke: string): number => {
    if (dari === ke) return nilai;

    // Konversi ke Celsius terlebih dahulu
    let celsius: number;
    switch (dari) {
      case 'celsius':
        celsius = nilai;
        break;
      case 'fahrenheit':
        celsius = (nilai - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = nilai - 273.15;
        break;
      case 'rankine':
        celsius = (nilai - 491.67) * 5/9;
        break;
      case 'reaumur':
        celsius = nilai * 5/4;
        break;
      default:
        celsius = nilai;
    }

    // Konversi dari Celsius ke unit tujuan
    switch (ke) {
      case 'celsius':
        return celsius;
      case 'fahrenheit':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      case 'rankine':
        return (celsius + 273.15) * 9/5;
      case 'reaumur':
        return celsius * 4/5;
      default:
        return celsius;
    }
  };

  // Fungsi konversi utama
  const konversiUnit = () => {
    const nilai = parseFloat(nilaiInput);
    
    if (isNaN(nilai)) {
      setHasil('');
      return;
    }

    if (kategori === 'suhu') {
      const hasilKonversi = konversiSuhu(nilai, unitAsal, unitTujuan);
      setHasil(formatHasil(hasilKonversi));
    } else {
      const faktor = faktorKonversi[kategori];
      if (!faktor) {
        setHasil('Error: Kategori tidak ditemukan');
        return;
      }

      // Konversi ke unit dasar, lalu ke unit tujuan
      const nilaiDasar = nilai * faktor[unitAsal];
      const hasilKonversi = nilaiDasar / faktor[unitTujuan];
      
      setHasil(formatHasil(hasilKonversi));
    }
  };

  // Format hasil dengan notasi ilmiah untuk angka sangat besar/kecil
  const formatHasil = (nilai: number): string => {
    if (nilai === 0) return '0';
    
    const absNilai = Math.abs(nilai);
    
    if (absNilai >= 1e15 || absNilai <= 1e-6) {
      return nilai.toExponential(6);
    } else if (absNilai >= 1e6) {
      return nilai.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    } else {
      return nilai.toLocaleString('id-ID', { maximumFractionDigits: 8 }).replace(/\.?0+$/, '');
    }
  };

  // Update unit saat kategori berubah
  useEffect(() => {
    const units = unitOptions[kategori];
    if (units && units.length > 0) {
      setUnitAsal(units[0].value);
      setUnitTujuan(units[1]?.value || units[0].value);
    }
  }, [kategori]);

  // Konversi otomatis saat ada perubahan
  useEffect(() => {
    konversiUnit();
  }, [nilaiInput, unitAsal, unitTujuan, kategori]);

  const tukarUnit = () => {
    const tempUnit = unitAsal;
    setUnitAsal(unitTujuan);
    setUnitTujuan(tempUnit);
  };

  const resetForm = () => {
    setNilaiInput('');
    setHasil('');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
            <RotateCcw className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Konverter Unit Lengkap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Konversi berbagai satuan dengan mudah dan akurat. Mendukung 13 kategori unit dengan lebih dari 100 satuan berbeda.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-3">
            Cara Menggunakan:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-indigo-800 dark:text-indigo-200">
            <li>Pilih kategori unit yang ingin dikonversi</li>
            <li>Masukkan nilai yang ingin dikonversi</li>
            <li>Pilih unit asal dan unit tujuan</li>
            <li>Hasil konversi akan muncul secara otomatis</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Pilih Kategori
              </h3>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="panjang">📏 Panjang</option>
                <option value="luas">📐 Luas</option>
                <option value="volume">🧊 Volume</option>
                <option value="berat_massa">⚖️ Berat/Massa</option>
                <option value="suhu">🌡️ Suhu</option>
                <option value="kecepatan">🚗 Kecepatan</option>
                <option value="waktu">⏰ Waktu</option>
                <option value="penyimpanan_data">💾 Penyimpanan Data</option>
                <option value="kecepatan_transfer_data">📡 Kecepatan Transfer Data</option>
                <option value="tekanan">🔧 Tekanan</option>
                <option value="daya">⚡ Daya</option>
                <option value="energi">🔋 Energi</option>
                <option value="sudut">📐 Sudut</option>
              </select>
            </div>

            {/* Input Value */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Masukkan Nilai
              </h3>
              <input
                type="number"
                value={nilaiInput}
                onChange={(e) => setNilaiInput(e.target.value)}
                placeholder="Masukkan nilai..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <button
                  onClick={tukarUnit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Tukar Unit</span>
                </button>
                <button
                  onClick={resetForm}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Conversion Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* From/To Units */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                3. Pilih Unit Konversi
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dari Unit
                  </label>
                  <select
                    value={unitAsal}
                    onChange={(e) => setUnitAsal(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {unitOptions[kategori]?.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* To Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ke Unit
                  </label>
                  <select
                    value={unitTujuan}
                    onChange={(e) => setUnitTujuan(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {unitOptions[kategori]?.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Hasil Konversi
              </h3>
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-700">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {nilaiInput || '0'} {unitOptions[kategori]?.find(u => u.value === unitAsal)?.label.split(' ')[0] || ''}
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    =
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {hasil || '0'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {unitOptions[kategori]?.find(u => u.value === unitTujuan)?.label || ''}
                  </div>
                </div>
              </div>

              {hasil && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigator.clipboard.writeText(hasil)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Salin Hasil</span>
                  </button>
                </div>
              )}
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
              Perhitungan presisi tinggi dengan faktor konversi standar internasional
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real-time</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hasil konversi muncul secara otomatis saat Anda mengetik
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Lengkap</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              13 kategori dengan 100+ unit berbeda untuk semua kebutuhan
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🌡️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Suhu Khusus</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Konversi suhu dengan rumus khusus untuk hasil yang tepat
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;